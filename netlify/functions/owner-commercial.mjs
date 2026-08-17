import {checkOwnerToken} from '../../lib/assistant-core.mjs';
import {lifecycleSnapshot} from '../../lib/lifecycle-events.mjs';
import {classifyCheckoutSession} from '../../lib/stripe-fulfillment.mjs';
import {emailConfigured,sendPurchaseOnboarding,sendProgressReminder} from '../../lib/transactional-email.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const SESSION_RE=/^cs_(?:test_|live_)?[A-Za-z0-9]+$/;
async function verifiedPurchase(id){const sessionId=String(id||'');if(!SESSION_RE.test(sessionId))return{ok:false,error:'invalid_session_id'};const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return{ok:false,error:'stripe_not_configured'};const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${key}`}});if(!r.ok)return{ok:false,error:r.status===404?'session_not_found':'stripe_lookup_failed'};const c=classifyCheckoutSession(await r.json());return c.ok?{ok:true,purchase:c}:{ok:false,error:c.error};}
function masked(email=''){const [a,b]=String(email).split('@');if(!a||!b)return'';return `${a.slice(0,2)}***@${b}`;}
export default async(req)=>{
  if(req.method!=='POST')return json(405,{ok:false,error:'method_not_allowed'});
  if(!checkOwnerToken(req.headers.get('authorization')))return json(401,{ok:false,error:'unauthorized'});
  const len=Number(req.headers.get('content-length')||0);if(len>12000)return json(413,{ok:false,error:'request_too_large'});
  let body={};try{body=await req.json();}catch{return json(400,{ok:false,error:'invalid_json'});}
  const action=String(body.action||'status');
  if(action==='status'){
    const snapshot=await lifecycleSnapshot();if(!snapshot.ok)return json(502,snapshot);
    return json(200,{ok:true,action,counts:snapshot.counts,health:{stripe:Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET),resend:emailConfigured(),private_store:Boolean(process.env.LEADS_SECRET&&process.env.LEADS_REPO),owner_auth:Boolean(process.env.OWNER_ASSISTANT_TOKEN)},recent_events:snapshot.events.slice(0,20).map(e=>({event:e.event,offer:e.offer,module:e.module,progress:e.progress,occurred_at:e.occurred_at}))});
  }
  if(action==='verify_access'){
    const v=await verifiedPurchase(body.session_id);if(!v.ok)return json(400,v);return json(200,{ok:true,action,session_id:v.purchase.session_id,offer:v.purchase.offer,email:masked(v.purchase.email),amount_total:v.purchase.amount_total,currency:v.purchase.currency});
  }
  if(action==='resend_onboarding'){
    const v=await verifiedPurchase(body.session_id);if(!v.ok)return json(400,v);const email=await sendPurchaseOnboarding(v.purchase);return json(email.ok?200:502,{ok:Boolean(email.ok),action,email_id:email.id||null,error:email.ok?undefined:email.error});
  }
  if(action==='progress_reminder'){
    const v=await verifiedPurchase(body.session_id);if(!v.ok)return json(400,v);const snapshot=await lifecycleSnapshot();if(!snapshot.ok)return json(502,snapshot);if(snapshot.events.some(e=>e.session===v.purchase.session_id&&e.event==='course_completed'))return json(409,{ok:false,error:'course_already_completed'});const latest=snapshot.events.filter(e=>e.session===v.purchase.session_id&&['learner_activated','module_completed'].includes(e.event)).sort((a,b)=>Date.parse(b.occurred_at)-Date.parse(a.occurred_at))[0];if(!latest)return json(409,{ok:false,error:'learner_not_activated'});const email=await sendProgressReminder({email:v.purchase.email,label:v.purchase.offer.label,session_id:v.purchase.session_id,progress:latest.progress,reminderKey:`manual-${v.purchase.session_id}-${new Date().toISOString().slice(0,10)}`});return json(email.ok?200:502,{ok:Boolean(email.ok),action,email_id:email.id||null,error:email.ok?undefined:email.error});
  }
  return json(400,{ok:false,error:'unsupported_action'});
};
export const config={path:['/.netlify/functions/owner-commercial','/api/owner-commercial'],method:'POST',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
