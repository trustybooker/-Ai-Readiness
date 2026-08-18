import {verifyCheckoutEntitlement} from '../../lib/stripe-fulfillment.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const SESSION_RE=/^cs_(?:test_|live_)?[A-Za-z0-9]+$/;

export default async(req)=>{
  if(req.method!=='GET')return json(405,{ok:false,error:'method_not_allowed'});
  const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return json(503,{ok:false,error:'stripe_session_verification_not_configured'});
  const id=new URL(req.url).searchParams.get('session_id')||'';if(!SESSION_RE.test(id)||id.length>160)return json(400,{ok:false,error:'invalid_session_id'});
  const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${key}`}});
  if(r.status===404)return json(404,{ok:false,error:'session_not_found'});if(!r.ok)return json(502,{ok:false,error:'stripe_lookup_failed'});
  const entitlement=await verifyCheckoutEntitlement(await r.json(),key);if(!entitlement.ok)return json(200,{ok:false,verified:false,error:entitlement.error});
  return json(200,{ok:true,verified:true,entitlement:'active',offer_key:entitlement.offer.key,offer:entitlement.offer.label,payment_status:'paid',amount_total:entitlement.amount_total,currency:entitlement.currency,partial_refund:Boolean(entitlement.partial_refund)});
};

export const config={path:['/.netlify/functions/stripe-session','/api/stripe-session'],method:'GET',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
