import {verifyStripeSignature,handleStripeEvent} from '../../lib/stripe-fulfillment.mjs';

const MAX_BODY=256000;
const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

export default async(req)=>{
  if(req.method!=='POST')return json(405,{ok:false,error:'method_not_allowed'});
  const secret=String(process.env.STRIPE_WEBHOOK_SECRET||'');
  if(!secret)return json(503,{ok:false,error:'stripe_webhook_not_configured'});
  const len=Number(req.headers.get('content-length')||0);if(len>MAX_BODY)return json(413,{ok:false,error:'payload_too_large'});
  const raw=await req.text();if(Buffer.byteLength(raw)>MAX_BODY)return json(413,{ok:false,error:'payload_too_large'});
  const signature=req.headers.get('stripe-signature')||'';
  if(!verifyStripeSignature(raw,signature,secret))return json(400,{ok:false,error:'invalid_signature'});
  let event;try{event=JSON.parse(raw);}catch{return json(400,{ok:false,error:'invalid_json'});}
  try{const result=await handleStripeEvent(event);if(!result.ok)return json(500,result);return json(200,result);}catch{return json(500,{ok:false,error:'fulfillment_failed'});}
};

export const config={path:['/.netlify/functions/stripe-webhook','/api/stripe-webhook'],method:'POST'};
