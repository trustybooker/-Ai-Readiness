# AI Readiness Pass

Standalone AI readiness, training, assessment, job-prep, business-audit, implementation, and first-party lead tracking system for **Fify Now LLC**.

## Positioning

**AI Readiness Pass** helps individuals, employees, job seekers, small businesses, teams, and organizations answer one urgent question:

> Are we ready to use AI safely, productively, and credibly?

The website is built around a low-friction conversion path:

1. Free AI readiness score.
2. Recommended path.
3. First-party lead capture and lead tiering.
4. Human review request.
5. Training, audit, sprint, or implementation offer.

## First-party tracking system

The site now includes a no-extra-cost lead system:

- Lead form tries the first-party Netlify function first.
- Function creates a private GitHub Issue for each lead when configured.
- GitHub Issue includes contact details, score, lead tier, selected path, timeline, budget, source, and follow-up checklist.
- If the function is not configured yet, the form falls back to email routing.

Required Netlify function environment variables:

- `LEADS_SECRET`: private GitHub issue-write secret.
- `LEADS_REPO`: `trustybooker/-Ai-Readiness`

Do not put secrets in the repository.

## Fastest money path

Use a two-layer setup:

1. **Square Payment Links first** for immediate services, deposits, QR codes, Apple Pay, Google Pay, Cash App Pay, card payments, and dashboard tracking.
2. **Stripe Payment Links / Checkout next** for the cleaner long-term checkout, subscriptions, customer portal, invoices, and app integration path.

PayPal Payment Links can be used as a backup if Square setup is delayed.

## Course and certification system

The course is organized into four levels:

- Level 1: AI Readiness Foundations.
- Level 2: AI Job and Productivity Pass.
- Level 3: Business AI Readiness.
- Level 4: Implementation Partner Track.

Certification language is intentionally conservative:

- Use “Fify Now LLC Completion Badge.”
- Use “proof-of-work artifacts.”
- Do not claim accreditation unless accreditation is actually obtained.

## Operating system

The repo now includes:

- Business operating system.
- First-party lead tracking playbook.
- Response scripts.
- Onboarding, offboarding, refund, and handoff workflow.
- Business implementation and integration playbook.
- Certification standards.
- Course materials.
- CRM capture plan.
- Fast payment plan.
- SEO/AEO answer hub.
- Imagery and video quality system.

## What is currently wired

- Static landing page.
- Responsive design.
- Interactive readiness quiz.
- Score summary, recommended path, and lead tier hidden fields.
- First-party tracker function with email fallback.
- Lead form routed to `fifynow@fifynowllc.com` with fallback CC to `fifynow@gmail.com` through FormSubmit.
- First-party capture fields: audience type, timeline, budget range, referrer, landing page, and UTM fields.
- SEO metadata, Open Graph image, Twitter card, robots.txt, sitemap.xml, and JSON-LD schema.
- Schema graph includes Organization, WebSite, ProfessionalService, WebPage, OfferCatalog, and FAQPage.
- Thank-you page after submission.
- Google Flow / Veo video prompts and imagery quality standards.
- Netlify deployment config.
- Validation script and GitHub Actions workflow.

## What still needs external setup

The repo cannot truly complete these steps without service access and credentials:

- Deploy on Netlify or another host.
- Add Netlify environment variables for the first-party tracker.
- Confirm first FormSubmit email at `fifynow@fifynowllc.com`; Gmail should receive fallback copies after primary confirmation.
- Create Square Payment Links for immediate sales.
- Create Stripe products and replace request buttons with verified checkout links.
- Add booking link, such as Calendly, Google Calendar appointment scheduling, or TidyCal.
- Add analytics, such as Google Analytics, Meta Pixel, or Plausible.
- Add real hero video asset after generation and manual quality review.

## Validation

Run:

```bash
npm run validate
```

The validator checks required files, conversion copy, score/form wiring, first-party tracker, schema, sitemap, imagery setup, CRM capture docs, course materials, operating system, certification standards, safety disclaimers, and removal of temporary test files.

## Truth standard

Do not add fake testimonials, fake client logos, fake certification/accreditation claims, legal compliance claims, job guarantees, income guarantees, or unsupported ROI claims.

The business should convert because the offer is clear, timely, practical, and human-reviewed — not because of fake proof.
