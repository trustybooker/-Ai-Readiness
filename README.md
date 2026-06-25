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

## Fastest money path

Use a two-layer setup:

1. **Square Payment Links first** for immediate services, deposits, QR codes, Apple Pay, Google Pay, Cash App Pay, card payments, and dashboard tracking.
2. **Stripe Payment Links / Checkout next** for the cleaner long-term checkout, subscriptions, customer portal, invoices, and app integration path.

PayPal Payment Links can be used as a backup if Square setup is delayed or if buyers prefer PayPal/Venmo.

## Offer ladder

- Free AI Readiness Score — lead capture and triage.
- AI Starter Pass — $59 placeholder.
- AI Job & Productivity Pass — $197 placeholder.
- Business AI Readiness Audit — $497 placeholder.
- Team Training Sprint — $1,500+ placeholder.
- AI Implementation Partner — $7,500+ / $10,000+ monthly placeholder.

Prices are placeholders until payment links, fulfillment terms, refund policy, and onboarding are verified.

## What is currently wired

- Static landing page.
- Responsive design.
- Interactive 7-question readiness quiz.
- Score summary, recommended path, and lead tier hidden fields.
- Lead form routed to `fifynow@fifynowllc.com` with fallback CC to `fifynow@gmail.com` through FormSubmit.
- First-party capture fields: audience type, timeline, budget range, referrer, landing page, and UTM fields.
- SEO metadata, Open Graph image, Twitter card, robots.txt, sitemap.xml, and JSON-LD schema.
- Schema graph includes Organization, WebSite, ProfessionalService, WebPage, OfferCatalog, and FAQPage.
- Thank-you page after submission.
- Google Flow / Veo video prompts and imagery quality standards.
- Netlify deployment config.
- Validation script and GitHub Actions workflow.
- Fast payment plan in `docs/fast-payment-plan.md`.
- CRM capture plan in `docs/crm-capture-system.md`.

## What still needs external setup

The repo cannot truly complete these steps without service access and credentials:

- Deploy on Netlify or another host.
- Confirm the first FormSubmit email at `fifynow@fifynowllc.com`; Gmail should receive fallback copies after primary confirmation.
- Create Square Payment Links for immediate sales.
- Create Stripe products and replace request buttons with verified checkout links.
- Add booking link, such as Calendly, Google Calendar appointment scheduling, or TidyCal.
- Add CRM destination, such as Google Sheets, Airtable, HubSpot, or GoHighLevel.
- Add analytics, such as Google Analytics, Meta Pixel, or Plausible.
- Add real hero video asset after generation and manual quality review.

## CRM direction

The fastest reliable capture stack is:

1. Site form + dual email now.
2. Google Sheets or Airtable as the first lead database.
3. Make or Zapier to copy form submissions into the database.
4. HubSpot free CRM when follow-up volume increases.
5. GoHighLevel only if SMS, booking, funnels, pipelines, and client automation are needed in one place.

## Validation

Run:

```bash
npm run validate
```

The validator checks required files, conversion copy, score/form wiring, schema, sitemap, imagery setup, CRM capture docs, safety disclaimers, and removal of temporary test files.

## Truth standard

Do not add fake testimonials, fake client logos, fake certification/accreditation claims, legal compliance claims, job guarantees, income guarantees, or unsupported ROI claims.

The business should convert because the offer is clear, timely, practical, and human-reviewed — not because of fake proof.
