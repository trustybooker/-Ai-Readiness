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
  if (t.includes('booking')) return 'priority-booking';
  if (t.includes('audit') || n >= 62) return 'priority-audit';
  if (n >= 42) return 'priority-training';
  return 'priority-foundation';
}

function issueBody(data) {
  return `# AI Readiness Pass Lead

## Request Type
- Type: ${clean(data.request_type || 'Lead request')}

## Contact
- Name: ${clean(data.name)}
- Email: ${clean(data.email)}
- Phone: ${clean(data.phone)}

## Qualification
- Selected path: ${clean(data.path)}
- Recommended path: ${clean(data.recommended_path)}
- Lead tier: ${clean(data.lead_tier)}
- Readiness score: ${clean(data.readiness_score)}
- Score summary: ${clean(data.score_summary)}
- Audience type: ${clean(data.audience_type)}
- Timeline: ${clean(data.timeline)}
- Budget range: ${clean(data.budget_range)}

## Booking Request
- Meeting length: ${clean(data.meeting_length || data.call_length)}
- Meeting preference: ${clean(data.meeting_preference || data.meeting_type)}
- Timezone: ${clean(data.timezone)}
- Preferred time 1: ${clean(data.preferred_time_1 || [data.preferred_date_1, data.preferred_time_window_1].filter(Boolean).join(' '))}
- Preferred time 2: ${clean(data.preferred_time_2 || [data.preferred_date_2, data.preferred_time_window_2].filter(Boolean).join(' '))}
- Preferred time 3: ${clean(data.preferred_time_3)}
- Calendar status: Needs human confirmation unless a real scheduler confirmation exists.

## Message
${clean(data.message)}

## Source
- Landing page: ${clean(data.landing_page)}
- Referrer: ${clean(data.referrer)}
- UTM source: ${clean(data.utm_source)}
- UTM medium: ${clean(data.utm_medium)}
- UTM campaign: ${clean(data.utm_campaign)}
- UTM term: ${clean(data.utm_term)}
- UTM content: ${clean(data.utm_content)}

## Follow-up checklist
- [ ] Review score and message.
- [ ] Confirm requested service and fit.
- [ ] Check calendar availability.
- [ ] Send official Google Calendar invite or verified scheduler link.
- [ ] Send verified payment link when appropriate.
- [ ] Update status label.

No job, revenue, legal compliance, or accreditation guarantee should be made.
`;
}

async function postIssue(owner, repoName, headers, title, body, labels) {
  const payload = labels ? { title, body, labels } : { title, body };
  return fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
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

  const requestType = clean(data.request_type || 'Lead');
  const titlePrefix = requestType.toLowerCase().includes('booking') ? '[Booking]' : '[Lead]';
  const title = `${titlePrefix} ${clean(data.name) || 'Unknown'} — ${clean(data.path || data.recommended_path) || 'AI Readiness'}`.slice(0, 250);
  const body = issueBody(data);
  const labels = ['lead','ai-readiness-pass',priority(data.readiness_score, data.lead_tier),`path-${slug(data.path || data.recommended_path)}`,`audience-${slug(data.audience_type || data.request_type)}`];

  let response = await postIssue(owner, repoName, headers, title, body, labels);
  if (!response.ok && [400, 422].includes(response.status)) {
    response = await postIssue(owner, repoName, headers, title, body, null);
  }
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
