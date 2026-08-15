# Final Production Test Matrix

Run this against the deployed release branch, then again on the custom domain before merging to `main`.

## Public route smoke tests

- [ ] `/` and `/index.html` load.
- [ ] `/booking.html`, `/answers.html`, `/checklist.html`, `/checklist-start.html`, `/lab.html`, `/content-engine.html`, `/courses.html`, `/badge.html`, `/refunds.html`, and `/privacy.html` load.
- [ ] `/purchase-success.html` loads and is `noindex`.
- [ ] `/thanks.html` loads; contextual states `?type=review`, `booking`, `lab`, `signal`, and `buyer-onboarding` render appropriate messaging.
- [ ] All `/answer/` pages load.
- [ ] Required `/ai-readiness-pass/...` compatibility routes load, including checklist-start and purchase-success.
- [ ] `sitemap.xml`, `robots.txt`, `favicon.svg`, `site.webmanifest`, and public assets load.
- [ ] `/docs/*`, `/course/*`, `/lib/*`, `/tests/*`, and `/scripts/*` return 404; paid/source curriculum stays non-public.
- [ ] Unknown `/api/*` routes return 404, while approved aliases route to their functions.

## Navigation and responsive QA

- [ ] Homepage mobile menu opens and closes correctly.
- [ ] Selecting a mobile navigation item closes the menu.
- [ ] Secondary-page static navigation wraps on small screens rather than overlaying content.
- [ ] No primary CTA lands on a missing `#book` anchor; unavailable integrations route to a real local booking section or `booking.html`.
- [ ] Back/forward browser navigation does not leave misleading checkout or confirmation state.
- [ ] Keyboard focus is visible on form controls and key actions.

## Visual QA

- [ ] Official Fify Now LLC/AI Kollege branding renders correctly.
- [ ] Favicon and social preview assets resolve.
- [ ] Mobile hero and primary CTA are readable above the fold.
- [ ] Cards/pricing/forms do not overflow or feel crowded on common phone/tablet/desktop widths.
- [ ] No fake people, screenshots, logos, testimonials, urgency, or proof are used.

## Score/recommendation QA

- [ ] Back works.
- [ ] Next stays disabled until an answer is selected.
- [ ] All seven questions render and can be changed.
- [ ] Final score, strongest area, riskiest gap, recommended path, and lead tier appear.
- [ ] Result region announces the update accessibly.
- [ ] Score metadata populates hidden lead fields.
- [ ] Recommended path is automatically preselected in the review form.
- [ ] Matching budget is preselected when possible; the user can still change it.
- [ ] Recommendation CTA continues into a real review path without asking the user to repeat the path decision.

## Form UX and privacy QA

- [ ] Required browser validation works on each form.
- [ ] Forms display the privacy/sensitive-data notice and link to `privacy.html`.
- [ ] Submit buttons disable and display `Sending…` while first-party capture is pending.
- [ ] A slow/unreachable first-party endpoint times out and falls back rather than hanging indefinitely.
- [ ] Normal forms do not double-submit during the first-party attempt.
- [ ] UTM/source/referrer/landing-page fields populate without overriding user-entered values.

## Lead capture and free-value fulfillment QA

- [ ] Main review, checklist, Lab, audience-signal, booking, and buyer-onboarding forms use first-party capture when configured.
- [ ] Lead issue includes relevant name/email/path/score/tier/source/timeline/budget/message fields.
- [ ] Booking issue includes meeting length, preference, timezone, and preferred windows.
- [ ] Checklist submission redirects directly to `/checklist-start.html` and the promised free checklist is usable immediately.
- [ ] If the tracker is disabled, FormSubmit/email fallback works and preserves the correct contextual destination.
- [ ] Honeypot/spam handling does not break legitimate submissions.
- [ ] `npm test` passes.
- [ ] `SITE_URL=<deployed> node scripts/live-lead-test.mjs` passes.

## Booking QA

- [ ] Configured Google Calendar scheduler opens from homepage and booking page.
- [ ] Scheduler opens in a separate safe tab; local fallback remains usable if scheduler config is absent.
- [ ] Internal preferred-time request form stays available for fit/custom cases.
- [ ] Booking request success explicitly says it is not an appointment confirmation.
- [ ] No page presents fake availability or implies a calendar invite exists before it does.

## Stripe and buyer-onboarding QA

- [ ] With payment config blank, no CTA pretends checkout is live.
- [ ] Only `aiStarterPass` and `aiJobProductivityPass` can become direct Buy buttons.
- [ ] Business audit/team/implementation remain routed to human review even if their config fields are populated.
- [ ] Test-mode Stripe Payment Links use one-time prices of $59 and $197 and collect buyer email.
- [ ] Each Stripe after-payment redirect is `https://aikollege.com/purchase-success.html` on the final domain.
- [ ] Each test purchase follows: site Buy → Stripe → successful payment → purchase-success → buyer onboarding → captured onboarding request.
- [ ] Checkout stays in the same tab so return flow is clear.
- [ ] Visiting purchase-success directly never exposes paid curriculum, claims payment, issues a badge, or grants access.
- [ ] Stripe record is manually verified before launch fulfillment/access instructions.
- [ ] Live links replace test links only after both full test flows pass.

## Course, fulfillment, and badge QA

- [ ] Public course/path page describes deliverables clearly.
- [ ] Paid curriculum source under `/course/*` remains blocked from public Netlify access.
- [ ] Launch fulfillment procedure matches buyer onboarding to Stripe before sending start materials.
- [ ] Course levels have clear outcomes and proof-of-work artifacts.
- [ ] Workbook has a review rubric/portfolio summary.
- [ ] Badge language avoids accreditation/licensing/job/income/compliance claims.
- [ ] Human-reviewed status is only used when a human actually reviewed the artifacts.
- [ ] Public badge verification is not implied to exist.
- [ ] Refund/credit and onboarding wording matches the actual self-serve vs review-first offer boundaries.

## AI Secretary / Assistant / WhatsApp QA — only if enabled for launch

- [ ] Secretary remains invisible while `secretary.enabled` is false.
- [ ] `POST /api/secretary` answers approved-content questions when configured.
- [ ] Discount/refund/payment/booking-confirmation requests produce safe refusal/handoff.
- [ ] `POST /api/assistant` without Bearer token returns 401; valid owner token works.
- [ ] Owner drafts are never auto-sent.
- [ ] WhatsApp verify handshake passes and invalid signatures are rejected.
- [ ] Customer vs owner routing works.
- [ ] No AI channel sends payment links, grants refunds, or confirms bookings autonomously.
- [ ] Host-level rate limiting is configured for public function endpoints.

## SEO/AEO QA

- [ ] Canonicals use `https://aikollege.com/` URLs on final production pages.
- [ ] Sitemap includes intended indexable pages, including the free checklist; noindex purchase/thanks pages are omitted.
- [ ] Robots points to the correct sitemap.
- [ ] FAQ and Offer schema match visible claims/offers.
- [ ] Open Graph assets resolve.
- [ ] Direct-answer pages answer the target question near the top.
- [ ] Structured-data validator/Rich Results checks have no blocking errors on live URLs.

## Truth, security, and compliance QA

- [ ] No job/revenue/legal-compliance/accreditation guarantee.
- [ ] No fake checkout, availability, testimonial, logo, proof, or credential.
- [ ] No production secret is committed to repo/config files.
- [ ] Internal source/docs/tests and paid course markdown are not publicly served.
- [ ] Unapproved API routes remain denied.
- [ ] Payment success URL cannot be used as an authorization mechanism.
- [ ] Sensitive/high-impact decisions keep explicit human boundaries.

## Launch decision

Merge PR #12 into `main` only when all required web-launch checks are green:

- [ ] exact release-tip CI/validation passes;
- [ ] latest Netlify deployment is green;
- [ ] live routes/navigation/mobile QA pass;
- [ ] first-party lead capture and email fallback pass;
- [ ] free checklist fulfillment works;
- [ ] scheduler is tested;
- [ ] both Stripe test purchases + buyer onboarding pass before live links;
- [ ] custom domain/SSL/SEO/schema pass;
- [ ] any AI/WhatsApp feature that is enabled has passed its own live safety tests.

Features intentionally left disabled are not launch failures if the UI remains fail-closed and does not promise them.