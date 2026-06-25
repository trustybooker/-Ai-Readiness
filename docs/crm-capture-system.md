# CRM Capture System

Goal: capture enough data to sell fast without adding so much friction that users quit.

## Current capture system

The form captures:

- Name
- Email
- Optional phone
- Selected offer path
- Audience type
- Timeline
- Budget range
- Message
- AI readiness score
- Recommended path
- Lead tier
- Landing page
- Referrer
- UTM source, medium, campaign, term, and content

## First-party tracker

The preferred system is now first-party capture into GitHub Issues:

1. The form posts to the Netlify function.
2. The function validates the lead.
3. The function creates a GitHub Issue in the private repo.
4. The issue becomes the CRM record.
5. Labels show priority, path, and audience.
6. The issue body includes the follow-up checklist.

Fallback:

- If the function is not configured, the form submits through the email fallback.

## Lead tiers

The quiz assigns a selling priority:

- Hot implementation lead: score 80+
- Audit-ready lead: score 62 to 79
- Training lead: score 42 to 61
- Foundation lead: below 42

## Best current CRM direction

Do not pay for a CRM yet. Use this order:

1. Site form and first-party GitHub Issue tracker.
2. Email fallback for safety.
3. Weekly manual review.
4. Add Google Sheets or Airtable only if export/reporting becomes necessary.
5. Add HubSpot or GoHighLevel only after lead volume justifies it.

## Why not start with a heavy CRM

A heavy CRM before product-market proof can slow the business down. The immediate goal is to capture intent, respond fast, collect payment, and learn which offer sells first.

## Minimum follow-up workflow

When a lead arrives:

1. Check score and lead tier.
2. Reply within 24 hours.
3. Send the most relevant offer or booking link.
4. If high-ticket, ask clarifying questions before payment.
5. Log lead status: new, contacted, paid, scheduled, completed, follow-up.

## Future automation

When API keys and service access are available, automate:

- Add lead to a spreadsheet or CRM.
- Send AI readiness result email.
- Create task for human review.
- Send payment link based on selected path.
- Add reminder if no reply after 24 to 48 hours.
- Tag by source and offer path.
