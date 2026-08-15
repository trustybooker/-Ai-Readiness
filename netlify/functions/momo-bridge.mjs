import {checkMomoToken,momoHealth,momoCapabilities,validateMomoAction} from '../../lib/momo-bridge.mjs';
import {fetchLeads,runAssistant} from '../../lib/assistant-core.mjs';
import {loadOwnerSettings,settingsFingerprint} from '../../lib/owner-settings.mjs';
import {createSocialDraft,listSocialOps,socialCapabilities,getSocialOp,publicationGate} from '../../lib/social-ops.mjs';

export default async(req)=>{
  if(req.method!=='POST')return Response.json({ok:false,error:'method_not_allowed'},{status:405});
  if(!checkMomoToken(req.headers.get('authorization')))return Response.json({ok:false,error:'unauthorized'},{status:401});
  let data={};try{data=await req.json();}catch{return Response.json({ok:false,error:'invalid_request_body'},{status:400});}
  const action=String(data.action||'health');if(!validateMomoAction(action))return Response.json({ok:false,error:'action_not_allowed'},{status:403});
  try{
    if(action==='health')return Response.json(await momoHealth());
    if(action==='business_snapshot'){const s=await loadOwnerSettings();return Response.json({ok:true,action,settings_fingerprint:settingsFingerprint(s.settings),front_office:{secretary:s.settings.secretaryEnabled,web:s.settings.webSecretaryEnabled,whatsapp:s.settings.whatsappCustomerEnabled,human_forward:s.settings.humanForward.enabled},social:socialCapabilities(),capabilities:momoCapabilities()});}
    if(action==='social_status')return Response.json({ok:true,action,capabilities:socialCapabilities(),ops:await listSocialOps({limit:Math.min(Number(data.limit)||20,50)})});
    if(action==='propose_social_draft'){const draft=await createSocialDraft({campaign_id:data.campaign_id,content_id:data.content_id,platforms:data.platforms,text:data.text,media:data.media,scheduled_for:data.scheduled_for},{actor:'momo'});return Response.json({...draft,action,requires_owner_approval:true,publish_authority:'after-owner-approval-only'});}
    if(action==='social_publish_check'){const current=await getSocialOp(data.issue_number),gate=publicationGate(current.op);return Response.json({ok:true,action,issue_number:current.issue_number,owner_approved:Boolean(current.op.approval?.actor==='owner'&&current.op.approval?.fingerprint===current.op.fingerprint),gate,op:current.op,may_execute_when_adapter_connected:gate.ok});}
    const leads=await fetchLeads({limit:Math.min(Number(data.limit)||10,20)});if(!leads.ok)return Response.json({ok:false,error:leads.error},{status:502});
    const clean=leads.leads.map(({body,...x})=>x);
    if(action==='lead_summary')return Response.json({ok:true,action,leads:clean});
    const n=Number(data.issue_number),lead=leads.leads.find(x=>x.number===n);if(!lead)return Response.json({ok:false,error:'lead_not_found'},{status:404});
    const draft=await runAssistant({prompt:'Draft a concise, truthful customer follow-up. DRAFT ONLY. Do not promise outcomes, discounts, refunds, payment actions or implementation commitments.',context:`${lead.title}\n${lead.body}`});return Response.json({ok:true,action,issue:{number:lead.number,title:lead.title},draft,requires_owner_approval:true});
  }catch(e){return Response.json({ok:false,error:String(e?.message||'momo_bridge_unavailable')},{status:502});}
};

export const config={path:['/.netlify/functions/momo-bridge','/api/momo-bridge'],rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
