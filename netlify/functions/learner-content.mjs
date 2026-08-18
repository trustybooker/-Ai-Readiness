import {verifyCheckoutEntitlement} from '../../lib/stripe-fulfillment.mjs';
import {learnerPayload} from '../../lib/learner-catalog.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const SESSION_RE=/^cs_(?:test_|live_)?[A-Za-z0-9]+$/;
const MAX_BODY=6000;

export default async(req)=>{
  if(req.method!=='POST')return json(405,{ok:false,error:'method_not_allowed'});
  const len=Number(req.headers.get('content-length')||0);if(len>MAX_BODY)return json(413,{ok:false,error:'request_too_large'});
  const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return json(503,{ok:false,error:'stripe_verification_not_configured'});
  let body;try{body=await req.json();}catch{return json(400,{ok:false,error:'invalid_json'});}
  const sessionId=String(body?.session_id||'');if(!SESSION_RE.test(sessionId)||sessionId.length>160)return json(400,{ok:false,error:'invalid_session_id'});
  const profile=body?.profile&&typeof body.profile==='object'?body.profile:{};
  const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${key}`}});
  if(r.status===404)return json(404,{ok:false,error:'session_not_found'});if(!r.ok)return json(502,{ok:false,error:'stripe_lookup_failed'});
  const entitlement=await verifyCheckoutEntitlement(await r.json(),key);if(!entitlement.ok)return json(403,{ok:false,error:entitlement.error||'paid_entitlement_not_verified'});
  const payload=learnerPayload(entitlement.offer.key,profile);if(!payload)return json(403,{ok:false,error:'unsupported_offer'});
  return json(200,{ok:true,verified:true,entitlement:'active',...payload});
};

export const config={path:['/.netlify/functions/learner-content','/api/learner-content'],method:'POST',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
