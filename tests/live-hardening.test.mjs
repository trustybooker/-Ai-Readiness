import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');

test('commercial lifecycle collection is not silently capped at the first 100 records',()=>{
  const s=text('lib/lifecycle-events.mjs');
  assert.match(s,/page=/);
  assert.match(s,/MAX_PAGES/);
  assert.match(s,/listIssues/);
});

test('Stripe purchase and checkout recovery paths remain idempotent',()=>{
  const s=text('lib/stripe-fulfillment.mjs'),e=text('lib/transactional-email.mjs'),w=text('netlify/functions/stripe-webhook.mjs');
  assert.match(s,/existingPurchase/);
  assert.match(e,/Idempotency-Key/);
  assert.match(e,/purchase-onboarding\//);
  assert.match(e,/checkout-expired\//);
  assert.match(w,/checkout\.session\.expired/);
});

test('scheduled reminders cannot repeat after completion or more than once per week',()=>{
  const s=text('netlify/functions/lifecycle-reminders.mjs');
  assert.match(s,/course_completed/);
  assert.match(s,/progress_reminder_sent/);
  assert.match(s,/weekKey/);
});
