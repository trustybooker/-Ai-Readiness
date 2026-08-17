import {recordLifecycleEvent} from '../../lib/lifecycle-events.mjs';
import {sendCourseCompletion} from '../../lib/transactional-email.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const MAX_BODY=8000;
export default async(req)=>{
  if(req.method!=='POST')return json(405,{ok:false,error:'method_not_allowed'});
  const len=Number(req.headers.get('content-length')||0);if(len>MAX_BODY)return json(413,{ok:false,error:'request_too_large'});
  let body;try{body=await req.json();}catch{return json(400,{ok:false,error:'invalid_json'});}
  try{
    const result=await recordLifecycleEvent(body);if(!result.ok)return json(result.error==='invalid_event'||result.error==='invalid_session_id'?400:result.error==='paid_entitlement_not_verified'?403:500,result);
    if(result.event==='course_completed'&&result.purchase?.email){const email=await sendCourseCompletion(result.purchase);return json(200,{...result,email_sent:Boolean(email.ok),email_error:email.ok?undefined:email.error});}
    return json(200,result);
  }catch{return json(500,{ok:false,error:'lifecycle_event_failed'});}
};
export const config={path:['/.netlify/functions/learner-event','/api/learner-event'],method:'POST',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
