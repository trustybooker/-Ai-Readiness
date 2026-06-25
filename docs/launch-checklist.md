# Launch Checklist

## Pre-launch truth checks

- [ ] No fake testimonials.
- [ ] No fake client logos.
- [ ] No unsupported AI compliance claims.
- [ ] No job guarantees.
- [ ] No revenue guarantees.
- [ ] Certificate language says completion proof only unless accreditation is obtained.

## Form and lead capture

- [ ] Submit the form once after deployment.
- [ ] Confirm the first FormSubmit confirmation email from `fifynow@fifynowllc.com`.
- [ ] Verify the lead email includes name, email, path, message, and score summary.
- [ ] Replace FormSubmit with Netlify Forms or Resend if deliverability is weak.

## Payment setup

- [ ] Create Stripe product: AI Starter Pass — $59.
- [ ] Create Stripe product: AI Job & Productivity Pass — $197.
- [ ] Create Stripe product: Business AI Readiness Audit — $497.
- [ ] Create Stripe payment links or checkout session backend.
- [ ] Add refund/credit policy before taking paid orders.

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
