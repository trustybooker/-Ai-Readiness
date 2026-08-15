import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../owner.html', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../assets/owner-assistant.js', import.meta.url), 'utf8');

test('owner cockpit is noindex and never embeds the owner secret', () => {
  assert.match(html, /noindex,nofollow,noarchive/i);
  assert.doesNotMatch(html + js, /private-owner-token|sk-live|OWNER_ASSISTANT_TOKEN\s*[:=]\s*['"][^'"]+/i);
  assert.match(js, /sessionStorage\.getItem\('aik_owner_token'\)/);
  assert.match(js, /authorization'\s*:\s*'Bearer '\s*\+\s*token/i);
});

test('owner cockpit exposes useful actions but no send or payment mutation controls', () => {
  assert.match(html, /Summarize open leads/);
  assert.match(html, /Show today/);
  assert.match(html, /What needs my attention/);
  assert.match(html, /Draft reply to lead/);
  assert.match(html, /nothing consequential is sent automatically/i);
  assert.doesNotMatch(html, />\s*(Send email|Issue refund|Charge customer|Approve payment)\s*</i);
});

test('voice is enhancement-only and typed fallback remains present', () => {
  assert.match(html, /data-input/);
  assert.match(html, /data-mic/);
  assert.match(js, /SpeechRecognition\|\|window\.webkitSpeechRecognition/);
  assert.match(js, /mic\.disabled=true/);
});

test('client handles locked, unauthorized, not-configured and rate-limited states', () => {
  for (const state of ['locked','unauthorized','not_configured','rate_limited']) assert.match(js, new RegExp(state));
});
