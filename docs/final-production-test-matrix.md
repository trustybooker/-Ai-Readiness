# Final Production Test Matrix

Run this after a deployment preview exists.

## Public route smoke tests

- [ ] `/` loads.
- [ ] `/index.html` loads.
- [ ] `/ai-readiness-pass` loads if deployed under subpath.
- [ ] `/ai-readiness-pass/index.html` loads.
- [ ] `/booking.html` loads.
- [ ] `/ai-readiness-pass/booking` loads.
- [ ] `/ai-readiness-pass/booking.html` loads.
- [ ] `/answers.html` loads.
- [ ] `/ai-readiness-pass/answers` loads.
- [ ] `/ai-readiness-pass/answers.html` loads.
- [ ] `/checklist.html` loads.
- [ ] `/ai-readiness-pass/checklist` loads.
- [ ] `/lab.html` loads.
- [ ] `/ai-readiness-pass/lab` loads.
- [ ] `/thanks.html` loads.
- [ ] `/ai-readiness-pass/thanks` loads.
- [ ] `/courses.html` loads.
- [ ] `/ai-readiness-pass/courses` loads.
- [ ] `/badge.html` loads.
- [ ] `/ai-readiness-pass/badge` loads.
- [ ] `/refunds.html` loads.
- [ ] All `/answer/` pages load.
- [ ] All `/ai-readiness-pass/answer/` pages load.
- [ ] `sitemap.xml` loads.
- [ ] `/ai-readiness-pass/sitemap.xml` loads.
- [ ] `robots.txt` loads.
- [ ] `/ai-readiness-pass/robots.txt` loads.
- [ ] `favicon.svg` loads.
- [ ] `site.webmanifest` loads.
- [ ] `/ai-readiness-pass/assets/styles.css` loads.

## Visual QA

- [ ] Official Fify Now LLC logo is visible in header branding.
- [ ] Favicon uses official Fify Now LLC logo.
- [ ] Social preview image uses official Fify Now LLC logo.
- [ ] Contextual AI readiness visual appears without distortion.
- [ ] Mobile hero is readable.
- [ ] Primary CTA is visible above the fold on mobile.
- [ ] Cards and pricing do not feel crowded.
- [ ] No fake AI people or fake screenshots are used.

## Quiz QA

- [ ] Back button works.
- [ ] Next button stays disabled until answer selected.
- [ ] All seven questions render.
- [ ] Final score appears.
- [ ] Recommended path appears.
- [ ] Lead tier appears.
- [ ] Hidden score fields populate before lead submit.

## Lead capture QA

- [ ] Main form submits through first-party tracker when configured.
- [ ] Checklist form submits through first-party tracker when configured.
- [ ] Lab form submits through first-party tracker when configured.
- [ ] Booking form submits through first-party tracker when configured.
- [ ] Lead issue includes name, email, path, score, tier, source, timeline, budget, and message.
- [ ] Booking issue includes meeting length, meeting preference, timezone, and preferred times.
- [ ] If tracker is disabled, email fallback works.
- [ ] Honeypot/spam field does not break normal submissions.
- [ ] `npm test` passes (unit coverage for both capture paths).
- [ ] `SITE_URL=<deployed> node scripts/live-lead-test.mjs` passes against the live site.

## AI Secretary / Assistant / WhatsApp QA (run only after env vars are set)

- [ ] `POST /api/secretary` answers a paths question from approved content only.
- [ ] Asking the secretary for a discount/refund produces a refusal + handoff and a `[Secretary]` lead issue.
- [ ] Secretary widget stays completely hidden while `secretary.enabled` is false.
- [ ] `POST /api/assistant` without the Bearer token returns 401.
- [ ] `leads_summary`, `draft_reply`, and `today` actions return usable output; drafts are never sent.
- [ ] Meta webhook GET verification passes with `WHATSAPP_VERIFY_TOKEN`.
- [ ] A POST with a bad `X-Hub-Signature-256` returns 401 and is not processed.
- [ ] A customer WhatsApp message gets a grounded secretary reply; a purchase/refund intent gets a human-handoff reply and lead issue.
- [ ] A message from `OWNER_WHATSAPP_NUMBER` returns the owner leads summary.
- [ ] No payment link is ever sent by the bot on any channel.
- [ ] Host-level rate limiting (Netlify/Vercel dashboard) is enabled for the three function endpoints.

## Business flow QA

- [ ] Free score CTA works.
- [ ] Checklist CTA works.
- [ ] Lab waitlist CTA works.
- [ ] Business audit CTA works.
- [ ] Payment request buttons do not pretend checkout is live before payment links exist.
- [ ] Stripe Payment Links created and TEST-mode purchase completed before pasting live links (see docs/stripe-setup.md).
- [ ] Only aiStarterPass and aiJobProductivityPass show a Buy button; audit/team/implementation stay routed to human review.
- [ ] Payment Link "After payment" redirects to https://aikollege.com/thanks.html (once domain is live).
- [ ] Booking link is added and tested before launch.
- [ ] Google Calendar scheduler opens from deployed site.
- [ ] Internal booking request remains available for custom/fit-review cases.

## Course and certificate QA

- [ ] Course levels have clear outcomes.
- [ ] Workbook includes proof-of-work artifacts.
- [ ] Workbook includes review rubric.
- [ ] Badge language avoids accreditation claims.
- [ ] Completion record fields are defined.
- [ ] Public claim wording is truthful.
- [ ] Refund/credit policy is finalized before paid launch.

## SEO/AEO QA

- [ ] Canonical URLs are correct for deployment path.
- [ ] Sitemap includes indexable pages.
- [ ] Robots file points to sitemap.
- [ ] FAQ schema matches visible page content.
- [ ] Offer schema matches visible offers.
- [ ] Open Graph image path resolves.
- [ ] Direct-answer pages answer the question near the top.
- [ ] Rich Results Test or schema validator has no blocking errors on live URLs.

## Truth and compliance QA

- [ ] No job guarantee.
- [ ] No revenue guarantee.
- [ ] No legal compliance guarantee.
- [ ] No fake accreditation claim.
- [ ] No fake testimonials.
- [ ] No fake logos.
- [ ] No fake availability.
- [ ] No fake checkout.
- [ ] No secrets committed to the repo (env vars only in host dashboards).
- [ ] AI secretary cannot be prompted into promising outcomes, discounts, or refunds (spot-check on live endpoint).

## Launch decision

Launch only when:

- [ ] Validation passes.
- [ ] Live page smoke tests pass.
- [ ] Lead capture works.
- [ ] Fallback email works.
- [ ] Payment links are tested.
- [ ] Booking link is tested.
- [ ] Visual QA passes.
- [ ] Course/certificate truth QA passes.
- [ ] SEO/AEO/schema live checks pass.
