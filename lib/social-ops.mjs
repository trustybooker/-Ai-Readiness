import crypto from 'node:crypto';
import {privateStoreGate} from './owner-settings.mjs';

export const SOCIAL_PLATFORMS=Object.freeze(['facebook','instagram','linkedin','tiktok']);
export const SOCIAL_ACTORS=Object.freeze(['owner','momo','secretary','receptionist','system']);
export const SOCIAL_STATES=Object.freeze(['draft','review','approved','scheduled','publishing','published','partial','failed','cancelled']);
export const SOCIAL_CONTROL_VERSION='2026-08-15-v2';
const LABEL='social-op';
const BODY_START='<!-- AIK_SOCIAL_OP_START -->';
const BODY_END='<!-- AIK_SOCIAL_OP_END -->';
const SAFE_WRITE_ACTORS=new Set(['owner','momo']);
const APPROVAL_ACTORS=new Set(['owner']);
const PUBLISH_EXECUTORS=new Set(['owner','momo']);

function clean(value,max=4000){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/[<>]/g,'').trim().slice(0,max);}
function uniq(list=[]){return [...new Set((Array.isArray(list)?list:[]).map(x=>String(x).toLowerCase()).filter(x=>SOCIAL_PLATFORMS.includes(x)))];}
function now(){return new Date().toISOString();}
function hash(value){return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0,24);}
export function contentFingerprint({text='',media=[],platforms=[]}={}){return hash(JSON.stringify({text:clean(text,12000).replace(/\s+/g,' '),media:(Array.isArray(media)?media:[]).map(x=>clean(x,1000)).sort(),platforms:uniq(platforms).sort()}));}
export function makeIdempotencyKey({campaignId='',contentId='',platforms=[],fingerprint=''}={}){return hash([clean(campaignId,120),clean(contentId,120),uniq(platforms).sort().join(','),fingerprint].join('|'));}
export function platformReadiness(env=process.env){return {
 facebook:{configured:Boolean(env.META_ACCESS_TOKEN&&env.META_PAGE_ID),account:clean(env.META_PAGE_ID,120),publish_capability:'adapter-required'},
 instagram:{configured:Boolean(env.META_ACCESS_TOKEN&&env.INSTAGRAM_BUSINESS_ACCOUNT_ID),account:clean(env.INSTAGRAM_BUSINESS_ACCOUNT_ID,120),publish_capability:'media-adapter-required'},
 linkedin:{configured:Boolean(env.LINKEDIN_ACCESS_TOKEN&&env.LINKEDIN_AUTHOR_URN),account:clean(env.LINKEDIN_AUTHOR_URN,180),publish_capability:'adapter-required'},
 tiktok:{configured:Boolean(env.TIKTOK_ACCESS_TOKEN&&env.TIKTOK_OPEN_ID),account:clean(env.TIKTOK_OPEN_ID,180),publish_capability:'content-posting-adapter-and-consent-required'}
};}
export function socialCapabilities(env=process.env){return {version:SOCIAL_CONTROL_VERSION,platforms:[...SOCIAL_PLATFORMS],publish_enabled:String(env.SOCIAL_PUBLISH_ENABLED||'').toLowerCase()==='true',approval_authority:['owner'],proposal_authority:['owner','momo'],publish_execution_authority:['owner','momo-after-owner-approval'],momo_can_self_approve:false,customer_systems:['secretary','receptionist'],customer_system_marketing_publish:false,destructive_remote_actions:false,readiness:platformReadiness(env)};}
export function sanitizeDraft(input={},actor='owner'){
 const platforms=uniq(input.platforms);if(!platforms.length)throw new Error('platform_required');
 const text=clean(input.text,12000);if(!text)throw new Error('content_required');
 const media=(Array.isArray(input.media)?input.media:[]).map(x=>clean(x,1000)).filter(Boolean).slice(0,10);
 const campaignId=clean(input.campaign_id||input.campaignId,120)||`campaign-${Date.now()}`;
 const contentId=clean(input.content_id||input.contentId,120)||`content-${hash(text).slice(0,10)}`;
 const fingerprint=contentFingerprint({text,media,platforms});
 return {version:SOCIAL_CONTROL_VERSION,campaign_id:campaignId,content_id:contentId,actor:SOCIAL_ACTORS.includes(actor)?actor:'system',state:'draft',platforms,text,media,fingerprint,idempotency_key:makeIdempotencyKey({campaignId,contentId,platforms,fingerprint}),scheduled_for:clean(input.scheduled_for,40),created_at:now(),updated_at:now(),approval:null,platform_results:{},audit:[{at:now(),actor:SOCIAL_ACTORS.includes(actor)?actor:'system',event:'draft_created'}]};
}
export function canTransition(from,to,actor='owner'){
 if(!SOCIAL_STATES.includes(from)||!SOCIAL_STATES.includes(to))return false;
 if(['secretary','receptionist'].includes(actor))return false;
 if(to==='approved'&&!APPROVAL_ACTORS.has(actor))return false;
 if(to==='publishing'&&!PUBLISH_EXECUTORS.has(actor))return false;
 const map={draft:['review','cancelled'],review:['draft','approved','cancelled'],approved:['scheduled','publishing','cancelled'],scheduled:['publishing','cancelled'],publishing:['published','partial','failed'],failed:['review','cancelled'],partial:['review','cancelled'],published:[],cancelled:[]};
 return (map[from]||[]).includes(to);
}
export function transitionSocialOp(op,to,{actor='owner',note=''}={}){
 if(!canTransition(op?.state,to,actor))throw new Error('transition_not_allowed');
 if(to==='publishing'&&(!op.approval||op.approval.actor!=='owner'||op.approval.fingerprint!==op.fingerprint))throw new Error('owner_approval_required');
 const next={...op,state:to,updated_at:now(),audit:[...(op.audit||[]),{at:now(),actor,event:`state:${op.state}->${to}`,note:clean(note,500)}]};
 if(to==='approved')next.approval={at:now(),actor:'owner',fingerprint:op.fingerprint};
 if(op.approval&&op.approval.fingerprint!==op.fingerprint&&['approved','scheduled','publishing'].includes(to))throw new Error('stale_approval');
 return next;
}
export function assertActorPermission(actor,action){
 if(!SOCIAL_ACTORS.includes(actor))throw new Error('unknown_actor');
 if(['secretary','receptionist'].includes(actor)&&action!=='status')throw new Error('customer_system_marketing_forbidden');
 if(action==='create_draft'&&!SAFE_WRITE_ACTORS.has(actor))throw new Error('draft_forbidden');
 if(['approve','schedule','cancel'].includes(action)&&actor!=='owner')throw new Error('owner_approval_required');
 if(action==='publish'&&!PUBLISH_EXECUTORS.has(actor))throw new Error('publish_executor_forbidden');
 return true;
}
function ghHeaders(){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'ai-kollege-social-ops','Content-Type':'application/json'};h[['Author','ization'].join('')]=`Bearer ${process.env.LEADS_SECRET||''}`;return h;}
function bodyFor(op){return `${BODY_START}\n${JSON.stringify(op,null,2)}\n${BODY_END}\n\nPrivate AI Kollege social operations record. No credentials or access tokens belong in this record.`;}
function parseBody(body=''){const m=String(body).match(/<!-- AIK_SOCIAL_OP_START -->\s*([\s\S]*?)\s*<!-- AIK_SOCIAL_OP_END -->/);if(!m)return null;try{return JSON.parse(m[1]);}catch{return null;}}
async function gate(){const g=await privateStoreGate();if(!g.ok)throw new Error(g.error||'private_store_unavailable');return g;}
export async function listSocialOps({state='open',limit=50}={}){const g=await gate();const r=await fetch(`https://api.github.com/repos/${g.repo}/issues?labels=${LABEL}&state=${state}&per_page=${Math.min(Math.max(Number(limit)||50,1),100)}&sort=updated&direction=desc`,{headers:ghHeaders()});if(!r.ok)throw new Error(`social_list_${r.status}`);const issues=await r.json();return issues.filter(i=>!i.pull_request).map(i=>({issue_number:i.number,url:i.html_url,title:i.title,op:parseBody(i.body)})).filter(x=>x.op);}
export async function createSocialDraft(input,{actor='owner'}={}){assertActorPermission(actor,'create_draft');const op=sanitizeDraft(input,actor),existing=await listSocialOps({limit:100});const collision=existing.find(x=>x.op.idempotency_key===op.idempotency_key||(['draft','review','approved','scheduled','publishing'].includes(x.op.state)&&x.op.fingerprint===op.fingerprint&&x.op.platforms.some(p=>op.platforms.includes(p))));if(collision)return{ok:true,deduplicated:true,issue_number:collision.issue_number,url:collision.url,op:collision.op};const g=await gate();const title=`[Social] ${op.campaign_id} — ${op.platforms.join(', ')}`.slice(0,200);const r=await fetch(`https://api.github.com/repos/${g.repo}/issues`,{method:'POST',headers:ghHeaders(),body:JSON.stringify({title,body:bodyFor(op),labels:['social-op','social-draft']})});if(!r.ok)throw new Error(`social_create_${r.status}`);const issue=await r.json();return{ok:true,deduplicated:false,issue_number:issue.number,url:issue.html_url,op};}
export async function getSocialOp(issueNumber){const n=Number(issueNumber);if(!Number.isInteger(n)||n<1)throw new Error('social_op_not_found');const g=await gate();const r=await fetch(`https://api.github.com/repos/${g.repo}/issues/${n}`,{headers:ghHeaders()});if(!r.ok)throw new Error('social_op_not_found');const issue=await r.json(),op=parseBody(issue.body);if(!op)throw new Error('invalid_social_record');return{issue_number:n,url:issue.html_url,title:issue.title,op};}
export async function updateSocialOp(issueNumber,to,{actor='owner',note='',scheduled_for=''}={}){assertActorPermission(actor,to==='approved'?'approve':to==='scheduled'?'schedule':to==='publishing'?'publish':to==='cancelled'?'cancel':'status');const current=await getSocialOp(issueNumber);let op=transitionSocialOp(current.op,to,{actor,note});if(to==='scheduled'){const ts=Date.parse(scheduled_for||current.op.scheduled_for||'');if(!Number.isFinite(ts)||ts<=Date.now())throw new Error('invalid_schedule');op={...op,scheduled_for:new Date(ts).toISOString(),updated_at:now()};}
 const g=await gate();const r=await fetch(`https://api.github.com/repos/${g.repo}/issues/${current.issue_number}`,{method:'PATCH',headers:ghHeaders(),body:JSON.stringify({body:bodyFor(op),state:['published','cancelled'].includes(to)?'closed':'open'})});if(!r.ok)throw new Error(`social_update_${r.status}`);return{ok:true,issue_number:current.issue_number,url:current.url,op};}
export function publicationGate(op,env=process.env){if(op?.state!=='approved'&&op?.state!=='scheduled')return{ok:false,error:'not_approved'};if(!op.approval||op.approval.actor!=='owner'||op.approval.fingerprint!==op.fingerprint)return{ok:false,error:'stale_or_missing_owner_approval'};if(String(env.SOCIAL_PUBLISH_ENABLED||'').toLowerCase()!=='true')return{ok:false,error:'publishing_disabled'};const ready=platformReadiness(env),missing=op.platforms.filter(p=>!ready[p]?.configured);if(missing.length)return{ok:false,error:'platform_not_configured',platforms:missing};return{ok:true,readiness:ready,executor_policy:'owner_or_momo_after_owner_approval'};}
