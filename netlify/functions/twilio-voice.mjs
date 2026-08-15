import crypto from 'node:crypto';
import { isConfigured, runSecretary, logConversationLead, rateLimit } from '../../lib/secretary-core.mjs';

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const twiml = (body) => new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
  status: 200,
  headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store' }
});

function publicBase() {
  return (process.env.PUBLIC_SITE_URL || 'https://ai-readiness-pass.netlify.app').replace(/\/$/, '');
}

function voiceAction() {
  return `${publicBase()}/.netlify/functions/twilio-voice`;
}

function gather(prompt, { action = voiceAction(), timeout = 4 } = {}) {
  return `<Gather input="speech dtmf" action="${esc(action)}" method="POST" speechTimeout="auto" timeout="${timeout}" actionOnEmptyResult="true"><Say>${esc(prompt)}</Say></Gather>`;
}

function parseForm(raw) {
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

function hmacMatches(authToken, signature, url, params) {
  const suffix = Object.keys(params).sort().map((key) => key + params[key]).join('');
  const expected = crypto.createHmac('sha1', authToken).update(url + suffix).digest('base64');
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function validateTwilioRequest(req, params) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get('x-twilio-signature') || '';
  if (!authToken || !signature) return false;

  // Twilio signs the exact external webhook URL plus sorted POST fields.
  // Netlify may expose the same request through its canonical host, a custom
  // domain, or forwarded-host metadata. Validate only against concrete URLs
  // that represent this exact request; never skip HMAC verification.
  const incoming = new URL(req.url);
  const candidates = new Set([incoming.toString()]);
  candidates.add(`${publicBase()}${incoming.pathname}${incoming.search}`);

  const forwardedHost = String(req.headers.get('x-forwarded-host') || '').split(',')[0].trim();
  const forwardedProto = String(req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim() || 'https';
  if (forwardedHost) candidates.add(`${forwardedProto}://${forwardedHost}${incoming.pathname}${incoming.search}`);

  for (const url of candidates) {
    if (hmacMatches(authToken, signature, url, params)) return true;
  }
  return false;
}

function safeCaller(value) {
  return String(value || 'unknown').replace(/[^+0-9A-Za-z_-]/g, '').slice(0, 80) || 'unknown';
}

function callerMessage(params) {
  const speech = String(params.SpeechResult || '').trim();
  if (speech) return speech;
  const digits = String(params.Digits || '').trim();
  if (digits === '0') return 'I want a human';
  if (digits) return `Caller pressed ${digits}`;
  return '';
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });
  const raw = await req.text();
  const params = parseForm(raw);

  if (!validateTwilioRequest(req, params)) return new Response('forbidden', { status: 403 });
  if (!isConfigured()) return twiml('<Say>Our AI secretary is temporarily unavailable. Please visit AI Kollege online or leave a message after the tone.</Say><Hangup/>');

  const caller = safeCaller(params.From);
  if (!rateLimit(`voice:${caller}`)) return twiml('<Say>We received several requests very quickly. Please wait a moment and call again.</Say><Hangup/>');

  const message = callerMessage(params);
  const isNewCall = !message;
  if (isNewCall) {
    return twiml(
      gather('Thank you for calling AI Kollege, operated by Fify Now. I am the AI Secretary. You can speak naturally. I can explain our AI readiness score, training paths, courses, badge, and booking process. For a person, say human or press zero. How may I help you?') +
      '<Say>I did not hear anything. Please call again when you are ready.</Say><Hangup/>'
    );
  }

  if (/\b(human|person|representative|agent|operator)\b/i.test(message) || params.Digits === '0') {
    await logConversationLead({
      result: { reply: 'Caller requested human follow-up.', handoff: true, lead: true, offer_booking: true },
      message,
      history: [],
      channel: `phone:${caller}`
    }).catch(() => null);
    const transfer = String(process.env.TWILIO_HUMAN_FORWARD_NUMBER || '').trim();
    if (transfer) {
      return twiml(`<Say>One moment while I try to connect you.</Say><Dial timeout="20" answerOnBridge="true">${esc(transfer)}</Dial><Say>No one was available. I have marked this call for human follow-up.</Say><Hangup/>`);
    }
    return twiml('<Say>I have marked this call for human follow-up. Someone from AI Kollege can review it. You may also use the booking link on our website. Goodbye.</Say><Hangup/>');
  }

  try {
    const result = await runSecretary({ message, history: [] });
    if (result.handoff || result.lead) {
      await logConversationLead({ result, message, history: [], channel: `phone:${caller}` }).catch(() => null);
    }
    const reply = String(result.reply || 'I am sorry, I could not answer that safely. A human can follow up.').slice(0, 1800);
    if (result.handoff) {
      const transfer = String(process.env.TWILIO_HUMAN_FORWARD_NUMBER || '').trim();
      if (transfer) {
        return twiml(`<Say>${esc(reply)}</Say><Say>I will try to connect you with a person now.</Say><Dial timeout="20" answerOnBridge="true">${esc(transfer)}</Dial><Say>No one was available. Your request has been marked for human follow-up.</Say><Hangup/>`);
      }
      return twiml(`<Say>${esc(reply)}</Say><Say>Your request has been marked for human follow-up.</Say><Hangup/>`);
    }
    return twiml(`<Say>${esc(reply)}</Say>${gather('What else can I help you with? You can say human or press zero at any time.')}<Say>Thank you for calling AI Kollege. Goodbye.</Say><Hangup/>`);
  } catch {
    return twiml('<Say>I am having trouble answering right now. Please use the booking or request form on the AI Kollege website and a human will follow up. Goodbye.</Say><Hangup/>');
  }
};

export const config = {
  path: ['/.netlify/functions/twilio-voice', '/api/twilio-voice'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
