# Stripe Setup — AI Kollege

This is the only Stripe work left, and it is all in **your** Stripe dashboard —
no code, no secret keys in the repo. Stripe **Payment Links** are public
checkout URLs; you create them, copy the URL, and paste it into one config
file. That's it.

**Division of work**
- **You:** create the Stripe account, verify your business, create the Payment
  Links, and paste the URLs (the "login and token" part).
- **Already done in the code:** the pricing buttons, the self-serve policy, the
  success-page wiring, and validation. You only paste URLs.

**No secret key is stored anywhere.** Payment Links don't need the Stripe secret
API key, so nothing sensitive goes into the repo or the site. (If you ever want
dynamic Stripe Checkout instead, that's a separate, bigger job that *does* need a
secret key as a host env var — you don't need it for launch.)

---

## Step 1 — Create and verify your Stripe account (you)

1. Go to https://stripe.com and sign up (or log in).
2. Complete business verification (name = Fify Now LLC, bank account for payouts).
3. Leave the account in **Test mode** for now (toggle is in the dashboard). You'll
   test with fake cards first, then switch to Live.

## Step 2 — Create a Payment Link per offer (you)

In the Stripe dashboard: **Product catalog → Payment Links → New**, or go to
https://dashboard.stripe.com/payment-links . For each offer below:

1. Add the product **name** and **price** exactly as listed.
2. Set it to a **one-time** payment (not subscription), unless you decide otherwise.
3. Under **After payment**, choose **Redirect** and set the URL to
   `https://aikollege.com/thanks.html` so buyers land back on your site.
   (This only works once the domain is live — until then use the Stripe default.)
4. Click **Create**, then **Copy** the link. It looks like
   `https://buy.stripe.com/xxxxxxxxxxxx`.

| Offer | Name to use | Price | Goes on the site? |
|---|---|---|---|
| AI Starter Pass | AI Starter Pass | $59 | **Yes — shows a Buy button** |
| AI Job & Productivity Pass | AI Job & Productivity Pass | $197 | **Yes — shows a Buy button** |
| Business AI Readiness Audit | Business AI Readiness Audit | $497 | No — sent by a human after fit review |
| Team Training Sprint (deposit) | Team Training Sprint | your deposit amount | No — sent by a human after scope review |
| AI Implementation (review deposit) | AI Implementation Review | your deposit amount | No — sent by a human after written scope |
| AI Kollege Lab | AI Kollege Lab | your price | No — sent when Lab pricing is confirmed |

Only the first two become self-serve "Buy" buttons on the pricing grid. The rest
are created so a **human can send the link** after a review — this keeps the
"human review before money and implementation" rule intact. You can create those
four now or later; the site works either way.

## Step 3 — Paste the two self-serve links into the site (you, one file)

Open `assets/site-config.js` and paste the two `buy.stripe.com` URLs:

```js
  payments: {
    aiStarterPass: 'https://buy.stripe.com/PASTE_STARTER_LINK',
    aiJobProductivityPass: 'https://buy.stripe.com/PASTE_JOB_LINK',
    businessAiReadinessAudit: '',      // leave empty — sent by a human
    teamTrainingDeposit: '',           // leave empty — sent by a human
    implementationReviewDeposit: '',   // leave empty — sent by a human
    aiReadinessLab: ''                 // leave empty — sent by a human
  },
```

That's the whole change. The buttons pick up the links automatically. (Links must
start with `https://` or the site ignores them by design.)

## Step 4 — Test before going live (you + the site)

1. In Stripe **Test mode**, create test versions of the two links and paste those
   first.
2. Deploy the site (or use the deploy preview) and click **Buy AI Starter Pass**.
3. On the Stripe page, pay with the test card `4242 4242 4242 4242`, any future
   expiry, any CVC, any ZIP.
4. Confirm the payment succeeds in the Stripe dashboard and that you're redirected
   to `thanks.html`.
5. When both test buys work, switch Stripe to **Live mode**, create the real
   links, and replace the test URLs in `site-config.js` with the live ones.

**Do not paste a live link you haven't completed a real (or test) transaction
through.** That's the launch rule: no untested payment link goes on the site.

## Step 5 — After a sale

- Buyers are handled through your normal onboarding: see `refunds.html` and
  `docs/onboarding-offboarding-refunds.md`.
- Stripe fees (about 2.9% + 30¢ per charge in the US) come out of each payment —
  price with that in mind.
- Refund/credit handling is described on `refunds.html`; you issue refunds from
  the Stripe dashboard when appropriate.

## What stays out of the repo

- No Stripe secret key, publishable key, or webhook secret is needed for Payment
  Links, so none are committed. If you later add dynamic Checkout or Stripe
  webhooks, those secrets go in the **host dashboard** as env vars, never in the
  repo — same rule as the other keys in `docs/assistant-api-and-whatsapp-setup.md`.
