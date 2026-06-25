import fs from 'node:fs';

const requiredFiles = [
  'index.html','answers.html','checklist.html','lab.html','thanks.html',
  'answer/what-is-ai-readiness.html',
  'answer/how-to-prove-ai-skills-on-resume.html',
  'answer/why-train-before-ai-automation.html',
  'answer/what-is-an-ai-readiness-audit.html',
  'answer/what-not-to-put-into-ai-tools.html',
  'answer/how-small-businesses-start-ai-safely.html',
  'assets/styles.css','assets/impact.css','assets/app.js','assets/og-ai-readiness-pass.svg',
  'robots.txt','sitemap.xml','netlify/functions/capture-lead.mjs',
  'docs/media-prompts/google-flow-video-prompts.md','docs/fast-payment-plan.md','docs/imagery-system.md','docs/crm-capture-system.md','docs/first-party-lead-system.md','docs/response-system.md','docs/business-operating-system.md','docs/onboarding-offboarding-refunds.md','docs/implementation-playbook.md','docs/certification-standards.md',
  'course/level-1-ai-readiness-foundations.md','course/level-2-ai-job-productivity-pass.md','course/level-3-business-ai-readiness.md','course/level-4-implementation-partner-track.md'
];

const requiredIndexSnippets = [
  'Know if you are AI-ready before the market exposes you.','fifynow@fifynowllc.com','fifynow@gmail.com','_cc','data-question','score_summary','recommended_path','lead_tier','utm_source','https://formsubmit.co/fifynow@fifynowllc.com','application/ld+json','FAQPage','OfferCatalog','No fake testimonials','Fast payment path','No. This is educational readiness, training, and implementation support.'
];

const requiredScriptSnippets = [
  'AI literacy','Job readiness','Workflow readiness','score_summary','chooseRecommendation','hydrateCaptureFields','capture-lead','email fallback','lead_tier','hasQuiz','form[name]:not(#quiz)','Request human review'
];

const requiredFunctionSnippets = ['LEADS_SECRET','LEADS_REPO','api.github.com','issues','ai-readiness-pass','priority-hot','postIssue'];
const requiredSitemapSnippets = ['checklist.html','lab.html','what-is-ai-readiness.html','how-to-prove-ai-skills-on-resume.html','why-train-before-ai-automation.html','what-is-an-ai-readiness-audit.html','what-not-to-put-into-ai-tools.html','how-small-businesses-start-ai-safely.html'];
const requiredAnswersSnippets = ['Layer 2: answer hub','checklist.html','lab.html','answer/what-is-ai-readiness.html','answer/how-small-businesses-start-ai-safely.html'];

const failures = [];

for (const file of requiredFiles) if (!fs.existsSync(file)) failures.push(`Missing file: ${file}`);

function requireSnippets(file, snippets, label){
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const snippet of snippets) if (!text.includes(snippet)) failures.push(`${label} missing: ${snippet}`);
}

requireSnippets('index.html', requiredIndexSnippets, 'index.html');
requireSnippets('assets/app.js', requiredScriptSnippets, 'assets/app.js');
requireSnippets('netlify/functions/capture-lead.mjs', requiredFunctionSnippets, 'capture function');
requireSnippets('sitemap.xml', requiredSitemapSnippets, 'sitemap.xml');
requireSnippets('answers.html', requiredAnswersSnippets, 'answers.html');

if (fs.existsSync('test-multiline.txt') || fs.existsSync('test-raw.txt')) failures.push('Temporary test files must not be committed.');

if (failures.length) {
  console.error('AI Readiness Pass validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Readiness Pass validation passed.');
