import {checkOwnerToken,isAssistantConfigured} from '../../lib/assistant-core.mjs';
import {rateLimit} from '../../lib/secretary-core.mjs';
import {socialCapabilities,listSocialOps,createSocialDraft,updateSocialOp,getSocialOp,publicationGate,assertActorPermission} from '../../lib/social-ops.mjs';

export default async(req)=>{
  if(req.method!=='POST')return Response.json({ok:false,error:'method_not_allowed'},{status:405});
  if(!isAssistantConfigured())return Response.json({ok:false,error:'not_configured'},{status:503});
  if(!checkOwnerToken(req.headers.get('authorization')))return Response.json({ok:false,error:'unauthorized'},{status:401});
  if(!rateLimit('social-ops',{limit:40}))return Response.json({ok:false,error:'rate_limited'},{status:429});
  let data={};try{data=await req.json();}catch{return Response.json({ok:false,error:'invalid_request_body'},{status:400});}
  const action=String(data.action||'status');
  try{
    assertActorPermission('owner',action);
    if(action==='status')return Response.json({ok:true,capabilities:socialCapabilities(),ops:await listSocialOps({limit:Math.min(Number(data.limit)||25,50)})});
    if(action==='get')return Response.json({ok:true,...await getSocialOp(data.issue_number)});
    if(action==='create_draft')return Response.json(await createSocialDraft(data,{actor:'owner'}));
    if(action==='submit_review')return Response.json(await updateSocialOp(data.issue_number,'review',{actor:'owner',note:data.note}));
    if(action==='approve')return Response.json(await updateSocialOp(data.issue_number,'approved',{actor:'owner',note:data.note}));
    if(action==='schedule')return Response.json(await updateSocialOp(data.issue_number,'scheduled',{actor:'owner',note:data.note,scheduled_for:data.scheduled_for}));
    if(action==='cancel')return Response.json(await updateSocialOp(data.issue_number,'cancelled',{actor:'owner',note:data.note}));
    if(action==='publish_check'){const current=await getSocialOp(data.issue_number);return Response.json({ok:true,issue_number:current.issue_number,gate:publicationGate(current.op),op:current.op});}
    return Response.json({ok:false,error:'action_not_allowed'},{status:403});
  }catch(e){const code=String(e?.message||'social_ops_unavailable');const status=/forbidden|approval|required|transition|not_approved|stale/.test(code)?403:/not_found|invalid_social/.test(code)?404:/platform_required|content_required|invalid_schedule/.test(code)?400:502;return Response.json({ok:false,error:code},{status});}
};

export const config={path:['/.netlify/functions/social-ops','/api/social-ops'],rateLimit:{windowLimit:40,windowSize:60,aggregateBy:['ip','domain']}};
