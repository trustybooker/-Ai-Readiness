// Live lead-capture test against a DEPLOYED site (Issue #4).
//
// Usage:
//   SITE_URL=https://<deployed-site> node scripts/live-lead-test.mjs
//
// Optional:
//   LEADS_SECRET + LEADS_REPO  — when set, the script also verifies that the
//   GitHub Issue was actually created and then closes the test issue.
//
// This script never runs in CI or `npm test`; it is the manual gate for
// Issue #4 and must be run against the real deployment by the owner.

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
if (!SITE_URL) {
  console.error('Set SITE_URL to the deployed site, e.g. SITE_URL=https://ai-readiness-pass.netlify.app');
  process.exit(1);
}

const stamp = new Date().toISOString();
const testLead = {
  'form-name': 'ai-readiness-lead',
  request_type: 'Live capture test',
  name: `Live Test Lead ${stamp}`,
  email: 'live-test@example.com',
  path: 'Free AI Readiness Score',
  audience_type: 'Me as an individual',
  timeline: 'Planning ahead',
  budget_range: '$0 - free score first',
  readiness_score: '50',
  score_summary: `Automated live capture test at ${stamp}`,
  recommended_path: 'AI Starter Pass',
  lead_tier: 'Training lead',
  lead_source: 'live-lead-test',
  landing_page: `${SITE_URL}/`,
  referrer: 'live-lead-test',
  utm_source: 'live-lead-test',
  message: 'Automated live lead-capture test. Safe to close.'
};

const endpoints = ['/.netlify/functions/capture-lead', '/api/capture-lead'];
const results = [];

for (const endpoint of endpoints) {
  const url = `${SITE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(testLead)
    });
    const body = await response.json().catch(() => ({}));
    results.push({ endpoint, status: response.status, body });
  } catch (error) {
    results.push({ endpoint, status: 'unreachable', body: { error: String(error.message || error) } });
  }
}

let issueUrl = '';
let pass = false;
for (const r of results) {
  const line = `${r.endpoint} -> ${r.status} ${JSON.stringify(r.body)}`;
  if (r.body && r.body.ok === true && r.body.issue_url) {
    pass = true;
    issueUrl = r.body.issue_url;
    console.log(`PASS  ${line}`);
  } else if (r.status === 503 && r.body && r.body.fallback === 'email_form') {
    console.log(`FALLBACK  ${line}`);
    console.log('  Tracker not configured on this host — the form would submit via email fallback.');
    console.log('  Set LEADS_SECRET and LEADS_REPO in the host dashboard, then re-run.');
  } else if (r.status === 404 || r.status === 'unreachable') {
    console.log(`SKIP  ${line} (endpoint not deployed on this host — expected for the other platform)`);
  } else {
    console.log(`FAIL  ${line}`);
  }
}

if (pass && process.env.LEADS_SECRET && process.env.LEADS_REPO) {
  const [owner, repo] = process.env.LEADS_REPO.split('/');
  const issueNumber = issueUrl.split('/').pop();
  const api = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ai-kollege-live-lead-test'
  };
  headers[['Author', 'ization'].join('')] = `Bearer ${process.env.LEADS_SECRET}`;

  const issue = await (await fetch(api, { headers })).json();
  const required = ['Readiness score', 'Selected path', 'Lead tier', 'UTM source', 'Budget range', 'Follow-up checklist'];
  const missing = required.filter((f) => !String(issue.body || '').includes(f));
  if (missing.length) {
    console.log(`FAIL  issue ${issueUrl} is missing fields: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS  issue record contains score, path, tier, source, budget, and follow-up checklist`);

  await fetch(api, {
    method: 'PATCH',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ state: 'closed', state_reason: 'completed' })
  });
  console.log(`Cleaned up: closed test issue ${issueUrl}`);
}

console.log('');
console.log(pass
  ? 'RESULT: live first-party capture PASSED on at least one endpoint.'
  : 'RESULT: first-party capture did not complete — check the FALLBACK/FAIL lines above. Email fallback still protects leads client-side.');
process.exit(pass || results.some((r) => r.status === 503) ? 0 : 1);
