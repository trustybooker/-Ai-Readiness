import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js=fs.readFileSync(new URL('../assets/secretary.js',import.meta.url),'utf8');

test('public receptionist reads canonical AI Kollege config first',()=>{
  assert.match(js,/window\.AIKOLLEGE_SITE_CONFIG\s*\|\|\s*window\.FIFYNOW_SITE_CONFIG/);
  assert.match(js,/secretaryConfig\.enabled/);
});

test('public receptionist identifies itself consistently and keeps human handoff language',()=>{
  assert.match(js,/AI Kollege Receptionist/);
  assert.match(js,/human handoff available/i);
  assert.match(js,/cannot take card details/i);
});
