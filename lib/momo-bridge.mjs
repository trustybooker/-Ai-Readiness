import crypto from 'node:crypto';
import { privateStoreGate } from './owner-settings.mjs';

export const MOMO_BRIDGE_VERSION='2026-08-15-v2';
export const MOMO_ALLOWED_ACTIONS=Object.freeze(['health','business_snapshot','lead_summary','draft_followup','propose_social_draft','social_status']);

function safeEqual(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&x.length>0&&crypto.timingSafeEqual(x,y);}
export function momoConfigured(){return Boolean(process.env.MOMO_INTEGRATION_TOKEN);}
export function checkMomoToken(header){return safeEqual(String(header||'').replace(/^Bearer\s+/i,''),process.env.MOMO_INTEGRATION_TOKEN||'');}
export function momoCapabilities(){return {version:MOMO_BRIDGE_VERSION,mode:'approval-gated',actions:[...MOMO_ALLOWED_ACTIONS],writes:'private-draft-only',payments:false,refunds:false,customer_messages:false,social_publish:false,social_approve:false};}
export async function momoHealth(){const gate=await privateStoreGate();return {ok:true,configured:momoConfigured(),private_store:gate.ok?'ready':gate.error||'not_ready',capabilities:momoCapabilities()};}

// MoMo may observe business state, request drafts and save private social proposals.
// It cannot approve, schedule, publish, delete remote content, refund, charge, or message customers.
export function validateMomoAction(action){return MOMO_ALLOWED_ACTIONS.includes(String(action||''));}
