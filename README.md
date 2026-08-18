# AI Kollege / AI Readiness Pass

AI Kollege is Fify Now LLC's practical AI-readiness, training, job/productivity, business-audit and implementation-support platform.

## Commercial path

**traffic → readiness diagnostic / answer content → lead or offer → verified Stripe purchase → learner activation → evidence-based progress → completion → appropriate follow-up**

Commercial completion requires all six gates in `docs/commercial-completion-gates.md`; a green deployment alone is not enough.

## Current production architecture

- Canonical public site at `https://www.aikollege.com` with responsive landing, product, booking, answer, privacy and support experiences.
- SEO/AEO metadata, robots, sitemap, structured data and direct-answer content.
- Interactive readiness diagnostic and first-party lead capture with qualification, UTM/source attribution, deduplication, spam controls and a verified-private operational store.
- GA4 configuration and funnel events for readiness, leads, offers, checkout and verified learner activity.
- Live Stripe Payment Links for the two self-serve paid passes, signed webhook handling, paid-session validation, private purchase records and server-side entitlement checks.
- Abandoned-checkout recovery only from a verified Stripe `checkout.session.expired` event for supported AI Kollege offers.
- Adaptive paid learner workspace with role-aware examples, locally persistent work, evidence/quality gates, progress, verified lifecycle events and portable proof-pack export.
- Resend transactional email for lead/booking acknowledgement, human handoff, paid onboarding, progress reminders and course completion.
- Secretary/receptionist with approved knowledge, human escalation and no authority to charge, discount, refund or make binding commitments.
- Private Owner Studio for lead workflow, front-office settings, paid-access checks, learner lifecycle visibility and safe transactional follow-up controls.
- Twilio receptionist/human-forward architecture, WhatsApp bridge, MoMo/social-control boundaries, rate limits and webhook replay protection.
- GitHub Actions production validation for tests, application wiring, SEO/AEO, security/public boundaries and Stripe integrity.

## Truth and privacy rules

Paid value is guided work, adaptation, evidence checks and learner-created proof—not generic AI information. A module is not complete because it was viewed. Completion requires required learner evidence and quality checks.

Card data remains with Stripe. Paid content is returned only after server-side Stripe verification. Learner artifact text stays in the browser unless intentionally exported/submitted; server lifecycle measurement stores operational event metadata rather than artifact content. Customer records/settings fail closed unless storage is verified private. Owner APIs require owner authentication and remain noindex/no-store.

AI Kollege completion recognition must not be represented as accreditation, professional licensure, employer endorsement, regulatory certification, guaranteed employment or guaranteed income unless such a claim later becomes independently true and documented.

## External production proof

Code can establish architecture, but release certification still requires live evidence that Netlify serves the exact validated commit, GA4 receives production events, Resend's sender domain accepts/delivers a controlled test, and live Stripe entitlement/webhook behavior works. Genuine revenue, conversion and retention numbers must come from real customer activity rather than test clicks.

## Validation

```bash
npm test
npm run validate
```
