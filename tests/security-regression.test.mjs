import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reserveWebhookEvent} from '../lib/webhook-replay.mjs';
import {memoryKeySource} from '../lib/channel-memory.mjs';

function text(path){return fs.readFileSync(path,'utf8');}

test('browser security policy blocks framing, objects, inline script attributes and foreign base URLs',()=>{const n=text('netlify.toml');assert.match(n,/Content-Security-Policy/);for(const d of ["default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'none'","script-src-attr 'none'","form-action 'self'","upgrade-insecure-requests"])assert.ok(n.includes(d),`missing CSP directive ${d}`);assert.match(n,/Cross-Origin-Opener-Policy = "same-origin"/);});

test('public AI and owner APIs reject oversized bodies before JSON parsing',()=>{for(const f of ['netlify/functions/secretary.mjs','netlify/functions/assistant.mjs','netlify/functions/social-ops.mjs','netlify/functions/momo-bridge.mjs']){const s=text(f),size=s.indexOf('request_too_large'),parse=s.indexOf('req.json()');assert.ok(size>=0,`${f} missing size guard`);assert.ok(size<parse,`${f} parses before size guard`);}});

test('WhatsApp validates signature, bounds payload and reserves message id before routing',()=>{const s=text('netlify/functions/whatsapp-webhook.mjs');assert.ok(s.indexOf('request_too_large')<s.indexOf('req.text()'));assert.ok(s.indexOf('verifySignature')<s.indexOf('JSON.parse(rawBody)'));assert.ok(s.indexOf("reserveWebhookEvent('whatsapp',message.id)")<s.indexOf('routeMessage({ from: message.from'));});

test('replay guard blocks same webhook id even when durable store is unavailable',async()=>{const oldRepo=process.env.LEADS_REPO,oldSecret=process.env.LEADS_SECRET;delete process.env.LEADS_REPO;delete process.env.LEADS_SECRET;const id=`security-${Date.now()}-${Math.random()}`;const first=await reserveWebhookEvent('whatsapp',id),second=await reserveWebhookEvent('whatsapp',id);assert.equal(first.duplicate,false);assert.equal(second.duplicate,true);if(oldRepo)process.env.LEADS_REPO=oldRepo;if(oldSecret)process.env.LEADS_SECRET=oldSecret;});

test('conversation encryption supports a dedicated stable key independent of GitHub token rotation',()=>{const oldMemory=process.env.CHANNEL_MEMORY_KEY,oldLead=process.env.LEADS_SECRET;process.env.CHANNEL_MEMORY_KEY='test-memory-key-not-production';process.env.LEADS_SECRET='rotatable-github-token';assert.equal(memoryKeySource(),'dedicated');if(oldMemory===undefined)delete process.env.CHANNEL_MEMORY_KEY;else process.env.CHANNEL_MEMORY_KEY=oldMemory;if(oldLead===undefined)delete process.env.LEADS_SECRET;else process.env.LEADS_SECRET=oldLead;});

test('public lead capture has both edge and application throttling',()=>{const s=text('netlify/functions/capture-lead.mjs');assert.match(s,/rateLimit:\{windowLimit:/);assert.match(s,/throttle\(`lead:\$\{ip\}`/);assert.match(s,/request_too_large/);});

test('Owner Studio remains noindex, no-store and authorization-header protected',()=>{const n=text('netlify.toml'),o=text('owner.html'),a=text('netlify/functions/assistant.mjs');assert.match(n,/X-Robots-Tag = "noindex, nofollow, noarchive"/);assert.match(n,/Cache-Control = "no-store, private"/);assert.match(o,/noindex/i);assert.match(a,/checkOwnerToken\(req\.headers\.get\('authorization'\)\)/);});

test('dangerous dynamic execution primitives are absent from production application code',()=>{const files=['assets/app.js','assets/secretary.js','assets/owner-assistant.js','assets/social-ops.js','lib/assistant-core.mjs','lib/secretary-core.mjs','lib/social-ops.mjs','lib/whatsapp-core.mjs'];for(const f of files){const s=text(f);assert.doesNotMatch(s,/\beval\s*\(/,`${f} uses eval`);assert.doesNotMatch(s,/new\s+Function\s*\(/,`${f} uses Function constructor`);assert.doesNotMatch(s,/document\.write\s*\(/,`${f} uses document.write`);}});
