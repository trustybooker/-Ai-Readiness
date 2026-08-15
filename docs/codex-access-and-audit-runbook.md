# Codex Access and Audit Runbook

Use this before allowing Codex or another coding agent to audit or modify AI Readiness Pass.

## Current known problem

Codex reported:

`CONNECT tunnel failed, response 403`

That means the Codex environment could not fetch the real GitHub repository. Any audit produced from that environment is unsafe because it may be looking at an incomplete local checkout instead of the real branch.

## Real repository and branch

Repository:

`trustybooker/-Ai-Readiness`

Real working branch:

`build/ai-readiness-pass`

Primary PR:

`#1 Build AI Readiness Pass website and business asset`

## Stop rule

If `git fetch origin --prune` fails, Codex must stop. It should not audit, recreate, delete, rename, or modify app files.

## Required proof before any Codex audit

Codex must show all of these before changing anything:

```bash
git remote -v
git fetch origin --prune
git checkout build/ai-readiness-pass
git rev-parse --abbrev-ref HEAD
git status --short --branch
```

Expected branch result:

```text
build/ai-readiness-pass
```

Then Codex must verify files exist:

```bash
for f in \
  package.json \
  index.html \
  assets/impact.css \
  assets/app.js \
  assets/site-config.js \
  "Ai Readiness App hero  image.png" \
  netlify.toml \
  sitemap.xml \
  robots.txt \
  netlify/functions/capture-lead.mjs \
  scripts/validate-site.mjs; do
  if [ -e "$f" ]; then echo "FOUND $f"; else echo "MISSING $f"; fi
done
```

Important: the uploaded hero image filename contains two spaces before `image.png`:

`Ai Readiness App hero  image.png`

## Required validation before work

Codex must run:

```bash
npm run validate
```

If this command fails because `package.json` is absent, Codex is not in the real app checkout.

## What Codex may audit after proof passes

Codex may audit:

- hero image placement and crop,
- mobile layout,
- navigation and internal links,
- quiz UX,
- lead form UX,
- lead tracker fallback behavior,
- SEO/AEO/schema consistency,
- sitemap and robots,
- accessibility basics,
- conversion friction,
- truth/compliance copy,
- payment/booking/analytics config safety.

## What Codex must not do

Codex must not:

- recreate missing files from an incomplete checkout,
- delete app files because they appear missing locally,
- remove README/business docs because the local folder looks empty,
- add fake testimonials or fake logos,
- add accreditation, legal, job, revenue, or outcome guarantees,
- add secrets to the repo,
- add untested payment links,
- mark production-ready before live tests pass,
- merge the PR.

## Safe Codex prompt

Give Codex this after its GitHub access is fixed:

```text
You are auditing the real AI Readiness Pass branch.

Repo: trustybooker/-Ai-Readiness
Branch: build/ai-readiness-pass
PR: #1 Build AI Readiness Pass website and business asset

Before changes, prove git fetch works, prove the branch is correct, prove the required files exist, and run npm run validate.

If those proof steps fail, stop and make no changes.

If they pass, perform a read-only audit first. Only propose small safe changes. Preserve the human-first mission, sales conversion system, lead tracker, Google Calendar config, fallback email, course/workbook docs, truth safeguards, and payment-link safety.
```

## Why this matters

The AI Readiness Pass branch is a complete static app with validation. A Codex environment that cannot fetch GitHub may only see an empty or stale local folder. Acting on that folder can create misleading audits or destructive cleanup PRs.
