# Payments, Booking, and Analytics Setup

## Status

The site is now wired for payment links, booking, and analytics through `assets/site-config.js`.

This means the site can support external tools without hardcoding untested links into the page.

## Payment setup

Recommended fast path:

1. Create tested payment links in Square first.
2. Use Stripe later for products, subscriptions, and advanced checkout.
3. Use PayPal as a backup link if needed.

Add links in `assets/site-config.js`:

```js
payments: {
  aiStarterPass: 'https://...',
  aiJobProductivityPass: 'https://...',
  businessAiReadinessAudit: 'https://...',
  teamTrainingDeposit: 'https://...',
  implementationReviewDeposit: 'https://...',
  aiReadinessLab: 'https://...'
}
```

Do not add a link until it has been tested.

## Payment-link sales order

Use this order when creating links:

1. AI Starter Pass — easiest first paid conversion.
2. AI Job & Productivity Pass — strongest individual/job-seeker paid path.
3. Business AI Readiness Audit — strongest small-business paid path.
4. Team Training Deposit — qualifies teams before full sprint delivery.
5. Implementation Review Deposit — qualifies higher-touch implementation.
6. AI Readiness Lab — recurring value and retention.

## Booking setup

Create a scheduler link for human review. Add it here:

```js
bookingUrl: 'https://...'
```

Good scheduler options:

- Google Calendar appointment schedule
- Calendly
- TidyCal
- Square Appointments
- Stripe payment link plus manual booking follow-up

## Booking conversion rule

A booking should move the person toward one clear next step:

- unclear need → free score or checklist,
- beginner → AI Starter Pass,
- job/work need → AI Job & Productivity Pass,
- business workflow need → Business AI Readiness Audit,
- team need → Team Training Sprint,
- clear implementation need → Implementation Review.

## Analytics setup

### Google Analytics

Add the measurement ID:

```js
analytics: {
  provider: 'google',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  plausibleDomain: ''
}
```

### Plausible

Add the domain:

```js
analytics: {
  provider: 'plausible',
  googleAnalyticsId: '',
  plausibleDomain: 'example.com'
}
```

## Events already wired

The site can track:

- Quiz completion
- Lead form submit attempt
- First-party lead capture
- Email fallback event

## Sales events to review manually until analytics is live

Track these from GitHub Issues, email, scheduler, and payment records:

- score starts,
- score completions,
- booking clicks,
- payment-link requests,
- starter purchases,
- job pass purchases,
- business audit purchases,
- team sprint deposits,
- implementation review deposits,
- lab signups,
- refunds or confused buyers.

## Safety rule

Until a real tested payment or booking link is added, the site keeps visitors in request-review mode instead of pretending checkout or scheduling is live.
