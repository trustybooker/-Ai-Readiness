import fs from 'node:fs';

const failures=[];
const required=[
  'lib/stripe-fulfillment.mjs',
  'netlify/functions/stripe-session.mjs',
  'netlify/functions/stripe-webhook.mjs',
  'netlify/functions/learner-content.mjs',
  'assets/purchase-verification.js',
  'purchase-success.html',
  'netlify.toml'
];
for(const file of required)if(!fs.existsSync(file))failures.push(`Missing Stripe production file: ${file}`);

function must(file,parts){
  if(!fs.existsSync(file))return;
  const text=fs.readFileSync(file,'utf8');
  for(const part of parts)if(!text.includes(part))failures.push(`${file} missing Stripe integrity control: ${part}`);
}

must('netlify/functions/stripe-session.mjs',[
  "req.method!=='GET'",
  'STRIPE_SECRET_KEY',
  'stripe_session_verification_not_configured',
  'SESSION_RE',
  'encodeURIComponent(id)',
  "'cache-control':'no-store'",
  'verifyCheckoutEntitlement',
  "entitlement:'active'",
  'rateLimit:{windowLimit:30'
]);

must('netlify/functions/learner-content.mjs',[
  "req.method!=='POST'",
  'STRIPE_SECRET_KEY',
  'verifyCheckoutEntitlement',
  "entitlement:'active'",
  'learnerPayload',
  'rateLimit:{windowLimit:30'
]);

must('netlify/functions/stripe-webhook.mjs',[
  "req.method!=='POST'",
  'STRIPE_WEBHOOK_SECRET',
  'stripe_webhook_not_configured',
  'MAX_BODY=256000',
  "req.headers.get('content-length')",
  'Buffer.byteLength(raw)',
  "req.headers.get('stripe-signature')",
  'verifyStripeSignature',
  'invalid_signature',
  'handleStripeEvent'
]);

must('lib/stripe-fulfillment.mjs',[
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  'timingSafeEqual',
  'toleranceSeconds=300',
  "business!=='AI Kollege'",
  "session.mode!=='payment'",
  "session.payment_status!=='paid'",
  'verifyCheckoutEntitlement',
  "status!=='succeeded'",
  'amount_refunded',
  'access_revoked_refunded',
  'access_paused_dispute',
  'privateStoreGate',
  'existingPurchase',
  'duplicate:true',
  'Do not put card data or secrets in this record.'
]);

must('assets/purchase-verification.js',[
  '/^cs_(?:test_|live_)?[A-Za-z0-9]+$/',
  'encodeURIComponent(sessionId)',
  "cache:'no-store'",
  'status.textContent=text',
  "hidden.name='verified_checkout_session'",
  "gtag('event','purchase_verified'"
]);

must('purchase-success.html',[
  'ai-kollege-buyer-onboarding',
  'purchase-verification.js'
]);

const netlify=fs.existsSync('netlify.toml')?fs.readFileSync('netlify.toml','utf8'):'';
for(const route of ['/api/stripe-session','/api/stripe-webhook'])if(!netlify.includes(`from = "${route}"`))failures.push(`netlify.toml missing Stripe route ${route}`);
if(!netlify.includes('for = "/api/*"')||!netlify.includes('Cache-Control = "no-store"'))failures.push('API no-store policy missing');

if(failures.length){
  console.error('Stripe production integrity gate failed:');
  for(const failure of failures)console.error('- '+failure);
  process.exit(1);
}
console.log('Stripe production integrity gate passed.');
