import crypto from 'node:crypto';
import { privateStoreGate } from './owner-settings.mjs';

export const MOMO_BRIDGE_VERSION='2026-08-15-v1';
export const MOMO_ALLOWED_ACTIONS=Object.freeze(['health','business_snapshot','lead_summary','draft_followup']);

function safeEqual(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&x.length>0&&crypto.timingSafeEqual(x,y);}
export function momoConfigured(){return Boolean(process.env.MOMO_INTEGRATION_TOKEN);}
export function checkMomoToken(header){return safeEqual(String(header||'').replace(/^Bearer\s+/i,''),process.env.MOMO_INTEGRATION_TOKEN||'');}
export function momoCapabilities(){return {version:MOMO_BRIDGE_VERSION,mode:'approval-gated',actions:[...MOMO_ALLOWED_ACTIONS],writes:false,payments:false,refunds:false,customer_messages:false};}
export async function momoHealth(){const gate=await privateStoreGate();return {ok:true,configured:momoConfigured(),private_store:gate.ok?'ready':gate.error||'not_ready',capabilities:momoCapabilities()};}

// Deliberately narrow adapter boundary. MoMo may observe business state and request drafts.
// Direct customer messaging, refunds, payments, routing and destructive operations remain outside this bridge.
export function validateMomoAction(action){return MOMO_ALLOWED_ACTIONS.includes(String(action||''));}
