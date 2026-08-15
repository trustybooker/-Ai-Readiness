# AI Kollege Go-Live Runbook

Work these phases **top to bottom**. Each phase has a **GATE** — do not start the next phase until the current gate passes. The app becomes production-ready only at the end of Phase 8, not before.

Legend: 🧑 = dashboard/login work · 🤖 = repo-side work complete · ✅ = gate.

---

## Phase 0 — Repo candidate is ready
🤖 Code, tests, validation, and launch docs must be green on the exact release tip. Do not merge to `main` yet.

✅ **Gate:** PR #12 CI is green on the current `release/ai-kollege-launch` SHA.

---

## Phase 1 — Deploy the release branch (not main)
🧑 Netlify is the host.
1. Confirm the site is linked to `trustybooker/-Ai-Readiness`.
2. Production branch must be `release/ai-kollege-launch`.
3. Auto-publishing may remain on for that branch while launch QA is in progress.
4. Open the resulting production/deploy URL.

✅ **Gate:** homepage, `/courses.html`, `/badge.html`, `/privacy.html`, `/checklist.html`, `/checklist-start.html`, and several `/answer/*` pages load. `/docs/*`, `/course/*`, `/lib/*`, `/tests/*`, and `/scripts/*` return 404. The paid course markdown must stay non-public.

---

## Phase 2 — Configure first-party lead capture
🧑 In Netlify environment variables add:
- `LEADS_SECRET` = GitHub token permitted to create issues in the selected lead repo
- `LEADS_REPO` = `trustybooker/-Ai-Readiness` or a dedicated lead repository

Redeploy after changing environment variables.

✅ **Gate:** verified in Phase 3.

---

## Phase 3 — Prove leads and free-value fulfillment cannot dead-end
Against the deployed site:

```bash
SITE_URL=https://YOUR-SITE.netlify.app node scripts/live-lead-test.mjs
```

Then manually verify:
1. Complete the free score and confirm the recommended path is automatically carried into the review form rather than asking the user to choose it again.
2. Submit the homepage review form; confirm a GitHub Issue contains the expected contact, path, score/tier, source, timeline/budget, and message fields.
3. Submit the checklist form; confirm the user lands immediately on `/checklist-start.html` and can use the promised free checklist without waiting for an email.
4. Temporarily disable/misconfigure `LEADS_SECRET`; submit a test form and confirm the email fallback delivers it. Restore the correct secret immediately afterward.
5. Confirm submit buttons show a sending state and do not create accidental repeated submissions while the tracker is responding.

✅ **Gate:** first-party capture works, email fallback works, and the checklist is actually fulfilled immediately.

---

## Phase 4 — AI secretary and private owner assistant
🧑 Add to Netlify:
- `ANTHROPIC_API_KEY`
- `OWNER_ASSISTANT_TOKEN` = a long random private token
- optional: `BOOKING_URL`, `CALENDAR_TIMEZONE`, `GOOGLE_CALENDAR_ICS_URL`

Redeploy and test:
1. `POST /api/secretary` with a question about AI Kollege paths → grounded answer.
2. Ask for a discount/refund or other money decision → refusal/human handoff and appropriate lead record.
3. `POST /api/assistant` without Bearer token → 401.
4. With valid `Authorization: Bearer <OWNER_ASSISTANT_TOKEN>` → authorized owner action works.
5. Only after endpoint testing passes, change `secretary.enabled` to `true` in `assets/site-config.js` and redeploy.

✅ **Gate:** safe secretary behavior, private assistant authentication, no payment links or booking confirmations produced by the bot.

---

## Phase 5 — Stripe self-serve passes
🧑 Follow `docs/stripe-setup.md` exactly.

1. In **Stripe Test mode**, create one-time Payment Links for:
   - AI Starter Pass — $59
   - AI Job & Productivity Pass — $197
2. Set each Payment Link's after-payment redirect to:
   `https://aikollege.com/purchase-success.html`
3. Paste only the **test-mode** links into `assets/site-config.js` and redeploy.
4. Complete both test purchases with Stripe test card `4242 4242 4242 4242`.
5. For each purchase verify the complete user flow:
   site Buy button → Stripe Checkout → successful test payment → `/purchase-success.html` → buyer onboarding form → captured onboarding request.
6. Confirm visiting `/purchase-success.html` directly does **not** grant paid material or claim payment; Stripe remains the payment record of truth.
7. Only after both end-to-end test purchases pass, create Live-mode Payment Links with the same return URL, replace the test URLs, and redeploy.

✅ **Gate:** both self-serve offers pass the full test path before any live link is used. Business audit, team sprint, implementation, and Lab remain review-first.

---

## Phase 6 — WhatsApp + Base44 (optional for initial web launch)
🧑 Configure in Netlify after Meta authorization:
`WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `OWNER_WHATSAPP_NUMBER`.

Then:
1. Verify the webhook handshake.
2. Reject a bad `X-Hub-Signature-256`.
3. Customer message → grounded secretary response.
4. Owner-number message → private owner routing.
5. Confirm the bot never sells, refunds, sends a payment link, or claims to confirm a booking.

✅ **Gate:** verification/signature/routing and approval boundaries pass.

---

## Phase 7 — Custom domain and on-domain behavior
🧑 Add `aikollege.com` to the Netlify site and point DNS correctly; confirm Netlify SSL is active.

Verify:
1. `https://aikollege.com/` and all important public pages load over HTTPS.
2. Canonicals, sitemap, robots, Open Graph assets, and structured data resolve on-domain.
3. Lead-form `_next` fallbacks land in their correct on-domain states:
   - review → `/thanks.html?type=review`
   - booking → `/thanks.html?type=booking`
   - Lab → `/thanks.html?type=lab`
   - audience signal → `/thanks.html?type=signal`
   - checklist → `/checklist-start.html`
   - buyer onboarding → `/thanks.html?type=buyer-onboarding`
4. Stripe after-payment URL is `/purchase-success.html`.
5. The configured Google Calendar scheduler opens correctly from the live domain.

✅ **Gate:** HTTPS, canonical/SEO assets, contextual confirmations, scheduler, and checkout return are all correct on `aikollege.com`.

---

## Phase 8 — Full test matrix, then merge
Run `docs/final-production-test-matrix.md` against the live domain: routes, mobile/desktop, score/recommendation flow, forms, first-party and fallback capture, checkout/onboarding, booking, assistant boundaries, schema, and truth checks.

Only when every required launch item is green:
1. Merge PR #12 into `main`.
2. Treat that merge as the production-ready checkpoint.

✅ **Gate:** full matrix passes on the live production domain → merge → production-ready.

---

## Current order of operations

1. Keep `release/ai-kollege-launch` as the Netlify production branch while testing.
2. Confirm CI and latest Netlify deployment are green.
3. Configure/test first-party leads + fallback.
4. Test the already-configured scheduler.
5. Configure/test AI secretary/private assistant if launching them today.
6. Stripe Test mode: both pass purchases → buyer onboarding → then Live links.
7. Configure WhatsApp only if it is part of today's launch scope.
8. Connect/verify `aikollege.com`.
9. Full matrix → merge PR #12.

The safe shortest path to paid web launch is **site + lead capture/fallback + scheduler + tested Stripe passes + custom domain/full web QA**. AI chat and WhatsApp can remain fail-closed until their credential and live-behavior gates pass.