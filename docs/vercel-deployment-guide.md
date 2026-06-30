# Vercel Deployment Guide

Netlify remains the simplest production host for AI Readiness Pass because the first-party lead tracker was originally built as a Netlify function.

Vercel is now supported as a safe preview/secondary host by adding:

- `vercel.json` for static deployment, headers, and subpath rewrites.
- `api/capture-lead.mjs` as a Vercel-compatible lead capture endpoint.
- Frontend endpoint fallback from `/.netlify/functions/capture-lead` to `/api/capture-lead`.

## Recommended hosting decision

Use Netlify for the first production launch if you want the lowest-risk path.

Use Vercel for preview, visual QA, or production only after the Vercel API route is live-tested.

## Vercel project settings

Import the GitHub repo:

`trustybooker/-Ai-Readiness`

Use branch:

`build/ai-readiness-pass`

Framework preset:

`Other`

Build command:

`npm run validate`

Output directory:

`.`

## Required Vercel environment variables for first-party lead capture

Add these in Vercel Project Settings > Environment Variables:

`LEADS_SECRET`

A GitHub token or app token that can create issues in the configured repo. Do not commit this value.

`LEADS_REPO`

Usually:

`trustybooker/-Ai-Readiness`

## Vercel live test

After deployment, test these URLs:

- `/`
- `/ai-readiness-pass`
- `/booking.html`
- `/ai-readiness-pass/booking`
- `/answers.html`
- `/ai-readiness-pass/answers`
- `/answer/what-is-ai-readiness.html`
- `/ai-readiness-pass/answer/what-is-ai-readiness.html`
- `/sitemap.xml`
- `/robots.txt`

Then submit a test lead.

Expected behavior when `LEADS_SECRET` is configured:

- The form posts to the first available first-party endpoint.
- Vercel should use `/api/capture-lead`.
- A private GitHub issue should be created.
- The visitor should land on `thanks.html`.

Expected behavior when `LEADS_SECRET` is not configured:

- The first-party endpoint returns `not_configured`.
- The browser falls back to the email form path.
- The visitor still has a safe way to reach the business.

## Production rule

Do not mark Vercel production-ready until these are verified on the live Vercel deployment:

- Visual QA on desktop and mobile.
- Hero image loads and crops acceptably.
- Quiz completes.
- Lead form creates a GitHub issue with `LEADS_SECRET` configured.
- Email fallback works when first-party capture is unavailable.
- Booking link opens the correct Google Calendar scheduler.
- Payment links are either empty/request-only or real tested checkout links.
- Schema and sitemap are checked against the deployed URL.

## Safety rule

Never add secrets to this repository. Use Vercel environment variables only.
