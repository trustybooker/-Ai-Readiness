# Commercial Completion Implementation Plan

This file tracks the implementation order for the six production gates.

## Immediate implementation sequence

1. Lifecycle measurement: establish durable server-side business events for lead captured, checkout started, purchase verified, learner activated, module completed and course completed.
2. Conversion recovery: capture recoverable checkout intent only when the user voluntarily supplied contact information; never infer or scrape email. Send one transactional recovery message for an incomplete checkout when allowed, with idempotency and suppression after purchase.
3. Learner delivery: ensure all paid modules have meaningful work, assessments/quality gates, persistent progress, completion proof and clear recognition language.
4. Lifecycle communication: send verified purchase onboarding, useful progress reminders, course-completion messages and support/handoff acknowledgements through Resend. No marketing nurture without consent.
5. Owner Studio: expose read/manage views for verified purchases, learner lifecycle status, communications and important operational events while retaining explicit approval for consequential actions.
6. Measurement: provide an owner-visible funnel summary that distinguishes intent events from proven business results.

## Safety rules

- Do not create fake customer events during production operation.
- Do not send abandoned-checkout email unless an email was legitimately collected and the recipient has a reasonable transactional relationship to the attempted purchase.
- Do not mark payment complete from a client-side click.
- Do not grant paid access without server-side Stripe verification.
- Do not expose customer PII in public repositories, analytics parameters or browser-visible logs.
- Do not weaken Owner Studio authentication or destructive-action approval boundaries.
