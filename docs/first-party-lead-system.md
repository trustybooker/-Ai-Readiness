# First-Party Lead Tracking and Response System

Goal: replace paid CRM dependency with a no-extra-cost system using the site, Netlify Functions, and private GitHub Issues.

## What this system does

1. Visitor completes the AI Readiness quiz.
2. The page creates a readiness score, recommended path, and lead tier.
3. The form captures contact details, source tracking, urgency, budget, and message.
4. The form tries the first-party tracker first.
5. If configured, the tracker creates a private GitHub Issue for the lead.
6. If the tracker is not configured yet, the form falls back to email delivery.
7. You work leads from GitHub Issues using labels and response templates.

## Why this is better than paying for tools first

- No monthly CRM cost while validating the offer.
- Private GitHub Issues become the lead database.
- Every lead has a checklist and follow-up record.
- Labels show priority, audience, and offer path.
- The system can later feed HubSpot, Airtable, Google Sheets, or GoHighLevel if volume grows.

## Required setup after deployment

In Netlify, add these environment variables for Functions:

- `LEADS_SECRET`: a GitHub fine-grained access secret with issue write permission for this repo.
- `LEADS_REPO`: `trustybooker/-Ai-Readiness`

Do not put the secret in the repo.

## Labels to use

Create or allow GitHub to create these labels:

- `lead`
- `ai-readiness-pass`
- `priority-hot`
- `priority-audit`
- `priority-training`
- `priority-foundation`
- `status-new`
- `status-contacted`
- `status-paid`
- `status-scheduled`
- `status-completed`
- `status-follow-up`

## Daily workflow

Morning:

1. Open GitHub Issues.
2. Filter `label:lead is:open`.
3. Start with `priority-hot`, then `priority-audit`, then training leads.
4. Send the right response template.
5. Add a comment with the response sent.
6. Update labels.

End of day:

1. Check uncontacted leads.
2. Follow up on urgent leads.
3. Close completed or disqualified leads with a reason.

## First-party response rule

Every response must include:

- What their score/path means.
- The safest next step.
- One clear CTA: pay, book, reply, or complete onboarding.
- No unsupported guarantees.

## When to upgrade later

Upgrade only when volume justifies it:

- 20+ active leads per week: add Google Sheets/Airtable sync.
- 50+ active leads per week: add HubSpot free CRM.
- Heavy SMS/funnels/calendar needs: consider GoHighLevel.

Until then, GitHub Issues plus email response templates are enough.
