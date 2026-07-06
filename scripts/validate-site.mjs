import fs from 'node:fs';

const requiredFiles = ['index.html','booking.html','answers.html','checklist.html','lab.html','thanks.html','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','assets/styles.css','assets/impact.css','assets/app.js','assets/site-config.js','assets/fifynow-logo.svg','assets/og-ai-readiness-pass.svg','assets/completion-badge.svg','assets/ai-readiness-visual.svg','netlify/functions/capture-lead.mjs','api/capture-lead.mjs','vercel.json'];

const requiredText = {
  'index.html': ['AI Kollege','Know if you are AI-ready before the market exposes you.','data-question','score_summary','lead_tier','data-payment-key','data-booking-link'],
  'booking.html': ['AI readiness review','ai-readiness-booking','preferred_time_1','preferred_time_2','preferred_time_3','No fake availability'],
  'answers.html': ['AI readiness answer center','answer/what-is-ai-readiness.html'],
  'checklist.html': ['Free checklist','AI Readiness Checklist'],
  'lab.html': ['AI Readiness Lab','interest list'],
  'assets/app.js': ['capture-lead','email fallback','data-payment-key','data-booking-link'],
  'assets/site-config.js': ['bookingUrl','aiStarterPass','businessAiReadinessAudit'],
  'assets/fifynow-logo.svg': ['AI Kollege logo','AI'],
  'assets/og-ai-readiness-pass.svg': ['AI KOLLEGE','AI Readiness Pass'],
  'assets/completion-badge.svg': ['AI KOLLEGE','COMPLETION BADGE'],
  'assets/ai-readiness-visual.svg': ['AI Kollege Readiness View','Readiness Score'],
  'sitemap.xml': ['https://aikollege.com/','booking.html','answer/what-is-ai-readiness.html'],
  'robots.txt': ['https://aikollege.com/sitemap.xml'],
  'netlify/functions/capture-lead.mjs': ['LEADS_SECRET','LEADS_REPO','issues','[Booking]'],
  'api/capture-lead.mjs': ['LEADS_SECRET','LEADS_REPO','issues','[Booking]']
};

const failures = [];
for (const file of requiredFiles) if (!fs.existsSync(file)) failures.push(`Missing file: ${file}`);
for (const [file, snippets] of Object.entries(requiredText)) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const snippet of snippets) if (!text.includes(snippet)) failures.push(`${file} missing: ${snippet}`);
}

if (failures.length) {
  console.error('AI Kollege validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Kollege validation passed.');