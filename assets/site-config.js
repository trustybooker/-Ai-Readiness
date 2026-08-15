window.FIFYNOW_SITE_CONFIG = {
  bookingUrl: 'https://calendar.app.google/wSVv9b3k5X5GiQqf6',
  analytics: {
    provider: 'none',
    googleAnalyticsId: '',
    plausibleDomain: ''
  },
  // Paste only real, transaction-tested payment links here.
  // Checkout policy (enforced in assets/app.js): only aiStarterPass and
  // aiJobProductivityPass become direct self-serve checkout buttons. Filling
  // businessAiReadinessAudit, teamTrainingDeposit, or implementationReviewDeposit
  // does NOT create a direct "Buy" button — those offers always route to the
  // human-review/booking form so fit and scope are confirmed by a person first.
  // Step-by-step: docs/stripe-setup.md
  payments: {
    aiStarterPass: '',              // Self-serve. Stripe Payment Link for "AI Starter Pass" ($59). Shows a Buy button.
    aiJobProductivityPass: '',      // Self-serve. Stripe Payment Link for "AI Job & Productivity Pass" ($197). Shows a Buy button.
    businessAiReadinessAudit: '',   // Human-review only. A human sends this link after a fit review; the site does NOT show a Buy button.
    teamTrainingDeposit: '',        // Human-review only. Sent by a human after scope review; no site Buy button.
    implementationReviewDeposit: '', // Human-review only. Sent by a human after written scope; no site Buy button.
    aiReadinessLab: ''              // Human-review only. Sent when Lab pricing/scope is confirmed; no site Buy button.
  },
  secretary: {
    // Live endpoint and refusal/handoff boundaries were verified on the
    // production Netlify deployment before this was enabled.
    enabled: true
  }
};
