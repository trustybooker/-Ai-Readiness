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

## Safety rule

Until a real tested payment or booking link is added, the site keeps visitors in request-review mode instead of pretending checkout or scheduling is live.
