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
  'docs/media-prompts/google-flow-video-prompts.md',
  'docs/fast-payment-plan.md',
  'docs/imagery-system.md',
  'docs/crm-capture-system.md'
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
  'lead_tier',
  'Request human review'
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

if (fs.existsSync('test-multiline.txt') || fs.existsSync('test-raw.txt')) {
  failures.push('Temporary test files must not be committed.');
}

if (failures.length) {
  console.error('AI Readiness Pass validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AI Readiness Pass validation passed.');
