# AI Readiness Pass

Standalone AI readiness, training, assessment, job-prep, business-audit, implementation, and first-party lead tracking system for **Fify Now LLC**.

## Positioning

**AI Readiness Pass** helps individuals, employees, job seekers, small businesses, teams, and organizations answer one urgent question:

> Are we ready to use AI safely, productively, and credibly?

The project is built to be human-first and sales-ready. Visitors should receive useful direction before buying, while serious leads have a clear path into training, audits, team work, implementation review, or recurring support.

## Conversion path

1. Free AI readiness score.
2. Useful checklist or direct answer page.
3. Recommended path.
4. First-party lead capture and lead tiering.
5. Human review request or scheduler click.
6. Training, audit, sprint, implementation review, or lab membership.
7. Follow-up using one clear next step.

## First-party tracking system

The site includes a no-extra-cost lead system:

- Lead form tries the first-party Netlify function first.
- Function creates a private GitHub Issue for each lead when host settings are configured.
- GitHub Issue includes contact details, score, lead tier, selected path, timeline, budget, source, booking details, and follow-up checklist.
- If the function is not configured yet, the form falls back to email routing.

Setup details are in `docs/first-party-lead-system.md` and `docs/lead-tracker-host-setup.md`.

## Course and badge system

The course is organized into four levels:

- Level 1: AI Readiness Foundations.
- Level 2: AI Job and Productivity Pass.
- Level 3: Business AI Readiness.
- Level 4: Implementation Partner Track.

Badge language is intentionally conservative:

- Use “Fify Now LLC Completion Badge.”
- Use “proof-of-work artifacts.”
- Do not claim accreditation unless accreditation is actually obtained.

## Operating system

The repo includes business operations, lead tracking, host setup, human value standard, sales conversion system, response scripts, onboarding and handoff workflows, implementation playbooks, course materials, CRM capture plan, payment plan, SEO/AEO answer hub, visual assets, launch runbook, and live preview guide.

## What is currently wired

- Static landing page.
- Responsive design.
- Contextual visual and icon assets.
- Interactive readiness quiz.
- Score summary, recommended path, and lead tier hidden fields.
- First-party tracker function with email fallback.
- Lead form routed to business email with Gmail fallback copy.
- First-party capture fields: audience type, timeline, budget range, referrer, landing page, and UTM fields.
- Google Calendar scheduler URL in `assets/site-config.js`.
- Internal booking request page.
- Payment-link placeholders controlled from `assets/site-config.js`.
- SEO metadata, Open Graph image, Twitter card, robots.txt, sitemap.xml, and JSON-LD schema.
- Schema graph includes Organization, WebSite, ProfessionalService, WebPage, OfferCatalog, and FAQPage.
- Seven direct-answer pages plus answer hub.
- Thank-you page after submission.
- Netlify deployment config with subpath redirects.
- Validation script and GitHub Actions workflow.

## What still needs external setup

The repo cannot complete these steps without service access and credentials:

- Deploy on Netlify or another host.
- Configure private lead tracker environment values in the host.
- Submit a live test lead and confirm GitHub Issue creation.
- Confirm the email fallback sends correctly from the deployed site.
- Create and test payment links.
- Add tested payment links to `assets/site-config.js`.
- Add analytics if selected.
- Test Google Calendar from the deployed preview.
- Run live mobile, desktop, and schema QA.

## Validation

Run:

```bash
npm run validate
```

The validator checks required files, conversion copy, score/form wiring, lead tracker, config safety, local HTML references, sitemap targets, schema-related pages, visual assets, course materials, operating system docs, sales docs, launch docs, and removal of temporary test files.

## Truth standard

Do not add fake proof, fake client logos, unsupported credentials, unsupported legal claims, or unsupported outcome claims.

The business should convert because the offer is clear, timely, practical, human-reviewed, and useful.
