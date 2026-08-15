import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../owner.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../assets/owner-assistant.js', import.meta.url), 'utf8');

test('Owner Studio is private and never embeds the owner secret', () => {
  assert.match(html, /noindex,nofollow,noarchive/i);
  assert.doesNotMatch(html + js, /private-owner-token|sk-live|OWNER_ASSISTANT_TOKEN\s*[:=]\s*['"][^'"]+/i);
  assert.match(js, /sessionStorage\.getItem\('aik_owner_token'\)/);
  assert.match(js, /authorization'\s*:\s*'Bearer '\s*\+\s*token/i);
});

test('Owner Studio exposes complete business workflows but no consequential mutation controls', () => {
  for (const text of ['Summarize open leads','Show today','What needs my attention','Draft reply to private lead','Check business wiring','Show all business links in chat','Open public site','Booking page']) assert.match(html,new RegExp(text));
  assert.match(html,/nothing consequential is sent automatically/i);
  assert.doesNotMatch(html,/>\s*(Send email|Issue refund|Charge customer|Approve payment)\s*</i);
});

test('Owner Studio renders verified links and private lead record cards', () => {
  assert.match(js,/function safeHref/);
  assert.match(js,/link-chip/);
  assert.match(js,/record-card/);
  assert.match(js,/rel='noopener'|rel="noopener"|a\.rel='noopener'/);
  assert.match(js,/business_links/);
  assert.match(js,/pipeline_health/);
});

test('voice is enhancement-only and keyboard-first typed input remains present', () => {
  assert.match(html, /data-input/);
  assert.match(html, /data-mic/);
  assert.match(html, /Shift\+Enter/);
  assert.match(js, /SpeechRecognition\|\|window\.webkitSpeechRecognition/);
  assert.match(js, /mic\.disabled=true/);
  assert.match(js, /requestSubmit/);
});

test('client handles security, pipeline and rate-limit failure states', () => {
  for (const state of ['locked','unauthorized','not_configured','rate_limited','unsafe_lead_repository','leads_not_configured','lead_not_found']) assert.match(js, new RegExp(state));
});
