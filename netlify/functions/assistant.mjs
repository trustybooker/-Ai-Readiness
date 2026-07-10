import { isAssistantConfigured, checkOwnerToken, handleAssistantAction } from '../../lib/assistant-core.mjs';
import { rateLimit } from '../../lib/secretary-core.mjs';

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  if (!isAssistantConfigured()) return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!checkOwnerToken(req.headers.get('authorization'))) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!rateLimit('assistant', { limit: 30 })) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_request_body' }, { status: 400 });
  }

  try {
    const result = await handleAssistantAction(data);
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false, error: 'assistant_unavailable' }, { status: 502 });
  }
};

export const config = { path: '/.netlify/functions/assistant' };
