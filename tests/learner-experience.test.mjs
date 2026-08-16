import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TRACKS,ROLE_FAMILIES,learnerPayload,normalizeRole} from '../lib/learner-catalog.mjs';

const html=fs.readFileSync(new URL('../learner.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../assets/learner.js',import.meta.url),'utf8');
const purchase=fs.readFileSync(new URL('../assets/purchase-verification.js',import.meta.url),'utf8');
const fn=fs.readFileSync(new URL('../netlify/functions/learner-content.mjs',import.meta.url),'utf8');

test('both paid offers have six structured artifact modules',()=>{
  for(const key of ['ai_starter_pass','ai_job_productivity_pass']){
    assert.equal(TRACKS[key].modules.length,6);
    for(const m of TRACKS[key].modules){assert.ok(m.why&&m.see&&m.try&&m.check&&m.artifact);}
  }
});

test('role families include practical and safety-sensitive contexts',()=>{
  for(const key of ['job_seeker','admin_ops','customer_service','healthcare_support','trades','marketing','small_business','creative'])assert.ok(ROLE_FAMILIES[key]);
  assert.equal(normalizeRole('Trades / field service'),'trades');
});

test('learner payload is offer-scoped and role-adaptive',()=>{
  const d=learnerPayload('ai_job_productivity_pass',{role:'healthcare_support',goal:'safer work'});
  assert.equal(d.offer_key,'ai_job_productivity_pass');
  assert.equal(d.role.key,'healthcare_support');
  assert.match(d.role.example,/clinical judgment/i);
  assert.equal(learnerPayload('other',{}),null);
});

test('paid content is server-gated by Stripe verification',()=>{
  assert.match(fn,/STRIPE_SECRET_KEY/);
  assert.match(fn,/classifyCheckoutSession/);
  assert.match(fn,/paid_entitlement_not_verified/);
  assert.doesNotMatch(js,/AI can draft, summarize, organize and compare/);
  assert.match(js,/\.netlify\/functions\/learner-content/);
});

test('verified purchase receives a direct learner entry',()=>{
  assert.match(purchase,/learner\.html\?session_id=/);
  assert.match(purchase,/Start my verified pass/);
  assert.match(purchase,/d\.verified/);
});

test('learner workspace is noindex and provides progress, export, reset and adaptive controls',()=>{
  assert.match(html,/noindex,nofollow,noarchive/);
  for(const marker of ['data-progress','data-export','data-reset','data-personalize','data-profile-role','data-module-host','data-proof-pack'])assert.match(html,new RegExp(marker));
  assert.match(js,/localStorage\.setItem/);
  assert.match(js,/proof-pack\.txt/);
  assert.match(js,/Delete locally saved profile, progress and artifacts/);
});

test('completion requires actual artifact work plus all quality checks',()=>{
  assert.match(js,/artifactText\(m\)\.length>=40/);
  assert.match(js,/track\.rubric\.every/);
  assert.match(js,/moduleDone/);
  assert.match(js,/Complete every evidence gate before final export/);
});
