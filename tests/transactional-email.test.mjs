import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {emailConfigured,sender,sendTransactionalEmail,sendLeadAcknowledgement,sendPurchaseOnboarding} from '../lib/transactional-email.mjs';

const realFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=realFetch;for(const k of ['RESEND_API_KEY','RESEND_FROM'])delete process.env[k];});

test('Resend integration fails closed when key is absent',async()=>{
  assert.equal(emailConfigured(),false);
  const out=await sendTransactionalEmail({to:'user@example.com',subject:'x',text:'y',idempotencyKey:'test/1'});
  assert.equal(out.skipped,true);assert.equal(out.error,'resend_not_configured');
});

test('Resend uses server key, sender and idempotency header',async()=>{
  process.env.RESEND_API_KEY='re_test_only';process.env.RESEND_FROM='AI Kollege <hello@aikollege.com>';
  let call;globalThis.fetch=async(url,options)=>{call={url:String(url),options};return new Response(JSON.stringify({id:'email_123'}),{status:200,headers:{'content-type':'application/json'}});};
  const out=await sendTransactionalEmail({to:'user@example.com',subject:'Hello',text:'Body',idempotencyKey:'lead-ack/42'});
  assert.equal(out.ok,true);assert.equal(sender(),'AI Kollege <hello@aikollege.com>');assert.equal(call.url,'https://api.resend.com/emails');assert.equal(call.options.headers.Authorization,'Bearer re_test_only');assert.equal(call.options.headers['Idempotency-Key'],'lead-ack/42');const body=JSON.parse(call.options.body);assert.deepEqual(body.to,['user@example.com']);assert.equal(body.from,'AI Kollege <hello@aikollege.com>');
});

test('lead acknowledgement distinguishes booking requests',async()=>{
  process.env.RESEND_API_KEY='re_test_only';let body;globalThis.fetch=async(_url,options)=>{body=JSON.parse(options.body);return new Response(JSON.stringify({id:'email_1'}),{status:200,headers:{'content-type':'application/json'}});};
  const out=await sendLeadAcknowledgement({name:'Ann',email:'ann@example.com',request_type:'Booking request',path:'AI Starter Pass'},17);
  assert.equal(out.ok,true);assert.match(body.subject,/booking request/i);assert.match(body.text,/confirmed only/i);
});

test('purchase onboarding points only to Stripe-verifying start page',async()=>{
  process.env.RESEND_API_KEY='re_test_only';let body,headers;globalThis.fetch=async(_url,options)=>{body=JSON.parse(options.body);headers=options.headers;return new Response(JSON.stringify({id:'email_2'}),{status:200,headers:{'content-type':'application/json'}});};
  const out=await sendPurchaseOnboarding({email:'buyer@example.com',session_id:'cs_live_123',offer:{label:'AI Starter Pass'}});
  assert.equal(out.ok,true);assert.match(body.text,/purchase-success\.html\?session_id=cs_live_123/);assert.match(body.text,/verifies/i);assert.equal(headers['Idempotency-Key'],'purchase-onboarding/cs_live_123');
});

test('provider errors are surfaced without exposing API key',async()=>{
  process.env.RESEND_API_KEY='re_super_secret';globalThis.fetch=async()=>new Response(JSON.stringify({message:'domain not verified'}),{status:403,headers:{'content-type':'application/json'}});
  const out=await sendTransactionalEmail({to:'user@example.com',subject:'x',text:'y'});assert.equal(out.ok,false);assert.equal(out.status,403);assert.equal(out.error,'domain not verified');assert.doesNotMatch(JSON.stringify(out),/re_super_secret/);
});
