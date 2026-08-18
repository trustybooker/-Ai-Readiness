import {loadOwnerSettings} from '../../lib/owner-settings.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async(req)=>{
  if(req.method!=='GET')return json(405,{ok:false,error:'method_not_allowed'});
  const loaded=await loadOwnerSettings(),ops=loaded.settings?.courseOperations||{};
  return json(200,{ok:true,offers:{ai_starter_pass:{selfServeEnabled:ops.ai_starter_pass?.selfServeEnabled!==false},ai_job_productivity_pass:{selfServeEnabled:ops.ai_job_productivity_pass?.selfServeEnabled!==false}}});
};
export const config={path:['/.netlify/functions/offer-status','/api/offer-status'],method:'GET',rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
