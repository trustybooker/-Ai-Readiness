# Launch Checklist

## Pre-launch truth checks

- [ ] No fake testimonials.
- [ ] No fake client logos.
- [ ] No unsupported AI compliance claims.
- [ ] No job guarantees.
- [ ] No revenue guarantees.
- [ ] Completion badge language says proof-of-work completion only unless accreditation is obtained.

## First-party lead tracker

- [ ] Deploy on Netlify.
- [ ] Add private lead tracker environment values in the hosting dashboard.
- [ ] Submit a test lead.
- [ ] Confirm the lead becomes a private GitHub Issue.
- [ ] Confirm labels show priority and path.
- [ ] Confirm issue body includes score, path, tier, UTM/source, and checklist.
- [ ] If tracker is not configured, confirm the fallback email form works.

## Form and email fallback

- [ ] Confirm the first FormSubmit activation email at the business inbox.
- [ ] Confirm Gmail receives fallback copy.
- [ ] Verify the lead includes name, email, phone, path, message, and score summary.

## Fast payment setup

- [ ] Create Square Payment Link: AI Starter Pass.
- [ ] Create Square Payment Link: AI Job and Productivity Pass.
- [ ] Create Square Payment Link: Business AI Readiness Audit.
- [ ] Create Square deposit link: Team Training Sprint deposit.
- [ ] Create Square deposit link: AI Implementation Review deposit.
- [ ] Add refund/credit policy before taking paid orders.
- [ ] Replace request buttons with verified pay links only after test purchase works.
- [ ] Use PayPal Payment Links as backup if Square setup is delayed.

## Course and delivery setup

- [ ] Review Level 1 course material.
- [ ] Review Level 2 course material.
- [ ] Review Level 3 course material.
- [ ] Review Level 4 course material.
- [ ] Create downloadable worksheets from the course files.
- [ ] Create payment-to-onboarding instructions.
- [ ] Create badge template only after final badge language is approved.

## Booking and operations

- [ ] Add booking link for human review.
- [ ] Add analytics.
- [ ] Test response scripts.
- [ ] Test onboarding workflow.
- [ ] Test offboarding workflow.
- [ ] Test implementation playbook on one sample business workflow.

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
- [ ] First-party tracker works on deployed URL.
- [ ] Email fallback works on deployed URL.
- [ ] No temporary files committed.
