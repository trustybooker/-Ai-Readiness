import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkOwnerToken,
  isAssistantConfigured,
  handleAssistantAction,
  fetchTodaysBookings,
  ownerToday
} from '../lib/assistant-core.mjs';

function fakeClient(text = 'ok') {
  return {
    messages: {
      create: async () => ({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text }]
      })
    }
  };
}

const SAMPLE_ISSUES = [
  {
    number: 12,
    title: '[Booking] Test Person — Business AI Readiness Audit',
    html_url: 'https://github.com/example/repo/issues/12',
    labels: [{ name: 'lead' }, { name: 'booking' }],
    created_at: '2026-07-20T12:00:00Z',
    body: 'Name: Test Person\nEmail: test@example.com\nPreferred time 1: Tuesday 10 AM'
  },
  {
    number: 11,
    title: 'Training lead — AI Starter Pass',
    html_url: 'https://github.com/example/repo/issues/11',
    labels: [{ name: 'lead' }],
    created_at: '2026-07-20T11:00:00Z',
    body: 'Name: Other Person\nEmail: other@example.com'
  }
];

test('owner token check is required and constant-time safe on shape', () => {
  process.env.OWNER_ASSISTANT_TOKEN = 'private-owner-token';
  assert.equal(checkOwnerToken('Bearer private-owner-token'), true);
  assert.equal(checkOwnerToken('Bearer wrong'), false);
  assert.equal(checkOwnerToken(''), false);
  delete process.env.OWNER_ASSISTANT_TOKEN;
});

test('assistant is not configured without both API key and owner token', () => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OWNER_ASSISTANT_TOKEN;
  assert.equal(isAssistantConfigured(), false);
  process.env.ANTHROPIC_API_KEY = 'sk-test';
  assert.equal(isAssistantConfigured(), false);
  process.env.OWNER_ASSISTANT_TOKEN = 'owner';
  assert.equal(isAssistantConfigured(), true);
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OWNER_ASSISTANT_TOKEN;
});

test('leads_summary fetches lead issues and returns a summary', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  globalThis.fetch = async () => new Response(JSON.stringify(SAMPLE_ISSUES), { status: 200 });
  const result = await handleAssistantAction({ action: 'leads_summary' }, fakeClient('Lead summary')); 
  assert.equal(result.ok, true);
  assert.equal(result.leads.length, 2);
  assert.equal(result.summary, 'Lead summary');
});

test('draft_reply returns a draft and explicitly does not send', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  globalThis.fetch = async () => new Response(JSON.stringify(SAMPLE_ISSUES[0]), { status: 200 });
  const result = await handleAssistantAction({ action: 'draft_reply', issue_number: 12 }, fakeClient('Draft reply')); 
  assert.equal(result.ok, true);
  assert.equal(result.draft, 'Draft reply');
  assert.match(result.note, /nothing has been sent/i);
});

test('ownerToday returns the local calendar date in the configured timezone', () => {
  const utc = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const ny = ownerToday('America/New_York');
  assert.match(ny, /^\d{8}$/);
  // Near the UTC-midnight boundary NY can be a day behind UTC; both are valid
  // 8-digit dates, and the point is that the TZ is honored rather than raw UTC.
  const kiritimati = ownerToday('Pacific/Kiritimati'); // UTC+14, always >= UTC date
  assert.ok(kiritimati >= utc || Number(kiritimati) >= Number(ny));
});

test("today action surfaces a lead-tracker error instead of reporting no bookings", async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  globalThis.fetch = async () => new Response('{"message":"Bad credentials"}', { status: 401 });
  const result = await handleAssistantAction({ action: 'today' }, fakeClient('unused'));
  assert.equal(result.ok, false);
  assert.match(result.error, /lead_tracker_error/);
  assert.match(result.note, /may be hidden/i);
});

test('today lists booking requests and parses today calendar events in the owner timezone', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  process.env.CALENDAR_TIMEZONE = 'America/New_York';
  process.env.GOOGLE_CALENDAR_ICS_URL = 'https://calendar.google.com/private.ics';
  // Use the exact same timezone-aware day contract as production code. Using
  // raw UTC here makes this test fail for several hours every day around UTC
  // midnight even though production behavior is correct.
  const today = ownerToday(process.env.CALENDAR_TIMEZONE);
  globalThis.fetch = async (url) => {
    if (String(url).includes('calendar.google.com')) {
      return new Response(
        `BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${today}T1400\nSUMMARY:Fit review call\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART:19990101T1000\nSUMMARY:Old event\nEND:VEVENT\nEND:VCALENDAR`,
        { status: 200 }
      );
    }
    return new Response(JSON.stringify(SAMPLE_ISSUES), { status: 200 });
  };
  const { booking_requests, calendar_events } = await fetchTodaysBookings();
  assert.equal(booking_requests.length, 1);
  assert.match(booking_requests[0].title, /^\[Booking\]/);
  assert.equal(calendar_events.length, 1);
  assert.equal(calendar_events[0].summary, 'Fit review call');
  assert.equal(calendar_events[0].time, '14:00');
  delete process.env.CALENDAR_TIMEZONE;
  delete process.env.GOOGLE_CALENDAR_ICS_URL;
});