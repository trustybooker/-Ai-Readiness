import { isAssistantConfigured, checkOwnerToken, handleAssistantAction } from '../../lib/assistant-core.mjs';
import { rateLimit } from '../../lib/secretary-core.mjs';
import {loadOwnerSettings} from '../../lib/owner-settings.mjs';

async function autonomyGate(data){const action=String(data?.action||'ask');if(!['draft_reply','lead_update'].includes(action))return null;const loaded=await loadOwnerSettings(),level=loaded.settings.assistantAutonomy||'draft';if(action==='draft_reply'&&level==='observe')return{ok:false,error:'draft_actions_disabled',required:'draft'};if(action==='lead_update'&&level!=='act-safe')return{ok:false,error:'safe_actions_disabled',required:'act-safe'};return null;}

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  const contentLength=Number(req.headers.get('content-length')||0);if(contentLength>131072)return Response.json({ok:false,error:'request_too_large'},{status:413});
  if (!isAssistantConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!checkOwnerToken(req.headers.get('authorization'))) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!rateLimit('assistant', { limit: 30 })) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  let data;try { data = await req.json(); } catch {return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 });}
  try {const gate=await autonomyGate(data);if(gate)return Response.json(gate,{status:403});const result = await handleAssistantAction(data);return Response.json(result, { status: result.ok ? 200 : 502 });}
  catch {return Response.json({ ok: false, error: 'assistant_unavailable' }, { status: 502 });}
};
export const config = {path: ['/.netlify/functions/assistant', '/api/assistant'],rateLimit: {windowLimit: 30,windowSize: 60,aggregateBy: ['ip', 'domain']}};
