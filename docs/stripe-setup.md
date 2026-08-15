# Stripe Setup — AI Kollege

AI Kollege uses **Stripe Payment Links** for the two low-ticket individual passes. This keeps launch simple: no Stripe secret key is needed in the repo, and the site only receives public `buy.stripe.com` URLs after those links have been tested.

## Production boundary

- **Self-serve checkout:** AI Starter Pass ($59) and AI Job & Productivity Pass ($197).
- **Human-review first:** Business AI Readiness Audit, Team Training Sprint, implementation work, and Lab pricing until those offers are explicitly approved for a different flow.
- **Never grant paid access from a URL alone.** The Stripe payment record is the source of truth. The post-checkout page only collects onboarding details; a human verifies the checkout record before paid fulfillment or completion status is issued.

## Step 1 — Confirm the Stripe account

Use the Fify Now LLC Stripe account that operates AI Kollege. Complete business and payout verification before taking live payments.

## Step 2 — Create TEST-mode products and Payment Links first

In Stripe Test mode create two one-time products:

| Offer | Product name | Price |
|---|---|---:|
| AI Starter Pass | AI Starter Pass | $59 |
| AI Job & Productivity Pass | AI Job & Productivity Pass | $197 |

For each Payment Link:

1. Use a one-time price.
2. Collect the buyer email.
3. Under **After payment**, redirect to:
   `https://aikollege.com/purchase-success.html`
4. Do not add a live URL to the site yet.

The return page deliberately does **not** expose paid curriculum. It asks the buyer for short onboarding details and states that Stripe will be checked before paid start instructions are sent.

## Step 3 — Paste TEST links into the site

In `assets/site-config.js`:

```js
payments: {
  aiStarterPass: 'https://buy.stripe.com/TEST_STARTER_LINK',
  aiJobProductivityPass: 'https://buy.stripe.com/TEST_JOB_LINK',
  businessAiReadinessAudit: '',
  teamTrainingDeposit: '',
  implementationReviewDeposit: '',
  aiReadinessLab: ''
}
```

Only the first two keys become direct checkout buttons. The other offers keep routing to human review even if somebody later fills those config fields accidentally.

## Step 4 — Complete both TEST purchases

From the deployed AI Kollege site:

1. Click **Buy AI Starter Pass**.
2. Complete checkout with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC, and any valid ZIP.
3. Confirm the payment succeeds in Stripe Test mode.
4. Confirm the browser returns to `purchase-success.html`.
5. Submit the buyer-onboarding form and confirm it reaches the lead system/email fallback.
6. Repeat the same test for AI Job & Productivity Pass.

**Gate:** both offers must complete the full sequence: site button → Stripe → successful test payment → buyer onboarding page → captured onboarding request.

## Step 5 — Create LIVE links only after the test gate passes

Switch to Live mode and create live versions of the two products/Payment Links with the same names, prices, and return URL:

`https://aikollege.com/purchase-success.html`

Replace the two test URLs in `assets/site-config.js` with the live Payment Links and redeploy.

Do not place an untested live checkout link on the site.

## Step 6 — Fulfillment rule for launch

For launch, paid fulfillment is intentionally human-verified:

1. Stripe records the payment and checkout email.
2. Buyer lands on `purchase-success.html` and submits start details.
3. Fify Now LLC matches the onboarding request to the Stripe payment.
4. The correct training start instructions/materials are sent.
5. Proof-of-work and reviewer status are tracked according to the badge standard.

This avoids exposing paid curriculum publicly and avoids pretending a public success-page URL proves payment. A future Stripe webhook + authenticated learner area/LMS can automate this later without changing the safety boundary.

## Refunds and support

The public policy and onboarding explanation lives at `refunds.html`. Refund/credit decisions are handled according to the actual offer, material delivered, work performed, and written expectations; no blanket guarantee is advertised.

## Secret hygiene

Payment Links are public checkout URLs. No Stripe secret key, publishable key, or webhook secret is required for this launch flow, so none should be committed to the repository. If dynamic Checkout or webhooks are added later, secrets belong in the host environment only.
