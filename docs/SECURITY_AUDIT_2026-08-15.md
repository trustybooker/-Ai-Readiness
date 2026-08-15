# AI Kollege defensive security audit — 2026-08-15

Scope: production web surface, Owner Studio, Secretary, Twilio voice, WhatsApp webhook, lead capture, MoMo bridge, social operations, private GitHub-backed storage, headers, CI and dependency controls.

## Remediated findings

1. Added a restrictive Content-Security-Policy, COOP, and preserved existing HSTS/XFO/nosniff/privacy headers.
2. Added durable WhatsApp webhook replay/idempotency reservation using hashed message IDs in the verified private store, with an in-memory safety fallback.
3. Added request-size limits before JSON/body parsing on public AI, Owner Studio, MoMo, social and WhatsApp entrypoints; lead capture already had a limit and now also has an edge rate limit.
4. Removed five-minute positive privacy caching from private lead/settings repositories so every access re-verifies that the repository is private; owner lead writes re-check immediately before mutation.
5. Added Markdown neutralization for untrusted lead/transcript data stored in private GitHub issues to reduce issue-body spoofing/phishing risk.
6. Added support for CHANNEL_MEMORY_KEY and CHANNEL_MEMORY_LEGACY_KEY so encrypted channel history can survive GitHub token rotation without reusing a repository access token as the preferred long-term encryption secret.
7. Added permanent security regression tests and a security/code-quality validation script.
8. CI now uses reproducible npm ci, runs a high-severity production dependency audit, then tests wiring, SEO/AEO and security controls.

## Authority boundaries retained

- Owner Studio requires bearer-token authentication and remains noindex/no-store.
- Secretary and Receptionist cannot publish marketing.
- MoMo cannot self-approve social content; execution is allowed only after owner approval of the exact fingerprint.
- Remote destructive social edit/delete authority remains disabled.
- Private customer records fail closed if their configured GitHub repository is not currently private.

## Residual operational requirements

- Set a strong, independent CHANNEL_MEMORY_KEY before rotating LEADS_SECRET if long-lived conversation continuity matters. If migrating after prior encryption, temporarily set CHANNEL_MEMORY_LEGACY_KEY to the former key material while old records age out.
- Platform OAuth tokens and owner tokens remain deployment secrets and must never be copied into repository files or public configuration.
- Live infrastructure penetration testing should use controlled test accounts/numbers and avoid production customer data or destructive platform actions.
