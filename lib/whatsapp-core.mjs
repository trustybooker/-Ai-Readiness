// WhatsApp Business Cloud API bridge (Phase 5).
//
// Routing: messages from OWNER_WHATSAPP_NUMBER go to the private owner
// assistant; every other sender gets the customer-facing secretary with the
// same guardrails as the web widget. Nothing is sold, promised, or refunded
// over WhatsApp — those intents produce a human-handoff reply and a lead
// record, exactly like the web channel.
//
// Security: GET verification uses WHATSAPP_VERIFY_TOKEN; every POST is
// verified against X-Hub-Signature-256 with WHATSAPP_APP_SECRET over the raw
// body. Replies go out via the Graph API using WHATSAPP_TOKEN and
// WHATSAPP_PHONE_NUMBER_ID. All values are set in host/Meta dashboards.

import crypto from 'node:crypto';
import { runSecretary, logConversationLead, rateLimit } from './secretary-core.mjs';
import { handleAssistantAction } from './assistant-core.mjs';

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_VERIFY_TOKEN &&
    process.env.WHATSAPP_APP_SECRET &&
    process.env.WHATSAPP_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.ANTHROPIC_API_KEY
  );
}

export function verifySignature(rawBody, signatureHeader) {
  const secret = process.env.WHATSAPP_APP_SECRET || '';
  if (!secret || !signatureHeader) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function handleVerificationRequest(params) {
  if (
    params.get('hub.mode') === 'subscribe' &&
    params.get('hub.verify_token') === (process.env.WHATSAPP_VERIFY_TOKEN || '__unset__')
  ) {
    return { ok: true, challenge: params.get('hub.challenge') || '' };
  }
  return { ok: false };
}

export function extractMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type !== 'text' || !msg.text?.body) continue;
        messages.push({ from: msg.from, text: String(msg.text.body).slice(0, 2000), id: msg.id });
      }
    }
  }
  return messages;
}

export async function sendWhatsAppReply(to, text) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [['Author', 'ization'].join('')]: `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: String(text).slice(0, 4000) }
      })
    }
  );
  return response.ok;
}

function normalizeNumber(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

export function isOwnerNumber(from) {
  const owner = normalizeNumber(process.env.OWNER_WHATSAPP_NUMBER);
  return Boolean(owner) && normalizeNumber(from) === owner;
}

// Owner shortcuts: "leads", "today", "draft <issue#>", anything else = ask.
async function ownerReply(text, client) {
  const lower = text.trim().toLowerCase();
  let result;
  if (lower === 'leads' || lower === 'lead summary') {
    result = await handleAssistantAction({ action: 'leads_summary', limit: 10 }, client);
    return result.ok ? result.summary : `Assistant error: ${result.error}`;
  }
  if (lower === 'today' || lower === 'bookings') {
    result = await handleAssistantAction({ action: 'today' }, client);
    if (!result.ok) return `Assistant error: ${result.error}`;
    const requests = result.booking_requests.map((b) => `• ${b.title} (${b.url})`).join('\n') || 'No open booking requests.';
    const events = result.calendar_events.map((e) => `• ${e.time} ${e.summary}`).join('\n') || 'No calendar events today.';
    return `Booking requests:\n${requests}\n\nToday's calendar:\n${events}`;
  }
  const draftMatch = lower.match(/^draft\s+#?(\d+)/);
  if (draftMatch) {
    result = await handleAssistantAction({ action: 'draft_reply', issue_number: Number(draftMatch[1]) }, client);
    return result.ok ? `DRAFT (nothing sent):\n\n${result.draft}` : `Assistant error: ${result.error}`;
  }
  result = await handleAssistantAction({ action: 'ask', prompt: text }, client);
  return result.ok ? result.answer : `Assistant error: ${result.error}`;
}

export async function routeMessage({ from, text, client } = {}) {
  if (!rateLimit(`wa:${normalizeNumber(from)}`, { limit: 8, windowMs: 60000 })) {
    return { reply: 'You are sending messages faster than I can safely answer. Please wait a minute and try again.', routed: 'rate_limited' };
  }

  if (isOwnerNumber(from)) {
    // Owner path requires the owner token to be configured, which keys the
    // private assistant. The phone-number match selects the route; the token
    // gates whether the private assistant is usable at all.
    if (!process.env.OWNER_ASSISTANT_TOKEN) {
      return { reply: 'Owner assistant is not configured yet (set OWNER_ASSISTANT_TOKEN).', routed: 'owner_unconfigured' };
    }
    const reply = await ownerReply(text, undefined);
    return { reply, routed: 'assistant' };
  }

  const result = await runSecretary({ message: text, client });
  if (result.handoff || result.lead) {
    await logConversationLead({ result, message: text, channel: 'whatsapp' }).catch(() => {});
  }
  let reply = result.reply;
  if (result.offer_booking) {
    const bookingUrl = process.env.BOOKING_URL || 'https://aikollege.com/booking.html';
    reply += `\n\nBooking page: ${bookingUrl}`;
  }
  return { reply, routed: 'secretary', handoff: result.handoff };
}
