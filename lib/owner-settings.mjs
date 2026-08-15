import crypto from 'node:crypto';

export const SETTINGS_PATH='.ai-kollege-owner-settings.json';
export const ALLOWED_TONES=['warm-professional','friendly','concise','formal'];
export const ALLOWED_AUTONOMY=['observe','draft','act-safe'];
export const ALLOWED_LINK_KEYS=['home','score','courses','booking','answers','checklist','lab','badge','refunds','privacy'];
const E164=/^\+[1-9]\d{7,14}$/;
const HHMM=/^(?:[01]\d|2[0-3]):[0-5]\d$/;

function envBool(name,fallback){const v=String(process.env[name]||'').trim().toLowerCase();if(!v)return fallback;return !['0','false','off','no'].includes(v);}
function httpsUrl(value,fallback=''){try{const u=new URL(String(value||''));return u.protocol==='https:'?u.href.replace(/\/$/,''):fallback;}catch{return fallback;}}
function validTimezone(value){try{new Intl.DateTimeFormat('en-US',{timeZone:value}).format(new Date());return value;}catch{return'America/New_York';}}
function validDays(value){const list=Array.isArray(value)?value.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=6):[1,2,3,4,5];return [...new Set(list)].sort();}
function validPhone(value){const v=String(value||'').trim();return E164.test(v)?v:'';}

export function defaultOwnerSettings(){const envForward=validPhone(process.env.TWILIO_HUMAN_FORWARD_NUMBER);return{
  version:1,
  secretaryEnabled:envBool('SECRETARY_ENABLED',true),
  webSecretaryEnabled:envBool('WEB_SECRETARY_ENABLED',true),
  whatsappCustomerEnabled:envBool('WHATSAPP_CUSTOMER_ENABLED',true),
  customerTone:'warm-professional',
  bookingUrl:httpsUrl(process.env.BOOKING_URL,'https://www.aikollege.com/booking.html'),
  businessHours:{enabled:false,timezone:validTimezone(process.env.CALENDAR_TIMEZONE||'America/New_York'),days:[1,2,3,4,5],start:'09:00',end:'17:00'},
  humanForward:{enabled:Boolean(envForward),number:envForward,outsideHoursOnly:false},
  escalation:{complaints:true,customImplementation:true,lowConfidence:true},
  recommendedLinks:['score','courses','booking','answers','checklist','refunds','privacy'],
  assistantAutonomy:'draft'
};}

export function sanitizeOwnerSettings(input={},base=defaultOwnerSettings()){const out=structuredClone(base);if(typeof input.secretaryEnabled==='boolean')out.secretaryEnabled=input.secretaryEnabled;if(typeof input.webSecretaryEnabled==='boolean')out.webSecretaryEnabled=input.webSecretaryEnabled;if(typeof input.whatsappCustomerEnabled==='boolean')out.whatsappCustomerEnabled=input.whatsappCustomerEnabled;if(ALLOWED_TONES.includes(input.customerTone))out.customerTone=input.customerTone;if(ALLOWED_AUTONOMY.includes(input.assistantAutonomy))out.assistantAutonomy=input.assistantAutonomy;const booking=httpsUrl(input.bookingUrl);if(booking)out.bookingUrl=booking;
  if(input.businessHours&&typeof input.businessHours==='object'){if(typeof input.businessHours.enabled==='boolean')out.businessHours.enabled=input.businessHours.enabled;out.businessHours.timezone=validTimezone(input.businessHours.timezone||out.businessHours.timezone);if(HHMM.test(String(input.businessHours.start||'')))out.businessHours.start=input.businessHours.start;if(HHMM.test(String(input.businessHours.end||'')))out.businessHours.end=input.businessHours.end;out.businessHours.days=validDays(input.businessHours.days??out.businessHours.days);}
  if(input.humanForward&&typeof input.humanForward==='object'){if(typeof input.humanForward.enabled==='boolean')out.humanForward.enabled=input.humanForward.enabled;if(typeof input.humanForward.outsideHoursOnly==='boolean')out.humanForward.outsideHoursOnly=input.humanForward.outsideHoursOnly;const p=validPhone(input.humanForward.number);if(p)out.humanForward.number=p;else if(input.humanForward.number==='')out.humanForward.number='';if(!out.humanForward.number)out.humanForward.enabled=false;}
  if(input.escalation&&typeof input.escalation==='object'){for(const k of ['complaints','customImplementation','lowConfidence'])if(typeof input.escalation[k]==='boolean')out.escalation[k]=input.escalation[k];}
  if(Array.isArray(input.recommendedLinks)){const keys=input.recommendedLinks.filter(k=>ALLOWED_LINK_KEYS.includes(k));out.recommendedLinks=[...new Set(keys)].slice(0,10);}
  return out;
}

function headers(){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'ai-kollege-owner-settings','Content-Type':'application/json'};h[['Author','ization'].join('')]=`Bearer ${process.env.LEADS_SECRET||''}`;return h;}
let repoCache={key:'',ok:false,checkedAt:0};
export async function privateStoreGate(){const repo=String(process.env.LEADS_REPO||''),secret=String(process.env.LEADS_SECRET||'');if(!secret||!repo.includes('/'))return{ok:false,error:'leads_not_configured'};const now=Date.now();if(repoCache.key===repo&&now-repoCache.checkedAt<300000)return repoCache.ok?{ok:true,repo}:{ok:false,error:'unsafe_lead_repository'};const r=await fetch(`https://api.github.com/repos/${repo}`,{headers:headers()});if(!r.ok)return{ok:false,error:`github_${r.status}`};const meta=await r.json();repoCache={key:repo,ok:meta?.private===true,checkedAt:now};return repoCache.ok?{ok:true,repo}:{ok:false,error:'unsafe_lead_repository'};}

export async function loadOwnerSettings(){const defaults=defaultOwnerSettings(),gate=await privateStoreGate();if(!gate.ok)return{settings:defaults,persisted:false,error:gate.error,source:'environment/defaults'};const r=await fetch(`https://api.github.com/repos/${gate.repo}/contents/${encodeURIComponent(SETTINGS_PATH)}`,{headers:headers()});if(r.status===404)return{settings:defaults,persisted:false,error:null,source:'defaults'};if(!r.ok)return{settings:defaults,persisted:false,error:`settings_read_${r.status}`,source:'defaults'};try{const data=await r.json(),parsed=JSON.parse(Buffer.from(data.content||'','base64').toString('utf8'));return{settings:sanitizeOwnerSettings(parsed,defaults),persisted:true,error:null,source:'private-store',sha:data.sha};}catch{return{settings:defaults,persisted:false,error:'settings_invalid',source:'defaults'};}}

export async function saveOwnerSettings(patch={}){const gate=await privateStoreGate();if(!gate.ok)return{ok:false,error:gate.error};const current=await loadOwnerSettings();const settings=sanitizeOwnerSettings(patch,current.settings);const url=`https://api.github.com/repos/${gate.repo}/contents/${encodeURIComponent(SETTINGS_PATH)}`;const body={message:'Update AI Kollege owner front-office settings',content:Buffer.from(JSON.stringify(settings,null,2)+'\n').toString('base64')};if(current.sha)body.sha=current.sha;const r=await fetch(url,{method:'PUT',headers:headers(),body:JSON.stringify(body)});if(!r.ok)return{ok:false,error:`settings_write_${r.status}`};return{ok:true,settings,persisted:true};}

export function isWithinBusinessHours(settings,now=new Date()){const h=settings?.businessHours;if(!h?.enabled)return true;const tz=validTimezone(h.timezone||'America/New_York');const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);const weekday=parts.find(p=>p.type==='weekday')?.value||'Mon';const map={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};const hour=parts.find(p=>p.type==='hour')?.value||'00',minute=parts.find(p=>p.type==='minute')?.value||'00',time=`${hour}:${minute}`;return h.days.includes(map[weekday])&&time>=h.start&&time<h.end;}

export function settingsFingerprint(settings){return crypto.createHash('sha256').update(JSON.stringify(sanitizeOwnerSettings(settings))).digest('hex').slice(0,12);}
