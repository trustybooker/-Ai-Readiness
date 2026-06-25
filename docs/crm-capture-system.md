# CRM Capture System

Goal: make the site capture enough data to sell fast without adding so much friction that users quit.

## Current capture system

The form captures:

- Name
- Email
- Optional phone
- Selected offer path
- Audience type: individual, job seeker, small business, team/organization
- Timeline
- Budget range
- Message
- AI readiness score
- Recommended path
- Lead tier
- Landing page
- Referrer
- UTM source, medium, campaign, term, and content

Submissions are sent to:

- Primary: `fifynow@fifynowllc.com`
- Fallback copy: `fifynow@gmail.com`

## Lead tiers

The quiz assigns a selling priority:

- Hot implementation lead: score 80+
- Audit-ready lead: score 62 to 79
- Training lead: score 42 to 61
- Foundation lead: below 42

## Best current CRM direction

The better trend is not just a classic CRM. It is a lightweight revenue operations capture system:

1. First-party lead data from the site.
2. AI readiness score and intent data.
3. Automatic routing by lead tier.
4. Human review for trust.
5. Payment links for immediate monetization.
6. CRM record for follow-up and repeat offers.

## Fastest practical stack

Use this order:

1. Site form + dual email now.
2. Google Sheets or Airtable as the first lead database.
3. Make or Zapier to copy form submissions into the database.
4. HubSpot free CRM when follow-up volume increases.
5. GoHighLevel only if Fify Now LLC wants SMS, funnels, calendar, pipelines, and client automation in one place.

## Why not start with a heavy CRM

A heavy CRM before product-market proof can slow the business down. The immediate goal is to capture intent, respond fast, collect payment, and learn which offer sells first.

## Minimum follow-up workflow

When a lead arrives:

1. Check score and lead tier.
2. Reply within 24 hours.
3. Send the most relevant offer or booking link.
4. If high-ticket, ask clarifying questions before payment.
5. Log lead status: New, Contacted, Paid, Scheduled, Completed, Follow-up.

## Future automation

When API keys and CRM access are available, automate:

- Add lead to Airtable or HubSpot.
- Send AI readiness result email.
- Create task for human review.
- Send payment link based on selected path.
- Add reminder if no reply after 24 to 48 hours.
- Tag by source and offer path.
