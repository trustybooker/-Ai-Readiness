import {classifyCheckoutSession} from '../../lib/stripe-fulfillment.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const SESSION_RE=/^cs_(?:test_|live_)?[A-Za-z0-9]+$/;

export default async(req)=>{
  if(req.method!=='GET')return json(405,{ok:false,error:'method_not_allowed'});
  const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return json(503,{ok:false,error:'stripe_session_verification_not_configured'});
  const id=new URL(req.url).searchParams.get('session_id')||'';if(!SESSION_RE.test(id)||id.length>160)return json(400,{ok:false,error:'invalid_session_id'});
  const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${key}`}});
  if(r.status===404)return json(404,{ok:false,error:'session_not_found'});if(!r.ok)return json(502,{ok:false,error:'stripe_lookup_failed'});
  const session=await r.json();const c=classifyCheckoutSession(session);if(!c.ok)return json(200,{ok:false,verified:false,error:c.error});
  return json(200,{ok:true,verified:true,offer_key:c.offer.key,offer:c.offer.label,payment_status:'paid',amount_total:c.amount_total,currency:c.currency});
};

export const config={path:['/.netlify/functions/stripe-session','/api/stripe-session'],method:'GET',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
