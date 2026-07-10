import {
  isWhatsAppConfigured,
  verifySignature,
  handleVerificationRequest,
  extractMessages,
  routeMessage,
  sendWhatsAppReply
} from '../lib/whatsapp-core.mjs';

// Signature verification needs the exact raw bytes Meta signed.
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const verification = handleVerificationRequest(params);
    if (verification.ok) return res.status(200).send(verification.challenge);
    return res.status(403).send('forbidden');
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (!isWhatsAppConfigured()) return res.status(503).json({ ok: false, error: 'not_configured' });

  const rawBody = await readRawBody(req);
  if (!verifySignature(rawBody, req.headers['x-hub-signature-256'])) {
    return res.status(401).json({ ok: false, error: 'invalid_signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_request_body' });
  }

  for (const message of extractMessages(payload)) {
    try {
      const { reply } = await routeMessage({ from: message.from, text: message.text });
      if (reply) await sendWhatsAppReply(message.from, reply);
    } catch { /* keep processing remaining messages */ }
  }
  return res.status(200).json({ ok: true });
}
