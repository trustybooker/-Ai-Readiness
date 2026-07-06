import fs from 'node:fs';

const requiredFiles = ['index.html','booking.html','answers.html','checklist.html','lab.html','thanks.html','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','assets/styles.css','assets/impact.css','assets/app.js','assets/site-config.js','assets/fifynow-logo.svg','assets/og-ai-readiness-pass.svg','assets/completion-badge.svg','assets/ai-readiness-visual.svg','netlify/functions/capture-lead.mjs','api/capture-lead.mjs','vercel.json','docs/world-skill.md','docs/master-platform-skill.md','docs/skill-registry.md','docs/problem-first-jesus-solomon-operating-code.md','docs/skill-upgrade-protocol.md','docs/winning-skill.md','docs/app-audit-summary.txt'];

const requiredText = {
  'index.html': ['AI Kollege','Problem first','What problem are you trying to solve?','Wisdom before automation','https://aikollege.com/','data-question','score_summary','lead_tier','data-payment-key','data-booking-link'],
  'booking.html': ['AI Kollege','Problem-first AI review','What problem should we review before the call?','No fake availability','ai-readiness-booking','preferred_time_1','preferred_time_2','preferred_time_3'],
  'answers.html': ['AI Kollege Answers','Direct answers for AI problems','Move from reading into problem-solving','answer/what-is-ai-readiness.html'],
  'checklist.html': ['AI Kollege Checklist','Free problem-first checklist','What problem do you need to solve first?'],
  'lab.html': ['AI Kollege Lab','Keep solving AI problems','What problem should the Lab help you keep solving?'],
  'assets/app.js': ['capture-lead','email fallback','data-payment-key','data-booking-link'],
  'assets/site-config.js': ['bookingUrl','aiStarterPass','businessAiReadinessAudit'],
  'assets/fifynow-logo.svg': ['AI Kollege logo','AI'],
  'assets/og-ai-readiness-pass.svg': ['AI KOLLEGE','AI Readiness Pass'],
  'assets/completion-badge.svg': ['AI KOLLEGE','COMPLETION BADGE'],
  'assets/ai-readiness-visual.svg': ['AI Kollege Readiness View','Readiness Score'],
  'sitemap.xml': ['https://aikollege.com/','booking.html','answer/what-is-ai-readiness.html'],
  'robots.txt': ['https://aikollege.com/sitemap.xml'],
  'docs/world-skill.md': ['The Jesus Pattern for business','Fruit','long-term mission'],
  'docs/master-platform-skill.md': ['Daily value first','Creator consistency engine','Winning Skill output','First question before every build'],
  'docs/skill-registry.md': ['The Winning Skill','Skill quality standard','problem-first filter','customer-fruit measure'],
  'docs/problem-first-jesus-solomon-operating-code.md': ['Stop looking for the gold','Gold is an effect','Jesus + Solomon synthesis'],
  'docs/skill-upgrade-protocol.md': ['A skill is not a slogan','The Boss Skill upgraded','The World Skill upgraded'],
  'docs/winning-skill.md': ['Audience is not vanity','Daily content rule','The audience signal rule','The three positioning questions','30-day content-to-cash loop','Next 72-hour move'],
  'docs/app-audit-summary.txt': ['Homepage now leads with the real problem','Public canonical URLs now point to the AI Kollege domain','Validation now checks the upgraded skill docs'],
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

for (const file of ['index.html','booking.html','answers.html','checklist.html','lab.html','sitemap.xml','robots.txt']) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('fifynowllc.com/ai-readiness-pass')) failures.push(`${file} has legacy public URL`);
  if (text.includes('validation-note')) failures.push(`${file} has internal validation note`);
}

if (failures.length) {
  console.error('AI Kollege validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Kollege validation passed.');