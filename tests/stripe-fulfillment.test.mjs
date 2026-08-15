import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {verifyStripeSignature,classifyCheckoutSession} from '../lib/stripe-fulfillment.mjs';

function header(raw,secret,timestamp,extra=''){
  const sig=crypto.createHmac('sha256',secret).update(`${timestamp}.${raw}`).digest('hex');
  return `t=${timestamp},v1=${sig}${extra}`;
}

test('Stripe signature accepts a valid current v1 signature',()=>{
  const raw='{"id":"evt_123","type":"checkout.session.completed"}';
  const secret='whsec_test_only';
  const now=1_800_000_000;
  assert.equal(verifyStripeSignature(raw,header(raw,secret,now),secret,{now}),true);
});

test('Stripe signature rejects stale and future timestamps outside tolerance',()=>{
  const raw='{}',secret='whsec_test_only',now=1_800_000_000;
  assert.equal(verifyStripeSignature(raw,header(raw,secret,now-301),secret,{now}),false);
  assert.equal(verifyStripeSignature(raw,header(raw,secret,now+301),secret,{now}),false);
});

test('Stripe signature accepts one valid signature among rotated v1 signatures',()=>{
  const raw='{}',secret='whsec_test_only',now=1_800_000_000;
  const valid=header(raw,secret,now,',v1=deadbeef');
  assert.equal(verifyStripeSignature(raw,valid,secret,{now}),true);
});

test('paid AI Kollege payment session classifies to the intended offer',()=>{
  const result=classifyCheckoutSession({
    id:'cs_live_abc123',mode:'payment',payment_status:'paid',amount_total:4900,currency:'USD',payment_intent:'pi_123',
    metadata:{business:'AI Kollege',offer_key:'ai_starter_pass'},customer_details:{email:'buyer@example.com'}
  });
  assert.equal(result.ok,true);
  assert.equal(result.offer.key,'ai_starter_pass');
  assert.equal(result.currency,'usd');
  assert.equal(result.email,'buyer@example.com');
});

test('classification rejects unpaid, wrong-business, unsupported-mode and unknown offers',()=>{
  const base={id:'cs_live_abc123',mode:'payment',payment_status:'paid',metadata:{business:'AI Kollege',offer_key:'ai_starter_pass'}};
  assert.equal(classifyCheckoutSession({...base,payment_status:'unpaid'}).error,'payment_not_paid');
  assert.equal(classifyCheckoutSession({...base,metadata:{...base.metadata,business:'Other Business'}}).error,'not_ai_kollege_offer');
  assert.equal(classifyCheckoutSession({...base,mode:'subscription'}).error,'unsupported_checkout_mode');
  assert.equal(classifyCheckoutSession({...base,metadata:{...base.metadata,offer_key:'unknown'}}).error,'not_ai_kollege_offer');
});

test('classification rejects malformed checkout session ids',()=>{
  const result=classifyCheckoutSession({id:'not-a-session',mode:'payment',payment_status:'paid',metadata:{business:'AI Kollege',offer_key:'ai_job_productivity_pass'}});
  assert.equal(result.ok,false);
  assert.equal(result.error,'invalid_session');
});
