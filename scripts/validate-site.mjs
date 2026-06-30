import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'index.html','booking.html','answers.html','checklist.html','lab.html','thanks.html','favicon.svg','site.webmanifest',
  'answer/why-ai-readiness-matters-for-everyone.html','answer/what-is-ai-readiness.html','answer/how-to-prove-ai-skills-on-resume.html','answer/why-train-before-ai-automation.html','answer/what-is-an-ai-readiness-audit.html','answer/what-not-to-put-into-ai-tools.html','answer/how-small-businesses-start-ai-safely.html',
  'assets/styles.css','assets/impact.css','assets/app.js','assets/site-config.js','assets/fifynow-logo.svg','assets/og-ai-readiness-pass.svg','assets/completion-badge.svg','assets/ai-readiness-visual.svg','assets/ai-context-icons.svg',
  'robots.txt','sitemap.xml','netlify.toml','netlify/functions/capture-lead.mjs','vercel.json','api/capture-lead.mjs',
  'docs/master-platform-skill.md','docs/skill-registry.md','docs/two-layer-growth-system.md','docs/media-prompts/google-flow-video-prompts.md','docs/fast-payment-plan.md','docs/imagery-system.md','docs/crm-capture-system.md','docs/first-party-lead-system.md','docs/lead-tracker-host-setup.md','docs/response-system.md','docs/sales-conversion-system.md','docs/human-value-standard.md','docs/business-operating-system.md','docs/onboarding-offboarding-refunds.md','docs/implementation-playbook.md','docs/certification-standards.md','docs/course-certification-model.md','docs/production-readiness-audit-2026-06-25.md','docs/agent-command-center.md','docs/final-production-test-matrix.md','docs/live-launch-runbook.md','docs/live-preview-guide.md','docs/visual-qa-report-2026-06-25.md','docs/payments-booking-analytics-setup.md','docs/internal-booking-system.md','docs/friction-gap-audit.md','docs/codex-access-and-audit-runbook.md','docs/vercel-deployment-guide.md',
  'course/level-1-ai-readiness-foundations.md','course/level-2-ai-job-productivity-pass.md','course/level-3-business-ai-readiness.md','course/level-4-implementation-partner-track.md','course/ai-readiness-workbook.md'
];

const requiredIndexSnippets = ['Know if you are AI-ready before the market exposes you.','fifynow@fifynowllc.com','fifynow@gmail.com','_cc','data-question','score_summary','recommended_path','lead_tier','utm_source','application/ld+json','FAQPage','OfferCatalog','No fake testimonials','Fast payment path','data-payment-key','data-booking-link','assets/site-config.js','No. This is educational readiness, training, and implementation support.'];
const requiredBookingSnippets = ['Internal booking request system','Request a real AI readiness review time','ai-readiness-booking','preferred_time_1','preferred_time_2','preferred_time_3','Google Calendar invite','No fake availability'];
const requiredScriptSnippets = ['AI literacy','Job readiness','Workflow readiness','score_summary','chooseRecommendation','hydrateCaptureFields','capture-lead','/.netlify/functions/capture-lead','/api/capture-lead','email fallback','lead_tier','hasQuiz','form[name]:not(#quiz)','Request human review','loadAnalytics','data-payment-key','data-booking-link','googleAnalyticsId','plausibleDomain'];
const requiredConfigSnippets = ['bookingUrl','calendar.app.google','googleAnalyticsId','plausibleDomain','aiStarterPass','businessAiReadinessAudit','implementationReviewDeposit','aiReadinessLab'];
const requiredFunctionSnippets = ['LEADS_SECRET','LEADS_REPO','api.github.com','issues','ai-readiness-pass','priority-hot','priority-booking','[Booking]','Preferred time 1','postIssue','invalid_request_body','lead_tracker_failed'];
const requiredVercelSnippets = ['buildCommand','npm run validate','outputDirectory','/ai-readiness-pass','/api/capture-lead'];
const requiredSitemapSnippets = ['why-ai-readiness-matters-for-everyone.html','booking.html','answers.html','checklist.html','lab.html','what-is-ai-readiness.html','how-to-prove-ai-skills-on-resume.html','why-train-before-ai-automation.html','what-is-an-ai-readiness-audit.html','what-not-to-put-into-ai-tools.html','how-small-businesses-start-ai-safely.html'];
const requiredAnswersSnippets = ['Layer 2: answer hub','why-ai-readiness-matters-for-everyone.html','checklist.html','lab.html','answer/what-is-ai-readiness.html','answer/how-small-businesses-start-ai-safely.html'];
const requiredNetlifySnippets = ['/ai-readiness-pass/answer/:slug','/ai-readiness-pass/assets/:splat','/ai-readiness-pass/sitemap.xml','/ai-readiness-pass/robots.txt','X-Frame-Options'];
const requiredWorkbookSnippets = ['Level 1 worksheet','Level 2 worksheet','Level 3 worksheet','Level 4 worksheet','Reviewer checklist','Review rubric','Portfolio summary','Completion badge wording'];
const requiredSalesSnippets = ['Sales principle','Offer-fit matrix','Conversion metrics','Sales quality standard','Human-first close'];
const requiredHumanValueSnippets = ['Human Value Standard','Help before selling','Visitor outcomes','Offer ethics','Follow-up standard'];
const requiredSetupSnippets = ['Payment setup','Payment-link sales order','Booking conversion rule','Sales events to review manually','Do not add a link until it has been tested'];
const requiredMatrixSnippets = ['Public route smoke tests','Visual QA','Quiz QA','Lead capture QA','Business flow QA','SEO/AEO QA','Truth and compliance QA','Launch decision'];

const failures = [];
for (const file of requiredFiles) if (!fs.existsSync(file)) failures.push(`Missing file: ${file}`);

function requireSnippets(file, snippets, label){
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const snippet of snippets) if (!text.includes(snippet)) failures.push(`${label} missing: ${snippet}`);
}

function localTargetExists(fromFile, rawTarget){
  if (!rawTarget || rawTarget.startsWith('#')) return true;
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(rawTarget)) return true;
  const cleanTarget = rawTarget.split('#')[0].split('?')[0];
  if (!cleanTarget) return true;
  if (cleanTarget.startsWith('/')) return true;
  const resolved = path.normalize(path.join(path.dirname(fromFile), cleanTarget));
  return fs.existsSync(resolved);
}

function checkHtmlLocalRefs(file){
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  const attrRe = /\b(?:href|src)=['"]([^'"]+)['"]/g;
  for (const match of text.matchAll(attrRe)) {
    if (!localTargetExists(file, match[1])) failures.push(`${file} has missing local reference: ${match[1]}`);
  }
}

function checkSitemapTargets(){
  if (!fs.existsSync('sitemap.xml')) return;
  const text = fs.readFileSync('sitemap.xml', 'utf8');
  const locRe = /<loc>https:\/\/fifynowllc\.com\/ai-readiness-pass\/?([^<]*)<\/loc>/g;
  for (const match of text.matchAll(locRe)) {
    let target = match[1] || 'index.html';
    if (!target || target === '/') target = 'index.html';
    if (!path.extname(target)) target = target.replace(/\/$/, '') || 'index.html';
    if (target === '') target = 'index.html';
    if (!fs.existsSync(target)) failures.push(`sitemap.xml points to missing file: ${target}`);
  }
}

function checkConfiguredUrls(){
  if (!fs.existsSync('assets/site-config.js')) return;
  const text = fs.readFileSync('assets/site-config.js', 'utf8');
  const allowedKeys = ['bookingUrl','aiStarterPass','aiJobProductivityPass','businessAiReadinessAudit','teamTrainingDeposit','implementationReviewDeposit','aiReadinessLab'];
  for (const key of allowedKeys) {
    const match = text.match(new RegExp(`${key}:\\s*'([^']*)'`));
    if (!match) failures.push(`site-config missing key: ${key}`);
    const value = match?.[1] || '';
    if (value && !value.startsWith('https://')) failures.push(`site-config ${key} must be https or empty`);
  }
}

requireSnippets('index.html', requiredIndexSnippets, 'index.html');
requireSnippets('booking.html', requiredBookingSnippets, 'booking.html');
requireSnippets('assets/app.js', requiredScriptSnippets, 'assets/app.js');
requireSnippets('assets/site-config.js', requiredConfigSnippets, 'site config');
requireSnippets('netlify/functions/capture-lead.mjs', requiredFunctionSnippets, 'capture function');
requireSnippets('api/capture-lead.mjs', requiredFunctionSnippets, 'Vercel capture function');
requireSnippets('vercel.json', requiredVercelSnippets, 'vercel.json');
requireSnippets('sitemap.xml', requiredSitemapSnippets, 'sitemap.xml');
requireSnippets('answers.html', requiredAnswersSnippets, 'answers.html');
requireSnippets('netlify.toml', requiredNetlifySnippets, 'netlify.toml');
requireSnippets('assets/impact.css', ['ai-readiness-visual.svg','impact-card:after','tiles span:before','cards article h3:before'], 'impact.css');
requireSnippets('assets/ai-readiness-visual.svg', ['AI Readiness Pass visual system','Readiness Score','Human checkpoint','Proof-of-work implementation'], 'AI readiness visual');
requireSnippets('assets/ai-context-icons.svg', ['icon-score','icon-shield','icon-calendar','icon-workflow'], 'context icons');
requireSnippets('assets/fifynow-logo.svg', ['stop-color:#1e5bb5','stop-color:#2563eb','M14.7 6.3'], 'official logo');
requireSnippets('assets/og-ai-readiness-pass.svg', ['FIFY NOW LLC','M14.7 6.3'], 'social preview');
requireSnippets('site.webmanifest', ['assets/fifynow-logo.svg'], 'manifest');
requireSnippets('assets/completion-badge.svg', ['AI READINESS','COMPLETION BADGE','FIFY NOW LLC'], 'completion badge');
requireSnippets('course/ai-readiness-workbook.md', requiredWorkbookSnippets, 'workbook');
requireSnippets('docs/sales-conversion-system.md', requiredSalesSnippets, 'sales conversion system');
requireSnippets('docs/human-value-standard.md', requiredHumanValueSnippets, 'human value standard');
requireSnippets('docs/payments-booking-analytics-setup.md', requiredSetupSnippets, 'payment booking analytics setup');
requireSnippets('docs/final-production-test-matrix.md', requiredMatrixSnippets, 'test matrix');
requireSnippets('docs/live-launch-runbook.md', ['Deploy preview','Configure first-party tracker','Verify fallback email','Add payment links','Final QA'], 'launch runbook');
requireSnippets('docs/lead-tracker-host-setup.md', ['LEADS_REPO','LEADS_SECRET','Redeploy the site','Do not commit private access values'], 'lead tracker host setup');
requireSnippets('docs/friction-gap-audit.md', ['Friction reduced','Remaining external gaps','Business logic quality'], 'friction gap audit');
requireSnippets('docs/master-platform-skill.md', ['Audit first','Truth first','two-layer system','Daily session behavior','Done means'], 'master platform skill');
requireSnippets('docs/skill-registry.md', ['Production Architect','Frontend UX Engineer','Lead Systems Engineer','SEO AEO Strategist','Revenue Operator','Skill update protocol'], 'skill registry');
requireSnippets('docs/visual-qa-report-2026-06-25.md', ['repo-side visual QA','Official Fify Now LLC logo','Payment links are controlled','Live visual QA'], 'visual QA report');
requireSnippets('docs/internal-booking-system.md', ['Internal Booking System','booking.html','ai-readiness-booking','Google Calendar integration','No fake availability','Confirmation workflow'], 'internal booking system');
requireSnippets('docs/codex-access-and-audit-runbook.md', ['Codex Access and Audit Runbook','CONNECT tunnel failed','build/ai-readiness-pass','git fetch origin --prune'], 'Codex runbook');
requireSnippets('docs/vercel-deployment-guide.md', ['Vercel Deployment Guide','api/capture-lead.mjs','LEADS_SECRET','npm run validate','Use Netlify for the first production launch'], 'Vercel deployment guide');

for (const file of ['index.html','booking.html','answers.html','checklist.html','lab.html','thanks.html']) checkHtmlLocalRefs(file);
for (const dir of ['answer']) for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.html'))) checkHtmlLocalRefs(path.join(dir, file));
checkSitemapTargets();
checkConfiguredUrls();

if (fs.existsSync('test-multiline.txt') || fs.existsSync('test-raw.txt')) failures.push('Temporary test files must not be committed.');

if (failures.length) {
  console.error('AI Readiness Pass validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Readiness Pass validation passed.');