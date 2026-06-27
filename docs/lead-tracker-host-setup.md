# Lead Tracker Host Setup

## What is already done in the repo

The lead tracker function exists at:

`netlify/functions/capture-lead.mjs`

The browser script already submits forms to:

`/.netlify/functions/capture-lead`

If the tracker is not configured, the browser falls back to the email form route so the lead is not lost.

## What cannot be stored in GitHub

Do not commit private access values into the repo.

The private value belongs in the hosting provider environment settings only.

## Required host settings

Add these to the Netlify site environment variables:

- `LEADS_REPO` = `trustybooker/-Ai-Readiness`
- `LEADS_SECRET` = private GitHub access value that can create issues in the repo

## Setup steps

1. Open the Netlify site for AI Readiness Pass.
2. Open site settings.
3. Open environment variables.
4. Add `LEADS_REPO`.
5. Add `LEADS_SECRET`.
6. Redeploy the site.
7. Submit one test lead from the deployed URL.
8. Confirm a GitHub Issue is created.
9. Submit one test booking request.
10. Confirm the booking issue includes meeting length, meeting preference, timezone, and preferred time windows.

## Test lead values

Use a test name and email you control. Do not use fake customer information.

## Expected success

The form should redirect to the thank-you page and a GitHub Issue should appear with labels such as:

- `lead`
- `ai-readiness-pass`
- a priority label
- a path label
- an audience label

## Expected fallback

If the host settings are missing or invalid, the browser should use the email fallback route.

That fallback is intentional. It protects the visitor from a dead form while the private tracker is being configured.

## Production rule

Do not call lead capture production-ready until a deployed test lead creates a real GitHub Issue and fallback email is confirmed.
