import fs from 'node:fs';

const requiredFiles = [
  'index.html',
  'assets/styles.css',
  'assets/impact.css',
  'assets/app.js',
  'assets/og-ai-readiness-pass.svg',
  'robots.txt',
  'sitemap.xml',
  'thanks.html',
  'answers.html',
  'netlify/functions/capture-lead.mjs',
  'docs/media-prompts/google-flow-video-prompts.md',
  'docs/fast-payment-plan.md',
  'docs/imagery-system.md',
  'docs/crm-capture-system.md',
  'docs/first-party-lead-system.md',
  'docs/response-system.md',
  'docs/business-operating-system.md',
  'docs/onboarding-offboarding-refunds.md',
  'docs/implementation-playbook.md',
  'docs/certification-standards.md',
  'course/level-1-ai-readiness-foundations.md',
  'course/level-2-ai-job-productivity-pass.md',
  'course/level-3-business-ai-readiness.md',
  'course/level-4-implementation-partner-track.md'
];

const requiredIndexSnippets = [
  'Know if you are AI-ready before the market exposes you.',
  'fifynow@fifynowllc.com',
  'fifynow@gmail.com',
  '_cc',
  'data-question',
  'score_summary',
  'recommended_path',
  'lead_tier',
  'utm_source',
  'https://formsubmit.co/fifynow@fifynowllc.com',
  'application/ld+json',
  'FAQPage',
  'OfferCatalog',
  'No fake testimonials',
  'Fast payment path',
  'No. This is educational readiness, training, and implementation support.'
];

const requiredScriptSnippets = [
  'AI literacy',
  'Job readiness',
  'Workflow readiness',
  'score_summary',
  'chooseRecommendation',
  'hydrateCaptureFields',
  'capture-lead',
  'email fallback',
  'lead_tier',
  'Request human review'
];

const requiredFunctionSnippets = [
  'LEADS_SECRET',
  'LEADS_REPO',
  'api.github.com',
  'issues',
  'ai-readiness-pass',
  'priority-hot'
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing file: ${file}`);
}

if (fs.existsSync('index.html')) {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const snippet of requiredIndexSnippets) {
    if (!html.includes(snippet)) failures.push(`index.html missing: ${snippet}`);
  }
}

if (fs.existsSync('assets/app.js')) {
  const js = fs.readFileSync('assets/app.js', 'utf8');
  for (const snippet of requiredScriptSnippets) {
    if (!js.includes(snippet)) failures.push(`assets/app.js missing: ${snippet}`);
  }
}

if (fs.existsSync('netlify/functions/capture-lead.mjs')) {
  const fn = fs.readFileSync('netlify/functions/capture-lead.mjs', 'utf8');
  for (const snippet of requiredFunctionSnippets) {
    if (!fn.includes(snippet)) failures.push(`capture function missing: ${snippet}`);
  }
}

if (fs.existsSync('test-multiline.txt') || fs.existsSync('test-raw.txt')) {
  failures.push('Temporary test files must not be committed.');
}

if (failures.length) {
  console.error('AI Readiness Pass validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Readiness Pass validation passed.');
