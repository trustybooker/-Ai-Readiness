# AI Kollege / AI Readiness Pass

AI Kollege is Fify Now LLC's practical AI-readiness, training, job/productivity, business-audit and implementation-support platform.

## Commercial path

The production funnel is designed as:

**traffic → readiness diagnostic / answer content → lead or offer → verified Stripe purchase → learner activation → evidence-based progress → completion → appropriate follow-up**

The application must satisfy all six gates in `docs/commercial-completion-gates.md`; a green deployment alone is not commercial completion.

## What is wired

- Canonical public site at `https://www.aikollege.com` with responsive landing, product, booking, answer, privacy and support experiences.
- SEO/AEO metadata, robots, sitemap, structured data and direct-answer content.
- Interactive readiness diagnostic and first-party lead capture with qualification, UTM/source attribution, deduplication, spam controls and a verified-private operational store.
- GA4 configuration and funnel events for readiness, lead, offer, checkout and verified learner activity.
- Live Stripe Payment Links for the two self-serve paid passes.
- Stripe webhook signature verification, paid-session validation, idempotent private purchase records and server-side entitlement checks.
- Abandoned-checkout recovery only from a verified Stripe `checkout.session.expired` webhook for supported AI Kollege offers.
- Paid adaptive learner workspace with role-aware examples, persistent local work, evidence/quality gates, progress, server-verified lifecycle events and portable proof-pack export.
- Completion recognition language that does not claim accreditation, licensure, employment, income or regulatory status.
- Resend transactional-email integration for lead/booking acknowledgement, human handoff, paid onboarding, course-progress reminders and course completion.
- Secretary / receptionist with constrained approved knowledge, human escalation, private lead records and no authority to charge, discount, refund or make binding commitments.
- Owner Studio with private authentication, lead workflow, front-office controls, verified access checks, learner lifecycle visibility and safe transactional follow-up controls.
- Twilio receptionist and human-forwarding architecture, WhatsApp bridge, social-control/MoMo boundaries, rate limits and webhook replay protection.
- GitHub Actions validation covering application wiring, tests, SEO, public/private boundaries, Stripe integrity and security regressions.

## Paid-learning truth standard

Paid value is not generic AI information. The self-serve passes are built around guided work, role/context adaptation, evidence checks, human-judgment boundaries and portable learner-created proof.

A module is not complete merely because it was viewed. Completion requires the learner's saved artifact plus the required quality/evidence checks. Automated feedback or course completion must never be represented as accredited certification or human professional approval unless that actually occurred.

## Privacy and security boundary

- Card data remains with Stripe.
- Paid content is returned only after server-side Stripe verification.
- Learner artifact text stays in the learner's browser unless intentionally exported/submitted; the server lifecycle store records only operational event metadata.
- Customer records and operational settings fail closed unless the configured repository is verified private.
- Owner APIs require the owner token and remain noindex/no-store.
- Webhooks use provider verification and replay/idempotency safeguards.
- Secrets are server-side environment values and must never be copied into public files, issues or analytics.

## External production proofs

Code can establish the architecture, but these items require live service evidence before a release is certified commercially complete:

- Netlify serving the exact validated production commit.
- GA4 Realtime/DebugView receiving the expected production events.
- Resend sender domain verified and a controlled live delivery accepted/received.
- Stripe live webhook and paid entitlement behavior verified without creating fake revenue.
- Real customer acquisition/revenue/retention data will remain zero or unknown until genuine customers generate it; test clicks are not counted as business outcomes.

## Validation

Run:

```bash
npm test
npm run validate
```

The production gate covers tests, application wiring, SEO/AEO integrity, security/public-boundary rules and Stripe integrity.

## Truth/value rule

Do not add fake proof, fake client logos, unsupported credentials, fabricated conversion/revenue, unsupported legal claims, guaranteed jobs/income, or capabilities that are not actually delivered.
