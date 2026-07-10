import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  checkOwnerToken,
  isAssistantConfigured,
  handleAssistantAction,
  fetchTodaysBookings
} from '../lib/assistant-core.mjs';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.OWNER_ASSISTANT_TOKEN;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.LEADS_SECRET;
  delete process.env.LEADS_REPO;
  delete process.env.GOOGLE_CALENDAR_ICS_URL;
});

function fakeClient(text) {
  return { messages: { create: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text }] }) } };
}

const SAMPLE_ISSUES = [
  {
    number: 12,
    title: '[Lead] Ann — AI Starter Pass',
    html_url: 'https://github.com/x/y/issues/12',
    labels: [{ name: 'lead' }],
    created_at: '2026-07-07T00:00:00Z',
    body: 'Readiness score: 40\nSelected path: AI Starter Pass'
  },
  {
    number: 13,
    title: '[Booking] Bo — Business AI Readiness Audit',
    html_url: 'https://github.com/x/y/issues/13',
    labels: [{ name: 'lead' }, { name: 'priority-booking' }],
    created_at: '2026-07-07T01:00:00Z',
    body: 'Preferred time 1: Tuesday 10 AM'
  }
];

test('owner token check is required and constant-time safe on shape', () => {
  assert.equal(checkOwnerToken('Bearer whatever'), false, 'no token configured -> deny');
  process.env.OWNER_ASSISTANT_TOKEN = 'secret-token';
  assert.equal(checkOwnerToken('Bearer wrong-token!'), false);
  assert.equal(checkOwnerToken('Bearer secret-token'), true);
  assert.equal(checkOwnerToken('secret-token'), true);
});

test('assistant is not configured without both API key and owner token', () => {
  assert.equal(isAssistantConfigured(), false);
  process.env.ANTHROPIC_API_KEY = 'sk-test';
  assert.equal(isAssistantConfigured(), false);
  process.env.OWNER_ASSISTANT_TOKEN = 'tok';
  assert.equal(isAssistantConfigured(), true);
});

test('leads_summary fetches lead issues and returns a summary', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  globalThis.fetch = async () => new Response(JSON.stringify(SAMPLE_ISSUES), { status: 200 });
  const result = await handleAssistantAction({ action: 'leads_summary' }, fakeClient('1. Ann — Starter Pass, answer first.'));
  assert.equal(result.ok, true);
  assert.match(result.summary, /Ann/);
  assert.equal(result.leads.length, 2);
  assert.equal(result.leads[0].body, undefined, 'full bodies are not echoed in the list payload');
});

test('draft_reply returns a draft and explicitly does not send', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  globalThis.fetch = async () => new Response(JSON.stringify(SAMPLE_ISSUES[0]), { status: 200 });
  const result = await handleAssistantAction({ action: 'draft_reply', issue_number: 12 }, fakeClient('Hi Ann, ...'));
  assert.equal(result.ok, true);
  assert.match(result.draft, /Ann/);
  assert.match(result.note, /nothing has been sent/i);
});

test('today lists booking requests and parses today calendar events', async () => {
  process.env.LEADS_SECRET = 't';
  process.env.LEADS_REPO = 'x/y';
  process.env.GOOGLE_CALENDAR_ICS_URL = 'https://calendar.google.com/private.ics';
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
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
});
