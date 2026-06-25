# Launch Checklist

## Pre-launch truth checks

- [ ] No fake testimonials.
- [ ] No fake client logos.
- [ ] No unsupported AI compliance claims.
- [ ] No job guarantees.
- [ ] No revenue guarantees.
- [ ] Certificate language says completion proof only unless accreditation is obtained.

## Form and lead capture

- [ ] Deploy the branch on Netlify.
- [ ] Enable Netlify Forms for `ai-readiness-lead`.
- [ ] Add form notification email to the temporary inbox in `docs/temporary-lead-inbox.md`.
- [ ] Submit the form once after deployment.
- [ ] Verify the lead includes name, email, path, message, and score summary.
- [ ] Replace temporary notification routing with domain email or Resend when verified.

## Fast payment setup

- [ ] Create PayPal Payment Link: AI Starter Pass — $59.
- [ ] Create PayPal Payment Link: AI Job & Productivity Pass — $197.
- [ ] Create PayPal Payment Link: Business AI Readiness Audit — $497.
- [ ] Or create the same links in Square Payment Links.
- [ ] Add refund/credit policy before taking paid orders.
- [ ] Replace request buttons with verified pay links only after test purchase works.

## Stripe setup

- [ ] Create Stripe product: AI Starter Pass — $59.
- [ ] Create Stripe product: AI Job & Productivity Pass — $197.
- [ ] Create Stripe product: Business AI Readiness Audit — $497.
- [ ] Create Stripe payment links or checkout session backend.
- [ ] Keep Stripe as the clean long-term setup for subscriptions and automation.

## Booking and CRM

- [ ] Add booking link for human review.
- [ ] Add CRM destination for leads.
- [ ] Add email automation for score follow-up.
- [ ] Add tracking: source, score tier, recommended path, and selected path.

## Video and visual assets

- [ ] Generate 16:9 hero video.
- [ ] Generate 9:16 vertical ad video.
- [ ] Reject videos with bad hands, plastic skin, unreadable screens, or fake-looking people.
- [ ] Compress video for web.
- [ ] Add fallback poster image.

## Conversion audit

- [ ] First 3 seconds clearly answer: what is this, who is it for, why now, what action next.
- [ ] Mobile hero shows CTA above fold.
- [ ] Pricing makes the next step simple.
- [ ] Human review layer is clear.
- [ ] Business and job-seeker paths are both visible.

## Technical audit

- [ ] `npm run validate` passes.
- [ ] GitHub Actions validate workflow passes.
- [ ] Netlify or Vercel preview loads.
- [ ] Form submission works on deployed URL.
- [ ] No temporary files committed.
