# Launch Checklist

## Pre-launch truth checks

- [ ] No fake testimonials.
- [ ] No fake client logos.
- [ ] No unsupported AI compliance claims.
- [ ] No job guarantees.
- [ ] No revenue guarantees.
- [ ] Completion badge language says proof-of-work completion only unless accreditation is obtained.

## First-party lead tracker

- [ ] Deploy on Netlify.
- [ ] Add private lead tracker environment values in the hosting dashboard.
- [ ] Submit a test lead.
- [ ] Confirm the lead becomes a private GitHub Issue.
- [ ] Confirm labels show priority and path.
- [ ] Confirm issue body includes score, path, tier, UTM/source, and checklist.
- [ ] If tracker is not configured, confirm the fallback email form works.

## Form and email fallback

- [ ] Confirm the first FormSubmit activation email at the business inbox.
- [ ] Confirm Gmail receives fallback copy.
- [ ] Verify the lead includes name, email, phone, path, message, and score summary.

## Fast payment setup — Stripe

Use `docs/stripe-setup.md` as the authoritative payment guide. Do not use the retired Square/PayPal launch instructions from the June 25 draft.

- [ ] In Stripe Test mode, create a one-time Payment Link for AI Starter Pass ($59).
- [ ] In Stripe Test mode, create a one-time Payment Link for AI Job & Productivity Pass ($197).
- [ ] Set each test link to redirect to the deployed `thanks.html` page after payment.
- [ ] Add the two test links to `assets/site-config.js` only on the release branch.
- [ ] Complete test purchases for both offers and verify success + redirect.
- [ ] Only after both test purchases pass, create the corresponding Live-mode links.
- [ ] Replace test URLs with the transaction-tested live URLs and redeploy.
- [ ] Keep Business AI Readiness Audit, Team Training Sprint, AI Implementation Review, and AI Kollege Lab human-review-only; do not expose direct site Buy buttons for them.
- [ ] Confirm refund/credit policy before accepting live orders.

## Course and delivery setup

- [ ] Review Level 1 course material.
- [ ] Review Level 2 course material.
- [ ] Review Level 3 course material.
- [ ] Review Level 4 course material.
- [ ] Create downloadable worksheets from the course files.
- [ ] Create payment-to-onboarding instructions.
- [ ] Create badge template only after final badge language is approved.

## Booking and operations

- [ ] Add booking link for human review.
- [ ] Add analytics.
- [ ] Test response scripts.
- [ ] Test onboarding workflow.
- [ ] Test offboarding workflow.
- [ ] Test implementation playbook on one sample business workflow.

## Video and visual assets

- [ ] Generate 16:9 hero video.
- [ ] Generate 9:16 vertical ad video.
- [ ] Reject videos with bad hands, plastic skin, unreadable screens, or fake-looking people.
- [ ] Compress video for web.
- [ ] Add fallback poster image.

## Conversion audit

- [ ] First 3 seconds clearly answer: what is this, who is it for, why now, what action next.
- [ ] Mobile hero shows CTA above fold.
- [ ] Pricing makes the next step simple.
- [ ] Human review layer is clear.
- [ ] Business and job-seeker paths are both visible.

## Technical audit

- [ ] `npm run validate` passes.
- [ ] GitHub Actions validate workflow passes.
- [ ] Netlify preview/deploy loads from `release/ai-kollege-launch`.
- [ ] First-party tracker works on deployed URL.
- [ ] Email fallback works on deployed URL.
- [ ] Approved `/api/*` aliases resolve to their Netlify Functions; all other `/api/*` paths return 404.
- [ ] No temporary files committed.
