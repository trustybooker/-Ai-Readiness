import fs from 'node:fs';
import path from 'node:path';

const requiredFiles=['index.html','booking.html','answers.html','checklist.html','checklist-start.html','lab.html','content-engine.html','courses.html','badge.html','refunds.html','thanks.html','purchase-success.html','owner.html','assets/owner-assistant.js','assets/secretary.js','assets/ai-kollege-logo.svg','lib/secretary-core.mjs','lib/assistant-core.mjs','lib/whatsapp-core.mjs','netlify/functions/secretary.mjs','netlify/functions/twilio-voice.mjs','netlify/functions/assistant.mjs','netlify/functions/whatsapp-webhook.mjs','netlify/functions/capture-lead.mjs','api/secretary.mjs','api/assistant.mjs','api/whatsapp-webhook.mjs','api/capture-lead.mjs','assets/styles.css','assets/impact.css','assets/app.js','assets/site-config.js','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','privacy.html','404.html','vercel.json','netlify.toml'];
const failures=[];for(const f of requiredFiles)if(!fs.existsSync(f))failures.push(`Missing file: ${f}`);
const checks={
  'index.html':['AI Kollege','data-question','data-payment-key','data-booking-link','booking.html','courses.html'],
  'purchase-success.html':['noindex','same email address you used at checkout','Submitting this form does not create a new charge','matched separately before paid learning access'],
  'owner.html':['noindex','AI Kollege Owner Studio','data-token','data-unlock','data-avatar','owner-assistant.js','phone_handoffs','pipeline_health','business_links','/booking.html','/courses.html'],
  'assets/owner-assistant.js':['sessionStorage','Bearer ','Locked','safeHref','link-chip','record-card','pipeline_health','business_links'],
  'assets/app.js':['capture-lead','fallbackFormAction','data-payment-key','data-booking-link','checkout_started','booking_clicked','applyPathDefaults','fetchWithTimeout','Sending…','submission_id','_gotcha','nativeFallback'],
  'assets/site-config.js':['bookingUrl','fallbackFormAction','aiStarterPass','aiJobProductivityPass'],
  'assets/styles.css':['ai-kollege-logo.svg'],
  'assets/impact.css':['AI Kollege public visual system'],
  'favicon.svg':['AI Kollege logo'],
  'lib/assistant-core.mjs':['OWNER_ASSISTANT_TOKEN','timingSafeEqual','phone_handoffs','Never send','DRAFT','unsafe_lead_repository','BUSINESS_LINKS','pipeline_health','business_links','suggestBusinessLinks'],
  'lib/secretary-core.mjs':['Never promise outcomes','Never improvise pricing, discounts, bundles, or refunds','Human-approval boundary','unsafe_lead_repository'],
  'netlify/functions/capture-lead.mjs':['unsafe_lead_repository','private===true','Submission ID','findDuplicate','request_too_large'],
  'api/capture-lead.mjs':['unsafe_lead_repository','private===true','Submission ID','findDuplicate','request_too_large'],
  'netlify/functions/twilio-voice.mjs':['TWILIO_AUTH_TOKEN','x-twilio-signature','CallSid','TWILIO_HUMAN_FORWARD_NUMBER'],
  'lib/whatsapp-core.mjs':['WHATSAPP_APP_SECRET','timingSafeEqual','hub.verify_token'],
  'sitemap.xml':['https://aikollege.com/'],'robots.txt':['https://aikollege.com/sitemap.xml']
};
for(const [f,parts] of Object.entries(checks)){if(!fs.existsSync(f))continue;const t=fs.readFileSync(f,'utf8');for(const p of parts)if(!t.includes(p))failures.push(`${f} missing: ${p}`);}
const owner=fs.existsSync('owner.html')?fs.readFileSync('owner.html','utf8'):'';if(owner&&!owner.includes('noindex'))failures.push('owner.html must be noindex');if(/OWNER_ASSISTANT_TOKEN\s*[:=]\s*["'][^"']+/.test(owner))failures.push('owner.html appears to embed owner token');
const sitemap=fs.existsSync('sitemap.xml')?fs.readFileSync('sitemap.xml','utf8'):'';if(/owner(?:\.html)?</.test(sitemap))failures.push('private owner cockpit must not appear in sitemap');
const netlify=fs.existsSync('netlify.toml')?fs.readFileSync('netlify.toml','utf8'):'';for(const route of ['/api/capture-lead','/api/secretary','/api/assistant','/api/whatsapp-webhook','/api/twilio-voice'])if(!netlify.includes(`from = "${route}"`))failures.push(`netlify.toml missing ${route}`);if(!netlify.includes('from = "/course/*"'))failures.push('paid course source must remain blocked');if(!netlify.includes('from = "/owner"'))failures.push('clean private /owner route missing');if(!netlify.includes('microphone=(self)'))failures.push('same-origin microphone permission missing');if(!netlify.includes('X-Robots-Tag = "noindex, nofollow, noarchive"'))failures.push('owner noindex response header missing');
for(const f of ['assets/site-config.js','netlify.toml','vercel.json','owner.html','assets/owner-assistant.js']){if(!fs.existsSync(f))continue;const t=fs.readFileSync(f,'utf8');if(/sk-ant-|sk-proj-|whsec_|EAAG[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}/.test(t))failures.push(`${f} appears to contain a committed secret`);}
const publicPages=['index.html','booking.html','answers.html','checklist.html','checklist-start.html','lab.html','content-engine.html','courses.html','badge.html','refunds.html','privacy.html','purchase-success.html','thanks.html'];for(const f of publicPages){if(!fs.existsSync(f))continue;const t=fs.readFileSync(f,'utf8');if(t.includes('fifynowllc.com/ai-readiness-pass'))failures.push(`${f} has legacy public URL`);if(t.includes('ai-readiness-pass.netlify.app'))failures.push(`${f} has off-domain public URL`);for(const phrase of ['lead tier for human follow-up','self-serve once tested','once enabled','payment record of truth','Human-value follow-up standard'])if(t.includes(phrase))failures.push(`${f} exposes internal language: ${phrase}`);if(/href\s*=\s*["']javascript:/i.test(t))failures.push(`${f} contains javascript: navigation`);}

// Internal navigation audit: every local .html/root link must resolve, and local fragments must exist.
function resolveLocal(from,href){const clean=href.split('?')[0],parts=clean.split('#'),raw=parts[0],fragment=parts[1]||'';if(!raw)return{file:from,fragment};if(raw==='/')return{file:'index.html',fragment};const base=raw.startsWith('/')?raw.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(from),raw));return{file:base.endsWith('/')?base+'index.html':base,fragment};}
for(const f of [...publicPages,'404.html']){if(!fs.existsSync(f))continue;const html=fs.readFileSync(f,'utf8');for(const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)){const href=match[1].trim();if(!href||/^(https?:|mailto:|tel:|data:)/i.test(href))continue;const {file,fragment}=resolveLocal(f,href);if(!file.endsWith('.html')&&file!=='index.html')continue;if(!fs.existsSync(file)){failures.push(`${f} broken internal link: ${href} -> ${file}`);continue;}if(fragment){const target=fs.readFileSync(file,'utf8');const escaped=fragment.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(!new RegExp(`(?:id|name)=["']${escaped}["']`,'i').test(target))failures.push(`${f} broken fragment: ${href}`);}}}

if(failures.length){console.error('AI Kollege validation failed:');for(const f of failures)console.error('- '+f);process.exit(1);}console.log('AI Kollege production wiring validation passed.');
