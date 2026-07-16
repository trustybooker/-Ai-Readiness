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
  payments: {
    aiStarterPass: '',
    aiJobProductivityPass: '',
    businessAiReadinessAudit: '',
    teamTrainingDeposit: '',
    implementationReviewDeposit: '',
    aiReadinessLab: ''
  },
  secretary: {
    // Flip to true ONLY after ANTHROPIC_API_KEY is set in the host dashboard
    // and the /api/secretary endpoint answers on the deployed site.
    enabled: false
  }
};
