import { isAssistantConfigured, checkOwnerToken, handleAssistantAction } from '../lib/assistant-core.mjs';
import { rateLimit } from '../lib/secretary-core.mjs';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  return JSON.parse(req.body);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (!isAssistantConfigured()) return res.status(503).json({ ok: false, error: 'not_configured' });
  if (!checkOwnerToken(req.headers['authorization'])) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (!rateLimit('assistant', { limit: 30 })) return res.status(429).json({ ok: false, error: 'rate_limited' });

  let data;
  try {
    data = parseBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_request_body' });
  }

  try {
    const result = await handleAssistantAction(data);
    return res.status(result.ok ? 200 : 502).json(result);
  } catch {
    return res.status(502).json({ ok: false, error: 'assistant_unavailable' });
  }
}
