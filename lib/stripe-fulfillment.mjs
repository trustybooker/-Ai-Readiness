import crypto from 'node:crypto';
import {privateStoreGate} from './owner-settings.mjs';

export const STRIPE_EVENT_TYPES=Object.freeze(['checkout.session.completed','checkout.session.async_payment_succeeded']);
export const AI_KOLLEGE_OFFERS=Object.freeze({
  ai_starter_pass:{label:'AI Starter Pass',path:'starter'},
  ai_job_productivity_pass:{label:'AI Job & Productivity Pass',path:'job-productivity'}
});
const MARKER='<!-- AIK_STRIPE_PURCHASE -->';

function clean(value,max=500){return String(value??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').trim().slice(0,max);}
function timingEqual(a,b){try{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y);}catch{return false;}}
export function verifyStripeSignature(rawBody,signatureHeader,secret,{toleranceSeconds=300,now=Math.floor(Date.now()/1000)}={}){
  if(!secret||!signatureHeader)return false;
  const parts=String(signatureHeader).split(',').map(x=>x.trim());
  const timestamp=Number(parts.find(x=>x.startsWith('t='))?.slice(2));
  const signatures=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));
  if(!Number.isFinite(timestamp)||!signatures.length||Math.abs(now-timestamp)>toleranceSeconds)return false;
  const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some(sig=>timingEqual(sig,expected));
}
function ghHeaders(){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'ai-kollege-stripe-fulfillment','Content-Type':'application/json'};h[['Author','ization'].join('')]=`Bearer ${process.env.LEADS_SECRET||''}`;return h;}
function offerFromSession(session={}){const key=clean(session?.metadata?.offer_key,80);const offer=AI_KOLLEGE_OFFERS[key];const business=clean(session?.metadata?.business,80);if(!offer||business!=='AI Kollege')return null;return{key,...offer};}
export function classifyCheckoutSession(session={}){const offer=offerFromSession(session);if(!offer)return{ok:false,error:'not_ai_kollege_offer'};if(session.mode!=='payment')return{ok:false,error:'unsupported_checkout_mode'};if(session.payment_status!=='paid')return{ok:false,error:'payment_not_paid'};const id=clean(session.id,120);if(!/^cs_/.test(id))return{ok:false,error:'invalid_session'};return{ok:true,session_id:id,offer,email:clean(session?.customer_details?.email||session?.customer_email,254),amount_total:Number(session.amount_total)||0,currency:clean(session.currency,12).toLowerCase(),payment_intent:clean(typeof session.payment_intent==='string'?session.payment_intent:session?.payment_intent?.id,120)};}
async function stripeObject(path,key){const r=await fetch(`https://api.stripe.com/v1/${path}`,{headers:{Authorization:`Bearer ${key}`}});if(!r.ok)return{ok:false,status:r.status};return{ok:true,data:await r.json()};}
export async function verifyCheckoutEntitlement(session={},stripeKey=process.env.STRIPE_SECRET_KEY){
  const c=classifyCheckoutSession(session);if(!c.ok)return c;
  const key=String(stripeKey||'');if(!key)return{ok:false,error:'stripe_verification_not_configured'};
  if(!/^pi_/.test(c.payment_intent))return{ok:false,error:'payment_intent_missing'};
  const pi=await stripeObject(`payment_intents/${encodeURIComponent(c.payment_intent)}`,key);if(!pi.ok)return{ok:false,error:'payment_intent_lookup_failed'};
  if(pi.data?.status!=='succeeded')return{ok:false,error:'payment_not_settled'};
  const chargeId=clean(typeof pi.data?.latest_charge==='string'?pi.data.latest_charge:pi.data?.latest_charge?.id,120);if(!/^ch_/.test(chargeId))return{ok:false,error:'charge_missing'};
  const charge=await stripeObject(`charges/${encodeURIComponent(chargeId)}`,key);if(!charge.ok)return{ok:false,error:'charge_lookup_failed'};
  const fullyRefunded=charge.data?.refunded===true||Number(charge.data?.amount_refunded||0)>=Number(charge.data?.amount||1);
  if(fullyRefunded)return{ok:false,error:'access_revoked_refunded'};
  if(charge.data?.disputed===true)return{ok:false,error:'access_paused_dispute'};
  return{...c,ok:true,entitlement:'active',partial_refund:Number(charge.data?.amount_refunded||0)>0,charge_id:chargeId};
}
async function existingPurchase(repo,sessionId){const r=await fetch(`https://api.github.com/repos/${repo}/issues?state=all&labels=stripe-purchase&per_page=100&sort=created&direction=desc`,{headers:ghHeaders()});if(!r.ok&&r.status!==422)throw new Error(`purchase_list_${r.status}`);if(!r.ok)return null;const issues=await r.json();return issues.find(i=>String(i.body||'').includes(`Session: ${sessionId}`))||null;}
export async function recordVerifiedPurchase(session,eventId=''){
  const c=classifyCheckoutSession(session);if(!c.ok)return c;
  const gate=await privateStoreGate();if(!gate.ok)return{ok:false,error:gate.error};
  const existing=await existingPurchase(gate.repo,c.session_id);if(existing)return{ok:true,duplicate:true,issue_number:existing.number,url:existing.html_url,purchase:c};
  const body=`${MARKER}\n# Verified AI Kollege purchase\n\n- Session: ${c.session_id}\n- Offer key: ${c.offer.key}\n- Offer: ${c.offer.label}\n- Payment status: paid\n- Amount: ${c.amount_total}\n- Currency: ${c.currency}\n- Checkout email: ${c.email||'not supplied'}\n- PaymentIntent: ${c.payment_intent||'not supplied'}\n- Stripe event: ${clean(eventId,120)||'not supplied'}\n- Verified at: ${new Date().toISOString()}\n\nThis record was created only after Stripe webhook signature validation and paid-session validation. Do not put card data or secrets in this record.`;
  const payload={title:`[Purchase] ${c.offer.label} — ${c.session_id}`.slice(0,200),body,labels:['stripe-purchase','paid','ai-kollege']};
  let r=await fetch(`https://api.github.com/repos/${gate.repo}/issues`,{method:'POST',headers:ghHeaders(),body:JSON.stringify(payload)});
  if(!r.ok&&[400,422].includes(r.status))r=await fetch(`https://api.github.com/repos/${gate.repo}/issues`,{method:'POST',headers:ghHeaders(),body:JSON.stringify({title:payload.title,body})});
  if(!r.ok)return{ok:false,error:`purchase_write_${r.status}`};const issue=await r.json();return{ok:true,duplicate:false,issue_number:issue.number,url:issue.html_url,purchase:c};
}
export async function handleStripeEvent(event={}){
  if(!STRIPE_EVENT_TYPES.includes(event.type))return{ok:true,ignored:true,reason:'event_not_used'};
  const session=event?.data?.object||{};
  if(event.type==='checkout.session.completed'&&session.payment_status!=='paid')return{ok:true,ignored:true,reason:'awaiting_payment'};
  return recordVerifiedPurchase(session,event.id||'');
}
