# Final Production Test Matrix

Run this after a deployment preview exists.

## Public route smoke tests

- [ ] `/` loads.
- [ ] `/ai-readiness-pass` loads if deployed under subpath.
- [ ] `/answers.html` loads.
- [ ] `/checklist.html` loads.
- [ ] `/lab.html` loads.
- [ ] `/thanks.html` loads.
- [ ] All `/answer/` pages load.
- [ ] `sitemap.xml` loads.
- [ ] `robots.txt` loads.
- [ ] `favicon.svg` loads.
- [ ] `site.webmanifest` loads.

## Visual QA

- [ ] Official Fify Now LLC logo is visible in header branding.
- [ ] Favicon uses official Fify Now LLC logo.
- [ ] Social preview image uses official Fify Now LLC logo.
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
- [ ] Lead issue includes name, email, path, score, tier, source, timeline, budget, and message.
- [ ] If tracker is disabled, email fallback works.
- [ ] Honeypot/spam field does not break normal submissions.

## Business flow QA

- [ ] Free score CTA works.
- [ ] Checklist CTA works.
- [ ] Lab waitlist CTA works.
- [ ] Business audit CTA works.
- [ ] Payment request buttons do not pretend checkout is live before payment links exist.
- [ ] Booking link is added and tested before launch.

## SEO/AEO QA

- [ ] Canonical URLs are correct for deployment path.
- [ ] Sitemap includes indexable pages.
- [ ] Robots file points to sitemap.
- [ ] FAQ schema matches visible page content.
- [ ] Open Graph image path resolves.
- [ ] Direct-answer pages answer the question near the top.

## Truth and compliance QA

- [ ] No job guarantee.
- [ ] No revenue guarantee.
- [ ] No legal compliance guarantee.
- [ ] No fake accreditation claim.
- [ ] No fake testimonials.
- [ ] No fake logos.
- [ ] Refund/credit policy is finalized before paid launch.

## Launch decision

Launch only when:

- [ ] Validation passes.
- [ ] Live page smoke tests pass.
- [ ] Lead capture works.
- [ ] Fallback email works.
- [ ] Payment links are tested.
- [ ] Booking link is tested.
- [ ] Visual QA passes.
