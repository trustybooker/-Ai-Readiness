# AI Kollege Go-Live Runbook

Work these phases **top to bottom**. Each phase has a **GATE** — do not start the
next phase until the current gate passes. The app becomes production-ready only
at the end of Phase 8, not before. Nothing here is optional except where marked.

Legend: 🧑 = you (dashboard/login work) · 🤖 = already done in the repo · ✅ = gate.

---

## Phase 0 — Repo is ready (nothing to do)
🤖 Code, tests, validation, and docs are done and green (`npm run check` passes,
CI green, PR #12 review-clean). Do not merge to `main` yet.

✅ **Gate:** PR #12 shows CI green. (It does.)

---

## Phase 1 — Pick the platform and deploy the branch (not main)
🧑 You confirmed the host is **Netlify**. In the Netlify dashboard:
1. Confirm a site is linked to `trustybooker/-Ai-Readiness`.
2. Set its **production branch / deploy** to `release/ai-kollege-launch` (or deploy
   that branch as a branch deploy). **Do not deploy `main`** — main is still empty.
3. Trigger a deploy and open the Netlify deploy URL (e.g. `*.netlify.app`).

✅ **Gate:** the Netlify URL loads the homepage, `/courses.html`, `/badge.html`,
`/privacy.html`, and a few `/answer/*` pages. Internal paths like `/docs/` and
`/lib/` return 404.

---

## Phase 2 — Turn on lead capture (minimum viable launch)
🧑 In Netlify → Site settings → Environment variables, add:
- `LEADS_SECRET` = a GitHub token that can create issues in your lead repo
- `LEADS_REPO` = `trustybooker/-Ai-Readiness` (or your dedicated lead repo)

Redeploy so the functions pick up the vars.

✅ **Gate:** none yet — verified in Phase 3.

---

## Phase 3 — Prove no lead is ever lost (Issue #4)
🧑 From your machine, against the deploy URL:
```
SITE_URL=https://YOUR-SITE.netlify.app node scripts/live-lead-test.mjs
```
(Optionally also set `LEADS_SECRET` and `LEADS_REPO` locally so the script verifies
the created issue's fields and closes it.)

Then, in the deployed site itself:
1. Submit the homepage review form → confirm a GitHub Issue is created with name,
   email, path, score, tier, source, budget, and the follow-up checklist.
2. Temporarily unset `LEADS_SECRET` (or point it wrong) and submit again → confirm
   the **email fallback** delivers the lead to your inbox. Restore `LEADS_SECRET`.

✅ **Gate:** a real lead creates a GitHub Issue **and** email fallback works when
the tracker is off. Lead capture is now safe.

> You *could* soft-launch here (site + lead capture only) and add the rest below
> as you go. Everything after this is additive.

---

## Phase 4 — Turn on the AI secretary and owner assistant
🧑 Add env vars in Netlify:
- `ANTHROPIC_API_KEY` = your Anthropic API key
- `OWNER_ASSISTANT_TOKEN` = a long random string (your private assistant password)
- optional: `BOOKING_URL`, `CALENDAR_TIMEZONE`, `GOOGLE_CALENDAR_ICS_URL`

Redeploy. Then smoke-test on the deploy URL:
1. `POST /api/secretary` (or /.netlify/functions/secretary) with a paths question →
   grounded answer.
2. Ask the secretary for a **discount or refund** → it must **refuse and hand off**,
   and a `[Secretary]` lead issue appears.
3. `POST /api/assistant` **without** the Bearer token → 401. With
   `Authorization: Bearer <OWNER_ASSISTANT_TOKEN>` → a leads summary.
4. Only after 1–3 pass: set `secretary.enabled` to `true` in `assets/site-config.js`
   and redeploy — the chat widget appears.

Full detail: `docs/assistant-api-and-whatsapp-setup.md`.

✅ **Gate:** secretary answers safely and refuses money/refunds; assistant requires
the token; widget only turned on after the endpoint works.

---

## Phase 5 — Payments (Stripe)
🧑 Follow `docs/stripe-setup.md`:
1. Create the Stripe account (Test mode).
2. Create Payment Links for AI Starter Pass ($59) and AI Job & Productivity Pass
   ($197); set "After payment → redirect to `https://aikollege.com/thanks.html`".
3. Paste the **test-mode** links into `site-config.js`, redeploy, and complete a
   test purchase with card `4242 4242 4242 4242`.
4. Switch Stripe to Live, create live links, replace the test URLs, redeploy.

✅ **Gate:** a test purchase completes and redirects; only then are live links used.
No untested link goes on the site.

---

## Phase 6 — WhatsApp + Base44 (optional; do last)
🧑 In the Meta (WhatsApp Business Cloud) dashboard, add env vars in Netlify
(`WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_TOKEN`,
`WHATSAPP_PHONE_NUMBER_ID`, `OWNER_WHATSAPP_NUMBER`), then:
1. Register the webhook URL (your Netlify `whatsapp-webhook` endpoint) with the
   verify token; confirm the handshake passes.
2. Send a test message from a normal number → grounded secretary reply.
3. Send from `OWNER_WHATSAPP_NUMBER` → owner leads summary.

Base44 (if used) calls `/api/secretary` and `/api/assistant` with the token — see
`docs/assistant-api-and-whatsapp-setup.md`.

✅ **Gate:** webhook verifies, a bad signature is rejected, customer vs owner
routing works, and the bot never sends a payment link.

---

## Phase 7 — Connect the custom domain
🧑 Point `aikollege.com` DNS at the live Netlify site and add it as the site's
custom domain (Netlify provisions SSL). Then:
1. Confirm `https://aikollege.com/` and the key pages load over HTTPS.
2. Re-check that canonicals, `sitemap.xml`, and `robots.txt` resolve on the real
   domain, and that form success/`_next` redirects land on `aikollege.com/thanks.html`.
3. If WhatsApp/Stripe were set up on the `.netlify.app` URL, update their URLs to
   the custom domain.
4. Run a schema / rich-results check on the live homepage.

✅ **Gate:** the site serves on `aikollege.com` with SSL; canonicals and redirects
are on-domain.

---

## Phase 8 — Full test matrix, then merge
🧑 Run `docs/final-production-test-matrix.md` against the live domain: routes,
mobile/desktop, quiz, all forms, both capture paths, payment buttons, booking,
secretary/assistant/WhatsApp, schema, and the truth checks.

When every box is checked:
1. Merge PR #12 into `main`.
2. Now — and only now — the app is **production-ready**.

✅ **Gate:** every test-matrix box passes → merge → production-ready.

---

## Order-of-operations summary

1. Deploy `release/ai-kollege-launch` to Netlify (not main).
2. Set `LEADS_SECRET` + `LEADS_REPO`.
3. Live lead test + email-fallback test. ← safe to soft-launch after this.
4. Set `ANTHROPIC_API_KEY` + `OWNER_ASSISTANT_TOKEN`; smoke-test; flip `secretary.enabled`.
5. Stripe: test buy → live links.
6. WhatsApp/Base44 (optional, last).
7. Connect `aikollege.com` + re-verify canonicals/redirects/schema.
8. Full test matrix → merge PR #12 → production-ready.

Cheapest safe path to first dollar: **Phases 1–3 + 5** (site + lead capture +
payments). The AI assistants and WhatsApp can follow once the basics are proven.
