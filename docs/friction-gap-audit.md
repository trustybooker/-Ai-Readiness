# Friction and Gap Audit

## Decision

The repo-side system is coherent and reduced-friction, but it still needs live preview testing before production launch.

## Wire-ups checked

- Booking buttons activate from `assets/site-config.js`.
- Payment buttons stay in request mode until tested payment URLs exist.
- Lead forms try the first-party tracker first and then use email fallback if needed.
- Google Calendar scheduler URL is connected in config.
- Netlify routes now support the main site, booking, answers, checklist, lab, thanks, answer pages, assets, sitemap, robots, favicon, and manifest under `/ai-readiness-pass`.

## Friction reduced

- Free score comes before paid offers.
- Low-ticket and high-ticket offers are separated.
- Scheduler and internal booking request can both exist for different cases.
- Payment buttons do not claim checkout is live before payment links are tested.
- Badge language avoids fake accreditation.
- Workbook includes a review rubric and portfolio summary.

## Remaining external gaps

1. Open or create Netlify deploy preview.
2. Run live desktop and mobile visual QA.
3. Add host settings for first-party lead capture.
4. Submit a live test lead.
5. Confirm fallback email.
6. Create and test payment links.
7. Add analytics if selected.
8. Validate structured data on live URLs.
9. Click-test Google Calendar from the deployed site.

## Business logic quality

The strongest ladder is:

**Free score → practical path → human review → training or audit → proof-of-work badge → implementation or lab membership.**

This avoids selling only generic prompts and gives Fify Now LLC a path from lead capture to training, audit, implementation, and recurring membership.

## Course and badge quality

The course is professional when it remains proof-based:

- every level has a clear outcome,
- every level produces artifacts,
- every badge has completion criteria,
- human review is documented,
- public claims stay truthful,
- refresh or renewal is offered because AI changes fast.

Do not market it as accredited unless accreditation becomes factually true.

## Future direction

The strongest long-term version is an AI readiness operating system with scoring, proof-of-work portfolio, business workflow audit, human approval rules, reviewed badge, lab membership, and implementation path.
