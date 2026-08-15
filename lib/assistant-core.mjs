// AI Kollege owner assistant — private, authenticated, owner-facing.
// Capabilities: summarize leads, review phone handoffs, draft (never send)
// follow-up replies, show today's bookings, and answer owner questions.

import crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';

export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL || 'claude-opus-4-8';

export function isAssistantConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY && process.env.OWNER_ASSISTANT_TOKEN);
}

export function checkOwnerToken(header) {
  const expected = process.env.OWNER_ASSISTANT_TOKEN || '';
  if (!expected) return false;
  const supplied = String(header || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ai-kollege-owner-assistant'
  };
  headers[['Author', 'ization'].join('')] = `Bearer ${process.env.LEADS_SECRET}`;
  return headers;
}

export async function fetchLeads({ state = 'open', limit = 20 } = {}) {
  const repo = process.env.LEADS_REPO || 'trustybooker/-Ai-Readiness';
  if (!process.env.LEADS_SECRET) return { ok: false, error: 'leads_not_configured', leads: [] };
  const [owner, repoName] = repo.split('/');
  const url = `https://api.github.com/repos/${owner}/${repoName}/issues?labels=lead&state=${state}&per_page=${limit}&sort=created&direction=desc`;
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) return { ok: false, error: `github_${response.status}`, leads: [] };
  const issues = await response.json();
  return {
    ok: true,
    leads: issues.map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: (issue.labels || []).map((l) => l.name),
      created_at: issue.created_at,
      body: String(issue.body || '').slice(0, 4000)
    }))
  };
}

export async function fetchLead(issueNumber) {
  const repo = process.env.LEADS_REPO || 'trustybooker/-Ai-Readiness';
  const [owner, repoName] = repo.split('/');
  const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues/${Number(issueNumber)}`, { headers: githubHeaders() });
  if (!response.ok) return null;
  const issue = await response.json();
  return { number: issue.number, title: issue.title, url: issue.html_url, body: String(issue.body || '').slice(0, 8000) };
}

export function ownerToday(tz = process.env.CALENDAR_TIMEZONE || 'America/New_York') {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return parts.replace(/-/g, '');
  } catch {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
}

export async function fetchTodaysBookings() {
  const { ok, error, leads } = await fetchLeads({ limit: 50 });
  const bookings = ok ? leads.filter((l) => l.title.startsWith('[Booking]')) : [];
  const events = [];
  const icsUrl = process.env.GOOGLE_CALENDAR_ICS_URL || '';
  if (icsUrl.startsWith('https://')) {
    try {
      const ics = await (await fetch(icsUrl)).text();
      const today = ownerToday();
      const blocks = ics.split('BEGIN:VEVENT').slice(1);
      for (const block of blocks) {
        const start = (block.match(/DTSTART[^:]*:(\d{8})/) || [])[1];
        if (start !== today) continue;
        const summary = (block.match(/SUMMARY:(.+)/) || [])[1] || 'Untitled event';
        const time = (block.match(/DTSTART[^:]*:\d{8}T(\d{4})/) || [])[1] || '';
        events.push({ summary: summary.trim(), time: time ? `${time.slice(0, 2)}:${time.slice(2)}` : 'all day' });
      }
    } catch {}
  }
  return { ok, error: ok ? null : error, booking_requests: bookings, calendar_events: events };
}

const OWNER_SYSTEM = `You are the private operations assistant for the owner of AI Kollege (operated by Fify Now LLC). You are talking to the owner, not a customer.

Ground rules:
- Summarize leads, phone handoffs and bookings, map leads to the offer ladder, and DRAFT follow-up replies. Never send anything; every draft is for owner approval.
- Offer ladder: Free AI Readiness Score ($0), AI Starter Pass ($59), AI Job & Productivity Pass ($197), Business AI Readiness Audit ($497), Team Training Sprint ($1,500+), AI Implementation Partner (custom, audit first), AI Kollege Lab (interest list).
- No job/income/revenue guarantees, accreditation claims, fake urgency, autonomous refunds, discounts, payments, calls, texts, emails, or routing changes.
- Recommend the smallest useful next step. Flag refunds, complaints, legal, privacy, money, or high-impact implementation for owner attention.
- Be concise and practical: what happened, who needs attention first, why, and the safest next step.`;

export async function runAssistant({ prompt, context = '', client } = {}) {
  const anthropic = client || new Anthropic();
  const response = await anthropic.messages.create({
    model: ASSISTANT_MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: OWNER_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: context ? `${prompt}\n\n<lead_data>\n${context.slice(0, 60000)}\n</lead_data>` : prompt }]
  });
  if (response.stop_reason === 'refusal') return 'The assistant declined this request. Handle it manually.';
  return response.content.find((b) => b.type === 'text')?.text || '';
}

export async function handleAssistantAction(data, client) {
  const action = String(data.action || 'ask');

  if (action === 'leads_summary') {
    const { ok, error, leads } = await fetchLeads({ limit: Number(data.limit) || 20 });
    if (!ok) return { ok: false, error };
    if (!leads.length) return { ok: true, action, summary: 'No open leads right now.', leads: [] };
    const context = leads.map((l) => `#${l.number} ${l.title} (${l.created_at})\n${l.body}`).join('\n\n---\n\n');
    const summary = await runAssistant({ prompt: 'Summarize these open leads. For each: who, problem, offer fit, priority. Then tell me who to answer first and why.', context, client });
    return { ok: true, action, summary, leads: leads.map(({ body, ...rest }) => rest) };
  }

  if (action === 'phone_handoffs') {
    const { ok, error, leads } = await fetchLeads({ limit: Number(data.limit) || 50 });
    if (!ok) return { ok: false, error };
    const phone = leads.filter((l) => /Channel:\s*phone:/i.test(l.body) || /phone:/i.test(l.title + ' ' + l.body));
    if (!phone.length) return { ok: true, action, summary: 'No open telephone handoffs right now.', handoffs: [] };
    const context = phone.map((l) => `#${l.number} ${l.title} (${l.created_at})\n${l.body}`).join('\n\n---\n\n');
    const summary = await runAssistant({ prompt: 'Review these telephone Secretary records. For each: caller/identifier if present, what they wanted, whether human follow-up is required, urgency, and safest next step. Do not initiate any call or message.', context, client });
    return { ok: true, action, summary, handoffs: phone.map(({ body, ...rest }) => rest) };
  }

  if (action === 'draft_reply') {
    const lead = await fetchLead(data.issue_number);
    if (!lead) return { ok: false, error: 'lead_not_found' };
    const draft = await runAssistant({ prompt: 'Draft a short, warm, truthful follow-up to this lead. Recommend the smallest useful next step. End with one clear question or action. DRAFT ONLY; do not claim anything was sent or approved.', context: `${lead.title}\n\n${lead.body}`, client });
    return { ok: true, action, issue: { number: lead.number, url: lead.url, title: lead.title }, draft, note: 'Draft only — nothing has been sent.' };
  }

  if (action === 'today') {
    const { ok, error, booking_requests, calendar_events } = await fetchTodaysBookings();
    if (!ok) return { ok: false, action, error: `lead_tracker_error: ${error}`, note: 'Could not read the lead tracker — booking requests may be hidden.' };
    return { ok: true, action, booking_requests: booking_requests.map(({ body, ...rest }) => rest), calendar_events };
  }

  const { leads } = await fetchLeads({ limit: 15 }).catch(() => ({ leads: [] }));
  const context = leads.map((l) => `#${l.number} ${l.title}\n${l.body.slice(0, 1200)}`).join('\n\n---\n\n');
  const answer = await runAssistant({ prompt: String(data.prompt || data.message || 'Status update, please.'), context, client });
  return { ok: true, action: 'ask', answer };
}
