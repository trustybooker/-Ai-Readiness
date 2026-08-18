import {privateStoreGate} from './owner-settings.mjs';
import {classifyCheckoutSession} from './stripe-fulfillment.mjs';

const ALLOWED_EVENTS=new Set(['learner_activated','module_completed','course_completed','progress_reminder_sent']);
const SESSION_RE=/^cs_(?:test_|live_)?[A-Za-z0-9]+$/;
const MARKER='<!-- AIK_LIFECYCLE_EVENT -->';

function clean(value='',max=300){return String(value??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').trim().slice(0,max);}
function headers(){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'ai-kollege-lifecycle','Content-Type':'application/json'};h[['Author','ization'].join('')]=`Bearer ${process.env.LEADS_SECRET||''}`;return h;}
async function verifySession(sessionId){const id=clean(sessionId,160);if(!SESSION_RE.test(id))return{ok:false,error:'invalid_session_id'};const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return{ok:false,error:'stripe_verification_not_configured'};const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${key}`}});if(r.status===404)return{ok:false,error:'session_not_found'};if(!r.ok)return{ok:false,error:'stripe_lookup_failed'};const c=classifyCheckoutSession(await r.json());return c.ok?{ok:true,purchase:c}:{ok:false,error:'paid_entitlement_not_verified'};}
async function listRepoIssues(repo,label,{maxPages=10}={}){const out=[];for(let page=1;page<=maxPages;page++){const r=await fetch(`https://api.github.com/repos/${repo}/issues?state=all&labels=${encodeURIComponent(label)}&per_page=100&page=${page}&sort=created&direction=desc`,{headers:headers()});if(!r.ok){if(r.status===422&&page===1)return[];break;}const items=(await r.json()).filter(i=>!i.pull_request);out.push(...items);if(items.length<100)break;}return out;}
async function listEvents(repo){return listRepoIssues(repo,'lifecycle-event');}
function eventKey(session,event,module=''){return `${session}|${event}|${clean(module,100)}`;}
function pickLine(body,name){return (String(body||'').match(new RegExp(`^- ${name}:\\s*(.*)$`,'mi'))||[])[1]?.trim()||'';}
function parseEvent(issue){const body=String(issue?.body||'');return{event:pickLine(body,'Event'),session:pickLine(body,'Session'),offer:pickLine(body,'Offer key'),module:pickLine(body,'Module'),progress:Number(pickLine(body,'Progress'))||0,email:pickLine(body,'Checkout email'),occurred_at:pickLine(body,'Occurred at')||issue?.created_at||''};}
function parsePurchase(issue){const body=String(issue?.body||'');return{session:pickLine(body,'Session'),offer:pickLine(body,'Offer key'),amount:Number(pickLine(body,'Amount'))||0,currency:clean(pickLine(body,'Currency'),12).toLowerCase(),email:pickLine(body,'Checkout email'),verified_at:pickLine(body,'Verified at')||issue?.created_at||''};}
export async function recordLifecycleEvent({session_id,event,module='',progress=0}={}){
  const eventName=clean(event,80);if(!ALLOWED_EVENTS.has(eventName))return{ok:false,error:'invalid_event'};
  const verified=await verifySession(session_id);if(!verified.ok)return verified;
  const gate=await privateStoreGate();if(!gate.ok)return{ok:false,error:gate.error};
  const existing=await listEvents(gate.repo),key=eventKey(verified.purchase.session_id,eventName,module);
  const duplicate=existing.find(i=>{const e=parseEvent(i);return eventKey(e.session,e.event,e.module)===key;});
  if(duplicate)return{ok:true,duplicate:true,event:eventName,issue_number:duplicate.number,purchase:verified.purchase};
  const pct=Math.max(0,Math.min(100,Math.round(Number(progress)||0))),moduleId=clean(module,100);
  const body=`${MARKER}\n# AI Kollege lifecycle event\n\n- Event: ${eventName}\n- Session: ${verified.purchase.session_id}\n- Offer key: ${verified.purchase.offer.key}\n- Checkout email: ${verified.purchase.email||'not supplied'}\n- Module: ${moduleId||'not supplied'}\n- Progress: ${pct}\n- Occurred at: ${new Date().toISOString()}\n\nPrivate operational event. No learner artifact content is stored here.`;
  const payload={title:`[Lifecycle] ${eventName} — ${verified.purchase.offer.label}`.slice(0,200),body,labels:['lifecycle-event',`event-${eventName}`,'ai-kollege']};
  let r=await fetch(`https://api.github.com/repos/${gate.repo}/issues`,{method:'POST',headers:headers(),body:JSON.stringify(payload)});
  if(!r.ok&&[400,422].includes(r.status))r=await fetch(`https://api.github.com/repos/${gate.repo}/issues`,{method:'POST',headers:headers(),body:JSON.stringify({title:payload.title,body})});
  if(!r.ok)return{ok:false,error:`lifecycle_write_${r.status}`};const issue=await r.json();return{ok:true,duplicate:false,event:eventName,issue_number:issue.number,purchase:verified.purchase};
}
export async function lifecycleSnapshot(){const gate=await privateStoreGate();if(!gate.ok)return{ok:false,error:gate.error};const [events,purchaseIssues,leadIssues]=await Promise.all([listEvents(gate.repo),listRepoIssues(gate.repo,'stripe-purchase'),listRepoIssues(gate.repo,'lead')]);
  const parsed=events.map(parseEvent),purchases=purchaseIssues.map(parsePurchase).filter(p=>p.session),uniq=(name)=>new Set(parsed.filter(e=>e.event===name).map(e=>e.session)).size,revenue={};
  for(const p of purchases){if(!p.currency||p.amount<0)continue;revenue[p.currency]=(revenue[p.currency]||0)+p.amount;}
  const purchaseCount=new Set(purchases.map(p=>p.session)).size,activationCount=uniq('learner_activated'),completionCount=uniq('course_completed');
  return{ok:true,counts:{leads:leadIssues.length,purchases:purchaseCount,activations:activationCount,module_completions:parsed.filter(e=>e.event==='module_completed').length,course_completions:completionCount},rates:{purchase_to_activation:purchaseCount?activationCount/purchaseCount:0,activation_to_completion:activationCount?completionCount/activationCount:0,purchase_to_completion:purchaseCount?completionCount/purchaseCount:0},revenue_by_currency:revenue,purchases:purchases.slice(0,50),events:parsed};
}
