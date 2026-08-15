# AI Kollege phone and social authority

## Phone roles

- Public customer line: +1 (772) 666-5472. This is the Twilio AI receptionist number and may be displayed publicly.
- Human-forward destination: private. It is controlled by Owner Studio / `TWILIO_HUMAN_FORWARD_NUMBER` and must not be committed, displayed, logged, or exposed to customers unless the owner deliberately changes that policy.

## Social authority

- Owner: sole approval authority. May approve, schedule, cancel, and execute approved publishing.
- MoMo: may create drafts and may execute publishing only after an owner approval fingerprint matches the exact unchanged content and the platform connection/publish gate is ready. MoMo cannot approve or schedule its own content.
- Secretary: customer-service only; no marketing publishing authority.
- Receptionist: customer-service/voice only; no marketing publishing authority.

Remote destructive edit/delete authority remains disabled. A failed or partial platform operation must be recorded rather than silently retried as a duplicate post.
