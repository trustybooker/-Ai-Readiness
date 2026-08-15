# AI Kollege Telephone Secretary — Twilio production setup

## Architecture

The telephone Secretary is another channel into the existing AI Kollege Secretary brain. It does not have separate pricing, refund, booking, or promise authority.

Incoming call → Twilio Voice webhook → signed-request validation → Twilio speech/DTMF Gather → AI Kollege Secretary → TwiML spoken response → repeat or human handoff.

## Required Netlify environment variables

Never commit these values to GitHub.

- `TWILIO_AUTH_TOKEN` — Twilio Auth Token used only to validate `X-Twilio-Signature` on inbound Voice webhooks.
- `PUBLIC_SITE_URL` — set to the exact public host Twilio calls. While Netlify is primary, use `https://ai-readiness-pass.netlify.app`. After `aikollege.com` is correctly attached and Twilio is switched to it, update this to `https://aikollege.com`.
- `TWILIO_HUMAN_FORWARD_NUMBER` — optional E.164 number to try when the caller says “human”, presses 0, or the Secretary returns `handoff: true`. If absent, the call is logged for follow-up instead of silently dialing an unknown number.

The existing `ANTHROPIC_API_KEY`, `LEADS_SECRET`, and `LEADS_REPO` are reused by the Secretary and lead-handoff pipeline.

## Twilio phone-number Voice configuration

In Twilio Console → Phone Numbers → Manage → Active numbers → select the number assigned to AI Kollege:

- **A call comes in:** Webhook
- **URL:** `https://ai-readiness-pass.netlify.app/.netlify/functions/twilio-voice`
- **HTTP method:** `POST`

Use the direct Netlify Function URL for the Twilio webhook so request-signature validation is based on exactly the URL Twilio signs. `/api/twilio-voice` is an approved public alias for diagnostics/integration compatibility, but the Twilio Console should use the direct function URL.

## Call behavior

1. Greeting identifies AI Kollege and Fify Now and states that the caller is speaking with the AI Secretary.
2. Caller can speak naturally or press keypad digits.
3. Say “human”, “person”, “representative”, “agent”, or “operator”, or press `0`, to request human handling.
4. Normal questions reuse the same approved Secretary reasoning and safety boundaries as website chat/voice.
5. The Secretary may explain published offers, courses, readiness score, badge, and booking process.
6. It must not invent discounts, promise refunds/outcomes, take card details, or pretend a booking is confirmed.
7. Questions requiring authority trigger human handoff and lead logging.
8. If `TWILIO_HUMAN_FORWARD_NUMBER` is configured, Twilio attempts a live transfer; otherwise the handoff is logged for follow-up.
9. No call recording is enabled by this implementation. Do not turn recording on casually; recording/consent requirements must be reviewed for the caller’s jurisdiction before enabling it.

## Security

- HTTPS only.
- Every inbound Voice POST must carry a valid `X-Twilio-Signature` derived from the exact webhook URL and POST fields.
- Invalid or unsigned calls receive HTTP 403 before any AI work is performed.
- Caller-level application rate limiting plus Netlify edge rate limiting are both applied.
- `TWILIO_AUTH_TOKEN` is never returned to the browser or logged.
- The phone channel shares the Secretary’s human-approval boundary.

## Go-live gate

Do not call the telephone Secretary production-live until all are true:

1. `TWILIO_AUTH_TOKEN` is installed in Netlify.
2. `PUBLIC_SITE_URL` matches the exact Twilio webhook host.
3. Twilio number Voice webhook points to the direct function URL using POST.
4. A real inbound call receives the greeting.
5. Normal speech is transcribed and answered aloud.
6. “Give me 90% off and guarantee a refund” is refused and handed off.
7. Pressing `0` or saying “human” produces the intended transfer/follow-up behavior.
8. A silent/no-input call exits cleanly instead of looping forever.
9. No card/payment credentials are requested over the AI call.
