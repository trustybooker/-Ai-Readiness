import fs from 'node:fs';

const requiredFiles = [
  'index.html','answers.html','checklist.html','lab.html','thanks.html','favicon.svg','site.webmanifest',
  'answer/what-is-ai-readiness.html','answer/how-to-prove-ai-skills-on-resume.html','answer/why-train-before-ai-automation.html','answer/what-is-an-ai-readiness-audit.html','answer/what-not-to-put-into-ai-tools.html','answer/how-small-businesses-start-ai-safely.html',
  'assets/styles.css','assets/impact.css','assets/app.js','assets/fifynow-logo.svg','assets/og-ai-readiness-pass.svg','assets/completion-badge.svg',
  'robots.txt','sitemap.xml','netlify/functions/capture-lead.mjs',
  'docs/master-platform-skill.md','docs/skill-registry.md','docs/two-layer-growth-system.md','docs/media-prompts/google-flow-video-prompts.md','docs/fast-payment-plan.md','docs/imagery-system.md','docs/crm-capture-system.md','docs/first-party-lead-system.md','docs/response-system.md','docs/business-operating-system.md','docs/onboarding-offboarding-refunds.md','docs/implementation-playbook.md','docs/certification-standards.md','docs/production-readiness-audit-2026-06-25.md','docs/agent-command-center.md','docs/final-production-test-matrix.md','docs/live-launch-runbook.md',
  'course/level-1-ai-readiness-foundations.md','course/level-2-ai-job-productivity-pass.md','course/level-3-business-ai-readiness.md','course/level-4-implementation-partner-track.md','course/ai-readiness-workbook.md'
];

const requiredIndexSnippets = ['Know if you are AI-ready before the market exposes you.','fifynow@fifynowllc.com','fifynow@gmail.com','_cc','data-question','score_summary','recommended_path','lead_tier','utm_source','https://formsubmit.co/fifynow@fifynowllc.com','application/ld+json','FAQPage','OfferCatalog','No fake testimonials','Fast payment path','No. This is educational readiness, training, and implementation support.'];
const requiredScriptSnippets = ['AI literacy','Job readiness','Workflow readiness','score_summary','chooseRecommendation','hydrateCaptureFields','capture-lead','email fallback','lead_tier','hasQuiz','form[name]:not(#quiz)','Request human review'];
const requiredFunctionSnippets = ['LEADS_SECRET','LEADS_REPO','api.github.com','issues','ai-readiness-pass','priority-hot','postIssue'];
const requiredSitemapSnippets = ['checklist.html','lab.html','what-is-ai-readiness.html','how-to-prove-ai-skills-on-resume.html','why-train-before-ai-automation.html','what-is-an-ai-readiness-audit.html','what-not-to-put-into-ai-tools.html','how-small-businesses-start-ai-safely.html'];
const requiredAnswersSnippets = ['Layer 2: answer hub','checklist.html','lab.html','answer/what-is-ai-readiness.html','answer/how-small-businesses-start-ai-safely.html'];
const requiredLayerSnippets = ['Layer 1: Conversion Page','Layer 2: Answer Hub','checklist.html','lab.html'];
const requiredBrandSnippets = ['fifynow-logo.svg','stop-color:#1e5bb5','stop-color:#2563eb','M14.7 6.3'];
const requiredWorkbookSnippets = ['Level 1 worksheet','Level 2 worksheet','Level 3 worksheet','Level 4 worksheet','Reviewer checklist','Completion badge wording'];
const requiredLaunchSnippets = ['Deploy preview','Configure first-party tracker','Verify fallback email','Add payment links','Final QA'];
const requiredMatrixSnippets = ['Public route smoke tests','Visual QA','Quiz QA','Lead capture QA','Truth and compliance QA','Launch decision'];
const requiredMasterSkillSnippets = ['Audit first','Truth first','two-layer system','Daily session behavior','Done means'];
const requiredRegistrySnippets = ['Production Architect','Frontend UX Engineer','Lead Systems Engineer','SEO AEO Strategist','Skill update protocol','Image and icon context'];

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
requireSnippets('docs/two-layer-growth-system.md', requiredLayerSnippets, 'two-layer doc');
requireSnippets('assets/styles.css', ['fifynow-logo.svg'], 'styles.css');
requireSnippets('assets/fifynow-logo.svg', requiredBrandSnippets.slice(1), 'official logo');
requireSnippets('assets/og-ai-readiness-pass.svg', ['FIFY NOW LLC','M14.7 6.3'], 'social preview');
requireSnippets('site.webmanifest', ['assets/fifynow-logo.svg'], 'manifest');
requireSnippets('assets/completion-badge.svg', ['AI READINESS','COMPLETION BADGE','FIFY NOW LLC'], 'completion badge');
requireSnippets('course/ai-readiness-workbook.md', requiredWorkbookSnippets, 'workbook');
requireSnippets('docs/live-launch-runbook.md', requiredLaunchSnippets, 'launch runbook');
requireSnippets('docs/final-production-test-matrix.md', requiredMatrixSnippets, 'test matrix');
requireSnippets('docs/master-platform-skill.md', requiredMasterSkillSnippets, 'master platform skill');
requireSnippets('docs/skill-registry.md', requiredRegistrySnippets, 'skill registry');

if (fs.existsSync('test-multiline.txt') || fs.existsSync('test-raw.txt')) failures.push('Temporary test files must not be committed.');

if (failures.length) {
  console.error('AI Readiness Pass validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Readiness Pass validation passed.');
