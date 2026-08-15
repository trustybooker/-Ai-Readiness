# Live Launch Runbook

Use this to finish the move from code-ready to live-production-ready.

## Phase 1: Deploy preview

1. Connect the repository to the host.
2. Select branch `build/ai-readiness-pass` for preview.
3. Use build command `npm run validate`.
4. Use publish directory `.`.
5. Wait for deployment preview.

## Phase 2: Configure first-party tracker

1. Add the private lead tracker host settings outside the repo.
2. Keep private values out of GitHub files.
3. Redeploy after settings are added.
4. Submit a test lead.
5. Confirm the GitHub Issue record is created.

## Phase 3: Verify fallback email

1. Temporarily disable tracker or test before tracker is configured.
2. Submit a test lead.
3. Confirm the business inbox receives the message.
4. Confirm Gmail receives fallback copy.
5. Save a screenshot or note in the PR.

## Phase 4: Internal booking request system

1. Open `booking.html`.
2. Submit a booking request with service, meeting length, meeting preference, timezone, and preferred time windows.
3. Confirm the booking request creates the expected lead record or fallback email.
4. Review availability in Google Calendar.
5. Create the confirmed Google Calendar invite only after fit and availability are reviewed.
6. Send confirmation to the requester.

This internal system is a booking request flow, not fake live availability.

## Phase 5: Optional public scheduler link

1. Create a Google Calendar appointment schedule or other scheduler link.
2. Test the scheduler link yourself.
3. Add the tested link to `bookingUrl` in `assets/site-config.js`.
4. Redeploy.
5. Confirm booking buttons open the scheduler.

## Phase 6: Add payment links

1. Create payment links for starter, job pass, business audit, team deposit, and implementation review deposit.
2. Test each link.
3. Confirm payment receipt and fulfillment trigger.
4. Add tested links to `assets/site-config.js`.
5. Replace request behavior only after tests pass.

## Phase 7: Add analytics

1. Add analytics only after selecting provider.
2. Track page views and conversion CTAs.
3. Do not add invasive tracking before privacy language is reviewed.
4. Add the tested Google Analytics measurement ID or Plausible domain to `assets/site-config.js`.

## Phase 8: Final QA

1. Run `npm run validate`.
2. Run `docs/final-production-test-matrix.md`.
3. Test mobile and desktop.
4. Test `booking.html`.
5. Test schema on deployed URLs.
6. Confirm all launch blockers are complete.

## Phase 9: Launch decision

Mark PR ready only after:

- Deploy preview passes.
- Lead tracker works.
- Email fallback works.
- Internal booking request works.
- Google Calendar invite workflow works.
- Payment links work.
- Booking link works if using a public scheduler.
- Visual QA passes.
- Truth audit passes.

Do not call it production-ready before these checks are complete.
