import {checkMomoToken,momoHealth,momoCapabilities,validateMomoAction} from '../../lib/momo-bridge.mjs';
import {fetchLeads,runAssistant} from '../../lib/assistant-core.mjs';
import {loadOwnerSettings,settingsFingerprint} from '../../lib/owner-settings.mjs';

export default async(req)=>{
  if(req.method!=='POST')return Response.json({ok:false,error:'method_not_allowed'},{status:405});
  if(!checkMomoToken(req.headers.get('authorization')))return Response.json({ok:false,error:'unauthorized'},{status:401});
  let data={};try{data=await req.json();}catch{return Response.json({ok:false,error:'invalid_request_body'},{status:400});}
  const action=String(data.action||'health');if(!validateMomoAction(action))return Response.json({ok:false,error:'action_not_allowed'},{status:403});
  if(action==='health')return Response.json(await momoHealth());
  if(action==='business_snapshot'){const s=await loadOwnerSettings();return Response.json({ok:true,action,settings_fingerprint:settingsFingerprint(s.settings),front_office:{secretary:s.settings.secretaryEnabled,web:s.settings.webSecretaryEnabled,whatsapp:s.settings.whatsappCustomerEnabled,human_forward:s.settings.humanForward.enabled},capabilities:momoCapabilities()});}
  const leads=await fetchLeads({limit:Math.min(Number(data.limit)||10,20)});if(!leads.ok)return Response.json({ok:false,error:leads.error},{status:502});
  const clean=leads.leads.map(({body,...x})=>x);
  if(action==='lead_summary')return Response.json({ok:true,action,leads:clean});
  const n=Number(data.issue_number),lead=leads.leads.find(x=>x.number===n);if(!lead)return Response.json({ok:false,error:'lead_not_found'},{status:404});
  const draft=await runAssistant({prompt:'Draft a concise, truthful customer follow-up. DRAFT ONLY. Do not promise outcomes, discounts, refunds, payment actions or implementation commitments.',context:`${lead.title}\n${lead.body}`});return Response.json({ok:true,action,issue:{number:lead.number,title:lead.title},draft,requires_owner_approval:true});
};

export const config={path:['/.netlify/functions/momo-bridge','/api/momo-bridge'],rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
