import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public site exposes the Twilio receptionist line and labels it correctly',()=>{const cfg=fs.readFileSync('assets/site-config.js','utf8');assert.match(cfg,/phoneE164:\s*'\+17726665472'/);assert.match(cfg,/Call AI receptionist/);assert.match(cfg,/ask for a human when needed/);});

test('public config never exposes the private human-forward environment value',()=>{const cfg=fs.readFileSync('assets/site-config.js','utf8');assert.doesNotMatch(cfg,/TWILIO_HUMAN_FORWARD_NUMBER\s*[:=]\s*['"]\+\d+/);});
