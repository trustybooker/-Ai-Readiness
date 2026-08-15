import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui=fs.readFileSync(new URL('../assets/social-control.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../assets/owner-icons.js',import.meta.url),'utf8');
const endpoint=fs.readFileSync(new URL('../netlify/functions/social-ops.mjs',import.meta.url),'utf8');

test('Owner Studio loads dedicated social control',()=>{assert.match(loader,/social-control\.js/);assert.match(ui,/data-social-control/);assert.match(ui,/Draft → review → approve → schedule/);});
test('social control uses owner-authenticated server endpoint',()=>{assert.match(ui,/\/api\/social-ops/);assert.match(ui,/authorization':'Bearer/);assert.match(endpoint,/checkOwnerToken/);});
test('draft creation does not expose a direct publish action',()=>{assert.match(ui,/create_draft/);assert.match(ui,/publish_check/);assert.doesNotMatch(ui,/action:'publish'/);assert.doesNotMatch(ui,/data-social-action="publish"/);});
test('owner approval is explicit and fingerprint-bound in UI',()=>{assert.match(ui,/confirm\(`Approve social operation/);assert.match(ui,/content fingerprint/);assert.match(ui,/current\?\.fingerprint/);});
test('unsafe state transitions stay disabled client-side and enforced server-side',()=>{assert.match(ui,/approve:st==='review'/);assert.match(ui,/schedule:st==='approved'/);assert.match(endpoint,/updateSocialOp\(data\.issue_number,'approved'/);assert.match(endpoint,/updateSocialOp\(data\.issue_number,'scheduled'/);});
test('social platform readiness is status-only and secrets are never rendered',()=>{assert.match(ui,/Not configured on the server/);assert.doesNotMatch(ui,/META_ACCESS_TOKEN|LINKEDIN_ACCESS_TOKEN|TIKTOK_ACCESS_TOKEN/);});
