import fs from 'node:fs';

const requiredFiles = ['index.html','booking.html','answers.html','checklist.html','lab.html','content-engine.html','courses.html','badge.html','refunds.html','thanks.html','assets/secretary.js','lib/secretary-core.mjs','lib/assistant-core.mjs','lib/whatsapp-core.mjs','netlify/functions/secretary.mjs','api/secretary.mjs','netlify/functions/assistant.mjs','api/assistant.mjs','netlify/functions/whatsapp-webhook.mjs','api/whatsapp-webhook.mjs','tests/capture-lead.test.mjs','tests/secretary.test.mjs','tests/assistant.test.mjs','tests/whatsapp.test.mjs','scripts/live-lead-test.mjs','docs/assistant-api-and-whatsapp-setup.md','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','assets/styles.css','assets/impact.css','assets/app.js','assets/site-config.js','assets/fifynow-logo.svg','assets/og-ai-readiness-pass.svg','assets/completion-badge.svg','assets/ai-readiness-visual.svg','netlify/functions/capture-lead.mjs','api/capture-lead.mjs','vercel.json','docs/world-skill.md','docs/master-platform-skill.md','docs/skill-registry.md','docs/problem-first-jesus-solomon-operating-code.md','docs/skill-upgrade-protocol.md','docs/winning-skill.md','docs/app-audit-summary.txt','docs/course-certification-model.md','docs/certification-standards.md','docs/user-flow-skills-alignment.md','docs/final-skills-alignment-audit.md','404.html','course/level-1-ai-readiness-foundations.md','course/level-2-ai-job-productivity-pass.md','course/level-3-business-ai-readiness.md','course/level-4-implementation-partner-track.md','course/ai-readiness-workbook.md'];

const requiredText = {
  'index.html': ['AI Kollege','What problem are you trying to solve?','Wisdom before automation','https://aikollege.com/','data-question','score_summary','lead_tier','data-payment-key','data-booking-link','How AI Kollege works','content-engine.html','checklist.html','lab.html','booking.html','courses.html','badge.html'],
  'courses.html': ['AI Kollege Courses and Paths','paths and offers, not accredited degrees','AI Starter Pass','AI Job &amp; Productivity Pass','Business AI Readiness Audit','Team Training Sprint','AI Implementation Partner','AI Kollege Lab','not a licensed college, university, or degree-granting school','No job, income, or revenue outcome is guaranteed','badge.html','Operated by Fify Now LLC'],
  'badge.html': ['AI Kollege Completion Badge','proof-of-work artifacts were submitted','human-reviewed only when a reviewer actually checked','Not accreditation','Not a job guarantee','Not an income or revenue guarantee','Not a legal or compliance certification','completion date and curriculum version','does not currently offer a public badge verification page','Operated by Fify Now LLC'],
  'refunds.html': ['Refund and credit terms','No blanket refund guarantee','No job, income, or revenue outcome is guaranteed','case by case','written scope','Operated by Fify Now LLC'],
  'lib/secretary-core.mjs': ['Never promise outcomes','Never improvise pricing, discounts, bundles, or refunds','Never take payment, send payment links, or confirm an appointment','set handoff to true','not accredited degrees','Human-approval boundary'],
  'lib/assistant-core.mjs': ['OWNER_ASSISTANT_TOKEN','timingSafeEqual','never send','DRAFT'],
  'lib/whatsapp-core.mjs': ['WHATSAPP_APP_SECRET','timingSafeEqual','hub.verify_token','OWNER_WHATSAPP_NUMBER','Nothing is sold, promised, or refunded'],
  'assets/secretary.js': ['secretaryConfig.enabled','a human reviews those'],
  'content-engine.html': ['AI Kollege Daily Content Engine','Post useful value daily','Audience signal','ai-kollege-signal','What should AI Kollege help solve next?'],
  'booking.html': ['AI Kollege','Problem-first AI review','What problem should we review before the call?','No fake availability','ai-readiness-booking','preferred_time_1','preferred_time_2','preferred_time_3'],
  'answers.html': ['AI Kollege Answers','Direct answers for AI problems','Move from reading into problem-solving','answer/what-is-ai-readiness.html'],
  'checklist.html': ['AI Kollege Checklist','Free problem-first checklist','What problem do you need to solve first?'],
  'lab.html': ['AI Kollege Lab','Keep solving AI problems','What problem should the Lab help you keep solving?'],
  'assets/app.js': ['capture-lead','email fallback','data-payment-key','data-booking-link','selfServeKeys'],
  'assets/site-config.js': ['bookingUrl','aiStarterPass','businessAiReadinessAudit'],
  'assets/fifynow-logo.svg': ['AI Kollege logo','AI'],
  'assets/og-ai-readiness-pass.svg': ['AI KOLLEGE','AI Readiness Pass'],
  'assets/completion-badge.svg': ['AI KOLLEGE','COMPLETION BADGE'],
  'assets/ai-readiness-visual.svg': ['AI Kollege Readiness View','Readiness Score'],
  'sitemap.xml': ['https://aikollege.com/','content-engine.html','booking.html','courses.html','badge.html','refunds.html','answer/what-is-ai-readiness.html'],
  'robots.txt': ['https://aikollege.com/sitemap.xml'],
  'docs/world-skill.md': ['The Jesus Pattern for business','Fruit','long-term mission'],
  'docs/master-platform-skill.md': ['Winning first','Daily value first','Creator consistency engine','First question before every build'],
  'docs/skill-registry.md': ['The Winning Skill','Skill quality standard','problem-first filter','customer-fruit measure'],
  'docs/problem-first-jesus-solomon-operating-code.md': ['Stop looking for the gold','Gold is an effect','Jesus + Solomon synthesis'],
  'docs/skill-upgrade-protocol.md': ['A skill is not a slogan','The Boss Skill upgraded','The World Skill upgraded'],
  'docs/winning-skill.md': ['The Winning Skill','Content is daily service at scale','The audience signal rule','The three positioning questions','30-day content-to-cash loop'],
  'docs/course-certification-model.md': ['AI Kollege Course and Completion Model','Score → problem → train → build proof → human review → badge → refresh','Winning Skill completion standard','User flow'],
  'docs/certification-standards.md': ['AI Kollege Completion and Badge Standards','Problem-first summary','Proof and signal awareness','AI Kollege Readiness Pass'],
  'docs/user-flow-skills-alignment.md': ['AI Kollege Skills-Aligned User Flow','Core flow','Skill alignment','Business model alignment'],
  'docs/final-skills-alignment-audit.md': ['Final Skills Alignment Audit','Repo-side ready','Live-production-ready','Winning Skill','QA Security Truth Auditor','Remaining external/live gates'],
  'course/level-1-ai-readiness-foundations.md': ['AI Kollege Readiness Foundations','Problem-first outcome','Daily value and audience signal','Completion badge language must say AI Kollege'],
  'course/level-2-ai-job-productivity-pass.md': ['AI Kollege Job and Productivity Pass','Audience signal and opportunity awareness','Three daily value posts','Signal log'],
  'course/level-3-business-ai-readiness.md': ['AI Kollege Business AI Readiness','Problem-size scoring','Revenue and signal map','Local Service Rescue Sprint'],
  'course/level-4-implementation-partner-track.md': ['AI Kollege Implementation Partner Track','Proof and signal report','Gate before implementation','Manual fallback'],
  'course/ai-readiness-workbook.md': ['AI Kollege Readiness Pass Workbook','Winning Skill intake','Signal log','Problem-first thinking','Proof and signal awareness'],
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

// Answer-hub pages are indexed at aikollege.com (sitemap), so their canonicals
// and the FormSubmit fallback redirect must stay on-domain — never the legacy
// fifynowllc.com URL or the old Netlify preview host.
const answerPages = fs.existsSync('answer') ? fs.readdirSync('answer').filter((f) => f.endsWith('.html')).map((f) => `answer/${f}`) : [];
for (const file of ['index.html','booking.html','answers.html','checklist.html','lab.html','content-engine.html','courses.html','badge.html','refunds.html','sitemap.xml','robots.txt', ...answerPages]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('fifynowllc.com/ai-readiness-pass')) failures.push(`${file} has legacy public URL`);
  if (text.includes('ai-readiness-pass.netlify.app')) failures.push(`${file} has off-domain redirect/host`);
  if (text.includes('validation-note')) failures.push(`${file} has internal validation note`);
}

// Secret hygiene: keys live in host dashboards, never in the repo.
for (const file of ['assets/site-config.js','netlify.toml','vercel.json']) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/sk-ant-|sk-proj-|whsec_|EAAG[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}/.test(text)) failures.push(`${file} appears to contain a committed secret`);
}

if (failures.length) {
  console.error('AI Kollege validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Kollege validation passed.');