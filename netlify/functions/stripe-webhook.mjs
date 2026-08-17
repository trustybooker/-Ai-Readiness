import {verifyStripeSignature,handleStripeEvent} from '../../lib/stripe-fulfillment.mjs';
import {sendPurchaseOnboarding,sendAbandonedCheckoutRecovery} from '../../lib/transactional-email.mjs';

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
  try{
    if(event.type==='checkout.session.expired'){
      const email=await sendAbandonedCheckoutRecovery(event?.data?.object||{});
      return json(200,{ok:true,event:'checkout.session.expired',recovery_sent:Boolean(email.ok),recovery_skipped:Boolean(email.skipped),recovery_error:email.ok?undefined:email.error});
    }
    const result=await handleStripeEvent(event);if(!result.ok)return json(500,result);
    if(result.purchase?.email){const email=await sendPurchaseOnboarding(result.purchase);if(!email.ok&&!email.skipped)return json(500,{...result,email_sent:false,email_error:email.error});return json(200,{...result,email_sent:Boolean(email.ok),email_error:email.ok?undefined:email.error});}
    return json(200,result);
  }catch{return json(500,{ok:false,error:'fulfillment_failed'});}
};

export const config={path:['/.netlify/functions/stripe-webhook','/api/stripe-webhook'],method:'POST'};
