const SITE_URL = (process.env.SITE_URL || 'https://ai-readiness-pass.netlify.app').replace(/\/$/, '');
const CUSTOM_DOMAIN = (process.env.CUSTOM_DOMAIN || 'https://aikollege.com').replace(/\/$/, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function get(path, init = {}) {
  const response = await fetch(`${SITE_URL}${path}`, { redirect: 'manual', ...init });
  return response;
}

// Wait for Netlify auto-publish of the current release branch. The purchase
// success page is a recent release-only marker and avoids testing a stale deploy.
let deployed = false;
for (let attempt = 1; attempt <= 24; attempt += 1) {
  try {
    const response = await get('/purchase-success.html');
    if (response.status === 200) {
      const text = await response.text();
      if (/payment verification|purchase|onboarding/i.test(text)) {
        deployed = true;
        console.log(`Current release marker found on attempt ${attempt}.`);
        break;
      }
    }
  } catch {}
  await sleep(5000);
}
record('current Netlify release is deployed', deployed, SITE_URL);
if (!deployed) process.exit(1);

const publicRoutes = [
  '/', '/index.html', '/courses.html', '/badge.html', '/privacy.html',
  '/checklist.html', '/checklist-start.html', '/lab.html', '/booking.html',
  '/answers.html', '/refunds.html', '/thanks.html', '/purchase-success.html',
  '/sitemap.xml', '/robots.txt', '/favicon.svg', '/site.webmanifest'
];
for (const path of publicRoutes) {
  try {
    const response = await get(path);
    record(`GET ${path}`, response.status === 200, `HTTP ${response.status}`);
  } catch (error) {
    record(`GET ${path}`, false, String(error.message || error));
  }
}

const protectedRoutes = ['/docs/', '/lib/', '/tests/', '/course/level-1-ai-readiness-foundations.md', '/netlify.toml'];
for (const path of protectedRoutes) {
  try {
    const response = await get(path);
    record(`protected ${path}`, response.status === 404, `HTTP ${response.status}`);
  } catch (error) {
    record(`protected ${path}`, false, String(error.message || error));
  }
}

// Homepage schema must be syntactically valid JSON-LD.
try {
  const html = await (await get('/')).text();
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let valid = blocks.length > 0;
  for (const match of blocks) {
    try { JSON.parse(match[1]); } catch { valid = false; }
  }
  record('homepage JSON-LD schema parses', valid, `${blocks.length} block(s)`);
} catch (error) {
  record('homepage JSON-LD schema parses', false, String(error.message || error));
}

// Inspect live site config without printing sensitive values (this file should
// never contain secrets anyway). These results tell us which external gates are
// actually configured on the deployed build.
try {
  const cfg = await (await get('/assets/site-config.js')).text();
  const hasBooking = /bookingUrl:\s*['"]https:\/\//.test(cfg);
  const hasGA = /googleAnalyticsId:\s*['"]G-[A-Z0-9]+/i.test(cfg);
  const hasPlausible = /plausibleDomain:\s*['"][^'"]+/.test(cfg);
  const hasStarter = /aiStarterPass:\s*['"]https:\/\//.test(cfg);
  const hasJob = /aiJobProductivityPass:\s*['"]https:\/\//.test(cfg);
  const secretaryEnabled = /enabled:\s*true/.test(cfg);
  record('booking URL configured', hasBooking);
  record('analytics configured', hasGA || hasPlausible, hasGA ? 'Google Analytics' : hasPlausible ? 'Plausible' : 'none');
  record('Starter Stripe URL configured', hasStarter);
  record('Job Stripe URL configured', hasJob);
  record('Secretary widget enabled', secretaryEnabled);
} catch (error) {
  record('live site config readable', false, String(error.message || error));
}

// Secretary: 200 means configured and functional; 503 is a clean fail-closed
// signal that ANTHROPIC_API_KEY is still absent/not visible to the function.
try {
  const response = await get('/api/secretary', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'What is the AI Starter Pass?', channel: 'live-smoke' })
  });
  const body = await response.json().catch(() => ({}));
  record('AI Secretary live configuration', response.status === 200, `HTTP ${response.status} ${body.error || ''}`.trim());
} catch (error) {
  record('AI Secretary live configuration', false, String(error.message || error));
}

// Owner assistant without a token must be 401 when configured. A 503 means its
// required environment variables are not installed yet.
try {
  const response = await get('/api/assistant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'today' })
  });
  const body = await response.json().catch(() => ({}));
  record('Owner assistant security boundary', response.status === 401, `HTTP ${response.status} ${body.error || ''}`.trim());
} catch (error) {
  record('Owner assistant security boundary', false, String(error.message || error));
}

// A bogus WhatsApp verification token must never verify. 403 is the desired
// response when Meta verification is configured; other fail-closed statuses are
// reported for setup diagnosis.
try {
  const response = await get('/api/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=definitely-wrong&hub.challenge=smoke');
  record('WhatsApp rejects invalid verification token', response.status === 403 || response.status === 401, `HTTP ${response.status}`);
} catch (error) {
  record('WhatsApp rejects invalid verification token', false, String(error.message || error));
}

// Custom-domain + TLS reachability. Node fetch validates the TLS certificate.
try {
  const response = await fetch(`${CUSTOM_DOMAIN}/`, { redirect: 'manual' });
  record('custom domain HTTPS reachable', response.status >= 200 && response.status < 400, `HTTP ${response.status}`);
} catch (error) {
  record('custom domain HTTPS reachable', false, String(error.message || error));
}

console.log('\n--- LIVE SMOKE SUMMARY ---');
for (const item of results) console.log(`${item.ok ? 'PASS' : 'OPEN'} | ${item.name}${item.detail ? ` | ${item.detail}` : ''}`);

// Fail only on core site integrity/security failures. External integration
// configuration gaps are intentionally reported as OPEN so this audit can tell
// us what remains without pretending those credentials exist.
const criticalPrefixes = ['current Netlify release is deployed', 'GET ', 'protected ', 'homepage JSON-LD schema parses', 'booking URL configured', 'WhatsApp rejects invalid verification token'];
const criticalFailures = results.filter((item) => !item.ok && criticalPrefixes.some((prefix) => item.name.startsWith(prefix)));
if (criticalFailures.length) {
  console.error(`\n${criticalFailures.length} critical live smoke failure(s).`);
  process.exit(1);
}
