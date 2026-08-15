# Live Preview Guide

## Current repo-side status

The AI Readiness Pass branch is prepared for a Netlify deploy preview.

- Branch: `build/ai-readiness-pass`
- Build command: `npm run validate`
- Publish directory: `.`
- Netlify config file: `netlify.toml`
- Public scheduler link: connected in `assets/site-config.js`

## Fastest safe preview path

1. Open Netlify.
2. Create or import a project from Git.
3. Connect GitHub.
4. Choose repository `trustybooker/-Ai-Readiness`.
5. Choose branch `build/ai-readiness-pass` for preview/staging.
6. Confirm build command: `npm run validate`.
7. Confirm publish directory: `.`.
8. Deploy.
9. Open the generated Netlify preview URL.

## If using the existing PR preview flow

If the repo is connected to Netlify, Netlify should create a deploy preview for PR #1. The preview URL usually follows this pattern:

`https://deploy-preview-1--YOUR-SITE-NAME.netlify.app`

The exact site name depends on the Netlify project name.

## What to test first

- Home page loads.
- `/booking.html` loads.
- `/ai-readiness-pass/booking` redirects to booking page.
- Google Calendar booking button opens the scheduler.
- Quiz renders all seven questions.
- Lead form submits.
- Booking request form submits.
- Fallback email works if the tracker is not configured.

## Private host settings needed for first-party lead tracking

Do not put private values in repo files. Add them only in the Netlify project environment/settings area:

- `LEADS_REPO` = `trustybooker/-Ai-Readiness`
- `LEADS_SECRET` = private GitHub access value with issue creation permission

After adding private host settings, redeploy and submit a test lead.

## Production rule

The deploy preview is not the final production launch. Production readiness requires:

- live visual QA,
- live lead test,
- fallback email test,
- booking click test,
- payment link test,
- schema test,
- final truth audit.
