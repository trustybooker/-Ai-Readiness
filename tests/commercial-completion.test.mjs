import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const text=p=>fs.readFileSync(p,'utf8');

test('verified learner lifecycle is measured without storing artifact content',()=>{
  const core=text('lib/lifecycle-events.mjs'),client=text('assets/learner.js');
  for(const e of ['learner_activated','module_completed','course_completed']){assert.ok(core.includes(e));assert.ok(client.includes(e));}
  assert.match(core,/No learner artifact content is stored here/);
  assert.match(client,/\.netlify\/functions\/learner-event/);
});

test('abandoned checkout recovery uses Stripe expired event and Resend idempotency',()=>{
  const webhook=text('netlify/functions/stripe-webhook.mjs'),email=text('lib/transactional-email.mjs');
  assert.match(webhook,/checkout\.session\.expired/);
  assert.match(email,/sendAbandonedCheckoutRecovery/);
  assert.match(email,/checkout-expired\//);
  assert.match(email,/If you changed your mind, no action is needed/);
  assert.match(email,/Idempotency-Key/);
});

test('course completion and safe scheduled progress reminders exist',()=>{
  const email=text('lib/transactional-email.mjs'),scheduled=text('netlify/functions/lifecycle-reminders.mjs'),core=text('lib/lifecycle-events.mjs');
  assert.match(email,/sendCourseCompletion/);assert.match(email,/not accreditation/);
  assert.match(email,/sendProgressReminder/);assert.match(scheduled,/schedule:'@daily'/);
  assert.match(scheduled,/course_completed/);assert.match(scheduled,/now-lastAt<3\*DAY/);
  assert.match(core,/progress_reminder_sent/);
});

test('Owner Studio commercial endpoint is owner-authenticated and operational',()=>{
  const api=text('netlify/functions/owner-commercial.mjs'),ui=text('assets/owner-commercial.js'),loader=text('assets/owner-controls.js');
  assert.match(api,/checkOwnerToken/);assert.match(api,/verify_access/);assert.match(api,/resend_onboarding/);assert.match(api,/progress_reminder/);assert.match(api,/lifecycleSnapshot/);
  assert.match(ui,/Commercial funnel/);assert.match(loader,/owner-commercial\.js/);
});

test('learner workspace loads analytics config and tracks proof export',()=>{
  const html=text('learner.html'),client=text('assets/learner.js');assert.match(html,/assets\/site-config\.js/);assert.match(client,/google-analytics-4/);assert.match(client,/proof_pack_exported/);
});

test('purchase verification runs after analytics bootstrap so verified purchase event is measurable',()=>{
  const html=text('purchase-success.html'),verify=text('assets/purchase-verification.js');
  const config=html.indexOf("assets/site-config.js"),app=html.indexOf("assets/app.js"),purchase=html.indexOf("assets/purchase-verification.js");
  assert.ok(config>=0&&app>config&&purchase>app,'purchase-success scripts must bootstrap GA4 before purchase verification');
  assert.match(verify,/purchase_verified/);
});
