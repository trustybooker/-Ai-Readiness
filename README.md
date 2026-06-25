# AI Readiness Pass

Standalone AI readiness, training, assessment, job-prep, business-audit, and implementation website for **Fify Now LLC**.

## Positioning

**AI Readiness Pass** helps individuals, employees, job seekers, small businesses, teams, and organizations answer one urgent question:

> Are we ready to use AI safely, productively, and credibly?

The website is built around a low-friction conversion path:

1. Free AI readiness score.
2. Recommended path.
3. Human review request.
4. Training, audit, or implementation offer.

## Offer ladder

- Free AI Readiness Score — lead capture and triage.
- AI Starter Pass — $59 placeholder.
- AI Job & Productivity Pass — $197 placeholder.
- Business AI Readiness Audit — $497 placeholder.
- Team Training Sprint — $1,500+ placeholder.
- AI Implementation Partner — $7,500+ / $10,000+ monthly placeholder.

Prices are placeholders until Stripe products, fulfillment terms, refund policy, and onboarding are verified.

## What is currently wired

- Static landing page.
- Responsive design.
- Interactive 7-question readiness quiz.
- Score summary hidden field for the lead form.
- Lead form action pointed to `fifynow@fifynowllc.com` through FormSubmit.
- SEO metadata and structured data.
- Google Flow / Veo video prompts for realistic hero and ad videos.
- Netlify deployment config.
- Validation script and GitHub Actions workflow.

## What still needs external setup

The repo cannot truly complete these steps without service access and credentials:

- Confirm first FormSubmit email at `fifynow@fifynowllc.com`, or replace with Netlify Forms / Resend.
- Create Stripe products and replace request buttons with verified checkout links.
- Add booking link, such as Calendly, Google Calendar appointment scheduling, or TidyCal.
- Add CRM destination, such as Google Sheets, HubSpot, Airtable, or GoHighLevel.
- Add analytics, such as Google Analytics, Meta Pixel, or Plausible.
- Add real hero video asset after generation and manual quality review.

## Validation

Run:

```bash
npm run validate
```

The validator checks required files, conversion copy, score/form wiring, safety disclaimers, and removal of temporary test files.

## Truth standard

Do not add fake testimonials, fake client logos, fake certification/accreditation claims, legal compliance claims, job guarantees, income guarantees, or unsupported ROI claims.

The business should convert because the offer is clear, timely, practical, and human-reviewed — not because of fake proof.
