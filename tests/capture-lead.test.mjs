import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import netlifyHandler from '../netlify/functions/capture-lead.mjs';
import vercelHandler from '../api/capture-lead.mjs';

const SAMPLE_LEAD = {
  'form-name': 'ai-readiness-lead',
  name: 'Test Lead',
  email: 'test-lead@example.com',
  phone: '555-0100',
  path: 'AI Starter Pass',
  audience_type: 'Me as a job seeker',
  timeline: 'This month',
  budget_range: '$59 starter pass',
  readiness_score: '64',
  score_summary: 'Score 64/100 | Practical builder | Lead tier: Audit-ready lead',
  recommended_path: 'Business AI Readiness Audit',
  lead_tier: 'Audit-ready lead',
  lead_source: 'utm-test',
  landing_page: 'https://aikollege.com/',
  referrer: 'direct',
  utm_source: 'utm-test',
  message: 'I need AI job proof.'
};

const realFetch = globalThis.fetch;
let fetchCalls;

function mockFetch(responder) {
  fetchCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    return responder(url, options, fetchCalls.length);
  };
}

function githubOk() {
  return new Response(JSON.stringify({ html_url: 'https://github.com/x/y/issues/1', number: 1 }), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
}

// Each request uses a unique IP by default so per-IP throttling does not bleed
// across independent test cases. Pass an explicit ip to exercise throttling.
let ipCounter = 0;
function nextIp() { return `10.0.0.${ipCounter++}`; }

function netlifyRequest(data, method = 'POST', ip = nextIp()) {
  return new Request('http://localhost/.netlify/functions/capture-lead', {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: method === 'POST' ? JSON.stringify(data) : undefined
  });
}

function vercelReqRes(data, method = 'POST', ip = nextIp()) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: data
  };
  const res = {
    statusCode: 200,
    payload: undefined,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; }
  };
  return { req, res };
}

beforeEach(() => {
  process.env.LEADS_SECRET = 'test-secret';
  process.env.LEADS_REPO = 'owner/repo';
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.LEADS_SECRET;
  delete process.env.LEADS_REPO;
});

test('netlify: rejects non-POST requests', async () => {
  const response = await netlifyHandler(netlifyRequest(null, 'GET'));
  assert.equal(response.status, 405);
});

test('netlify: rejects missing name/email so the client falls back to email', async () => {
  const response = await netlifyHandler(netlifyRequest({ name: '', email: 'not-an-email' }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.ok, false);
});

test('netlify: silently accepts honeypot submissions without creating an issue', async () => {
  mockFetch(() => githubOk());
  const response = await netlifyHandler(netlifyRequest({ ...SAMPLE_LEAD, _gotcha: 'bot' }));
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.ignored, true);
  assert.equal(fetchCalls.length, 0);
});

test('netlify: signals email fallback when tracker is not configured', async () => {
  delete process.env.LEADS_SECRET;
  const response = await netlifyHandler(netlifyRequest(SAMPLE_LEAD));
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.fallback, 'email_form');
});

test('netlify: creates a GitHub issue carrying score, path, tier, source, budget, and follow-up checklist', async () => {
  mockFetch(() => githubOk());
  const response = await netlifyHandler(netlifyRequest(SAMPLE_LEAD));
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.issue_number, 1);
  assert.equal(fetchCalls.length, 1);

  const posted = JSON.parse(fetchCalls[0].options.body);
  assert.match(posted.title, /^\[Lead\] Test Lead/);
  for (const field of [
    'Readiness score: 64',
    'Selected path: AI Starter Pass',
    'Lead tier: Audit-ready lead',
    'UTM source: utm-test',
    'Budget range: $59 starter pass',
    'Follow-up checklist',
    'Human-value follow-up standard'
  ]) {
    assert.ok(posted.body.includes(field), `issue body missing: ${field}`);
  }
  assert.ok(posted.labels.includes('lead'));
});

test('netlify: retries without labels when labels fail, so no lead is lost', async () => {
  mockFetch((url, options, callCount) => {
    if (callCount === 1) return new Response('{"message":"Validation Failed"}', { status: 422 });
    return githubOk();
  });
  const response = await netlifyHandler(netlifyRequest(SAMPLE_LEAD));
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(fetchCalls.length, 2);
  const retry = JSON.parse(fetchCalls[1].options.body);
  assert.equal(retry.labels, undefined);
});

test('netlify: signals email fallback when GitHub is down, so no lead is lost', async () => {
  mockFetch(() => new Response('{"message":"boom"}', { status: 500 }));
  const response = await netlifyHandler(netlifyRequest(SAMPLE_LEAD));
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.fallback, 'email_form');
});

test('netlify: booking requests get the [Booking] title prefix', async () => {
  mockFetch(() => githubOk());
  await netlifyHandler(netlifyRequest({ ...SAMPLE_LEAD, request_type: 'Booking request' }));
  const posted = JSON.parse(fetchCalls[0].options.body);
  assert.match(posted.title, /^\[Booking\]/);
});

test('vercel: rejects non-POST requests', async () => {
  const { req, res } = vercelReqRes(null, 'GET');
  await vercelHandler(req, res);
  assert.equal(res.statusCode, 405);
});

test('vercel: creates the same issue record as the netlify path', async () => {
  mockFetch(() => githubOk());
  const { req, res } = vercelReqRes(SAMPLE_LEAD);
  await vercelHandler(req, res);
  assert.equal(res.payload.ok, true);
  const posted = JSON.parse(fetchCalls[0].options.body);
  assert.ok(posted.body.includes('Lead tier: Audit-ready lead'));
  assert.ok(posted.body.includes('Follow-up checklist'));
});

test('vercel: signals email fallback when tracker is not configured', async () => {
  delete process.env.LEADS_SECRET;
  const { req, res } = vercelReqRes(SAMPLE_LEAD);
  await vercelHandler(req, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.fallback, 'email_form');
});

test('netlify: throttles repeated posts from one IP and points them at email fallback', async () => {
  mockFetch(() => githubOk());
  const ip = '203.0.113.7';
  let throttledStatus = 0;
  let throttledBody;
  for (let i = 0; i < 8; i++) {
    const response = await netlifyHandler(netlifyRequest(SAMPLE_LEAD, 'POST', ip));
    if (response.status === 429) { throttledStatus = 429; throttledBody = await response.json(); break; }
  }
  assert.equal(throttledStatus, 429, 'a burst from one IP should eventually be throttled');
  assert.equal(throttledBody.fallback, 'email_form', 'throttled response tells the client to use email fallback');
});
