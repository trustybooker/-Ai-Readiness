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

## Phase 4: Add booking

1. Choose booking tool.
2. Create human review event type.
3. Add booking link to site only after tested.
4. Confirm confirmation email and calendar event.

## Phase 5: Add payment links

1. Create payment links for starter, job pass, business audit, team deposit, and implementation review deposit.
2. Test each link.
3. Confirm payment receipt and fulfillment trigger.
4. Replace request buttons only after tests pass.

## Phase 6: Add analytics

1. Add analytics only after selecting provider.
2. Track page views and conversion CTAs.
3. Do not add invasive tracking before privacy language is reviewed.

## Phase 7: Final QA

1. Run `npm run validate`.
2. Run `docs/final-production-test-matrix.md`.
3. Test mobile and desktop.
4. Test schema on deployed URLs.
5. Confirm all launch blockers are complete.

## Phase 8: Launch decision

Mark PR ready only after:

- Deploy preview passes.
- Lead tracker works.
- Email fallback works.
- Payment links work.
- Booking works.
- Visual QA passes.
- Truth audit passes.

Do not call it production-ready before these checks are complete.
