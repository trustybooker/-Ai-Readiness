function clean(value = '') {
  return String(value).replace(/[<>]/g, '').trim().slice(0, 4000);
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function slug(value = '') {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'unknown';
}

function priority(score = '', tier = '') {
  const n = Number(score || 0);
  const t = String(tier).toLowerCase();
  if (t.includes('hot') || n >= 80) return 'priority-hot';
  if (t.includes('audit') || n >= 62) return 'priority-audit';
  if (n >= 42) return 'priority-training';
  return 'priority-foundation';
}

function issueBody(data) {
  return `# AI Readiness Pass Lead\n\n## Contact\n- Name: ${clean(data.name)}\n- Email: ${clean(data.email)}\n- Phone: ${clean(data.phone)}\n\n## Qualification\n- Selected path: ${clean(data.path)}\n- Recommended path: ${clean(data.recommended_path)}\n- Lead tier: ${clean(data.lead_tier)}\n- Readiness score: ${clean(data.readiness_score)}\n- Score summary: ${clean(data.score_summary)}\n- Audience type: ${clean(data.audience_type)}\n- Timeline: ${clean(data.timeline)}\n- Budget range: ${clean(data.budget_range)}\n\n## Message\n${clean(data.message)}\n\n## Source\n- Landing page: ${clean(data.landing_page)}\n- Referrer: ${clean(data.referrer)}\n- UTM source: ${clean(data.utm_source)}\n- UTM medium: ${clean(data.utm_medium)}\n- UTM campaign: ${clean(data.utm_campaign)}\n\n## Follow-up checklist\n- [ ] Review score and message.\n- [ ] Choose response path.\n- [ ] Send response template.\n- [ ] Send payment or booking link when appropriate.\n- [ ] Update status label.\n\nNo job, revenue, legal compliance, or accreditation guarantee should be made.\n`;
}

async function createIssue(data) {
  const secret = process.env.LEADS_SECRET;
  const repo = process.env.LEADS_REPO || 'trustybooker/-Ai-Readiness';
  if (!secret || !repo.includes('/')) return { ok: false, status: 503, error: 'not_configured' };

  const [owner, repoName] = repo.split('/');
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'fify-now-ai-readiness-pass'
  };
  headers[['Author','ization'].join('')] = ['Bearer', secret].join(' ');

  const title = `[Lead] ${clean(data.name) || 'Unknown'} — ${clean(data.path || data.recommended_path) || 'AI Readiness'}`.slice(0, 250);
  const labels = ['lead','ai-readiness-pass',priority(data.readiness_score, data.lead_tier),`path-${slug(data.path || data.recommended_path)}`,`audience-${slug(data.audience_type)}`];

  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, body: issueBody(data), labels })
  });
  if (!response.ok) return { ok: false, status: response.status, error: 'issue_create_failed' };
  const issue = await response.json();
  return { ok: true, issue_url: issue.html_url, issue_number: issue.number };
}

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  const data = Object.fromEntries((await req.formData()).entries());
  if (clean(data._gotcha)) return Response.json({ ok: true, ignored: true });
  if (!clean(data.name) || !isEmail(data.email)) return Response.json({ ok: false, error: 'name_and_email_required' }, { status: 400 });
  const result = await createIssue(data);
  if (!result.ok) return Response.json({ ok: false, fallback: 'email_form', error: result.error }, { status: result.status || 500 });
  return Response.json({ ok: true, ...result });
};

export const config = { path: '/.netlify/functions/capture-lead' };
