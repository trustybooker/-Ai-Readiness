# AI Secretary, Owner Assistant, and WhatsApp/Base44 Setup

All secrets are set by the owner in host dashboards (Netlify/Vercel env vars,
Meta app dashboard, Base44 config). Nothing is committed to the repo. Every
endpoint returns `503 not_configured` until its secrets exist — no stubs.

## Endpoints

Both platforms serve the same three endpoints (Netlify path first, Vercel second):

| Purpose | Netlify | Vercel |
| --- | --- | --- |
| Lead capture (existing) | `/.netlify/functions/capture-lead` | `/api/capture-lead` |
| AI Secretary (public, customer-facing) | `/.netlify/functions/secretary` | `/api/secretary` |
| Owner Assistant (private, token auth) | `/.netlify/functions/assistant` | `/api/assistant` |
| WhatsApp webhook | `/.netlify/functions/whatsapp-webhook` | `/api/whatsapp-webhook` |

## Environment variables (host dashboard, never in repo)

| Variable | Used by | Purpose |
| --- | --- | --- |
| `LEADS_SECRET` | capture-lead, secretary, assistant | GitHub token that writes lead issues |
| `LEADS_REPO` | same | `owner/repo` for lead issues (defaults to this repo) |
| `ANTHROPIC_API_KEY` | secretary, assistant, whatsapp | Claude API key |
| `SECRETARY_MODEL` | secretary | optional; defaults to `claude-opus-4-8` |
| `ASSISTANT_MODEL` | assistant | optional; defaults to `claude-opus-4-8` |
| `BOOKING_URL` | secretary, whatsapp | scheduler link offered in replies (optional) |
| `OWNER_ASSISTANT_TOKEN` | assistant, whatsapp owner route | long random string; Bearer token for the private assistant |
| `GOOGLE_CALENDAR_ICS_URL` | assistant `today` | optional; the private iCal address of the owner's calendar |
| `WHATSAPP_VERIFY_TOKEN` | whatsapp | any random string; must match the value entered in the Meta dashboard |
| `WHATSAPP_APP_SECRET` | whatsapp | Meta app secret; signs every webhook delivery |
| `WHATSAPP_TOKEN` | whatsapp | WhatsApp Business Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | whatsapp | the business phone number ID from Meta |
| `OWNER_WHATSAPP_NUMBER` | whatsapp | the owner's personal number; routes to the private assistant |

## AI Secretary (public)

- `POST /api/secretary` with `{"message": "...", "history": [{"role":"user","text":"..."}], "channel": "web"}`.
- Replies `{ok, reply, handoff, offer_booking, booking_url, logged}`.
- Grounded ONLY on approved site content (`lib/secretary-core.mjs`); refuses to
  improvise pricing, discounts, refunds, or outcomes; hands anything involving
  money, legal, complaints, or complex needs to a human and logs the transcript
  as a GitHub Issue lead (`[Secretary]` title, `priority-hot` when handoff).
- The site widget (`assets/secretary.js`) renders only when the owner flips
  `secretary.enabled` to `true` in `assets/site-config.js` AFTER the endpoint
  works on the deployed site.

## Owner Assistant (private)

- `POST /api/assistant` with header `Authorization: Bearer <OWNER_ASSISTANT_TOKEN>`.
- Actions:
  - `{"action":"leads_summary"}` — open leads, one line each, offer mapping, who to answer first.
  - `{"action":"draft_reply","issue_number":12}` — returns a DRAFT; nothing is ever sent automatically.
  - `{"action":"today"}` — open `[Booking]` requests + today's events from the private ICS feed when configured.
  - `{"action":"ask","prompt":"..."}` — freeform, grounded on current leads.
- Customer data stays between the owner's GitHub lead repo and the owner's
  configured Anthropic API account. No third-party analytics or storage.

## WhatsApp Business Cloud API

1. In the Meta developer dashboard, create/select the WhatsApp app, add the
   webhook URL (either platform's `whatsapp-webhook` endpoint), enter the same
   string you set as `WHATSAPP_VERIFY_TOKEN`, and subscribe to `messages`.
2. Meta sends `GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`;
   the endpoint echoes the challenge only when the token matches.
3. Every `POST` is verified against `X-Hub-Signature-256` (HMAC-SHA256 of the
   raw body with `WHATSAPP_APP_SECRET`). Invalid signatures get 401 and are
   never processed.
4. Routing: `OWNER_WHATSAPP_NUMBER` → private assistant (shortcuts: `leads`,
   `today`, `draft <issue#>`, or freeform). Everyone else → the public
   secretary with identical guardrails to the web widget.
5. Hard human-approval boundary: nothing is sold, promised, or refunded over
   WhatsApp. Purchase/refund intents produce a handoff reply, a lead issue,
   and a pointer to the booking page. Payment links are never sent by the bot.

## Base44 superagent

Base44 calls the same two authenticated endpoints:

- Secretary: `POST https://<deployed-site>/api/secretary` (no auth needed —
  it is the public assistant; rate limited per IP).
- Assistant: `POST https://<deployed-site>/api/assistant` with the
  `Authorization: Bearer <OWNER_ASSISTANT_TOKEN>` header stored in Base44's
  secret config.

Give the Base44 agent one rule: customer-facing questions go to the secretary
endpoint; owner operations (summaries, drafts, bookings) go to the assistant
endpoint with the token. The human-approval step lives server-side, so no
Base44 prompt mistake can sell, promise, or refund anything.

## Rate limiting and its limits

Endpoints use per-instance in-memory limits (secretary 10/min per IP,
assistant 30/min, WhatsApp 8/min per sender). Serverless instances scale out,
so these are best-effort backstops — for hard limits add the host's edge rate
limiting (Netlify rate limiting / Vercel WAF) in the dashboard at launch.

## Live verification checklist (owner)

1. Set env vars → redeploy → `POST /api/secretary` returns a grounded reply.
2. Ask the secretary for a discount → reply refuses and `handoff` is true →
   a `[Secretary]` issue appears in the lead repo.
3. `POST /api/assistant` without the token → 401; with it → leads summary.
4. Meta webhook verify passes; a test WhatsApp message gets a reply; a
   message from the owner number returns the leads summary.
5. Only then flip `secretary.enabled` in `assets/site-config.js`.
