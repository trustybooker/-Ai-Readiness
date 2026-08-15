import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const html=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const forbidden=[
  /LEADS_(?:REPO|SECRET)/i,/OWNER_ACCESS_TOKEN/i,/TWILIO_HUMAN_FORWARD_NUMBER/i,
  /STRIPE_(?:SECRET_KEY|WEBHOOK_SECRET)/i,/CHANNEL_MEMORY_KEY/i,/META_ACCESS_TOKEN/i,
  /LINKEDIN_ACCESS_TOKEN/i,/TIKTOK_ACCESS_TOKEN/i,/\.netlify\/functions\//i,
  /ai-readiness-pass\.netlify\.app/i,/FIFYNOW_SITE_CONFIG/i,
  /verified private repositor(?:y|ies)/i,/private lead issue/i,/GitHub issue #/i
];
const failures=[];
for(const file of html){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(text))continue;
  for(const re of forbidden)if(re.test(text))failures.push(`${file}: public page contains internal implementation phrase matching ${re}`);
}
const config=fs.readFileSync(path.join(root,'assets/site-config.js'),'utf8');
for(const re of [/SECRET_KEY/i,/WEBHOOK_SECRET/i,/ACCESS_TOKEN/i,/HUMAN_FORWARD/i,/CHANNEL_MEMORY_KEY/i]){
  if(re.test(config))failures.push(`assets/site-config.js: public config contains secret/private key name matching ${re}`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`PASS public/private boundary audit (${html.length} HTML files inspected; noindex owner/buyer utility pages excluded from public-content rules where applicable)`);
