# GamER Hub — Rules

pnpm monorepo: `apps/web` (Next.js, deployed to Cloudflare via OpenNext/Wrangler),
`apps/api` (NestJS, deployed to Google Cloud Run), Firestore as the production
database. See [README.md](README.md) for architecture, [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
for the deploy pipeline, [FIRESTORE_MIGRATION.md](FIRESTORE_MIGRATION.md) for
why Prisma/Postgres was replaced by Firestore in production.

Also read the root [../CLAUDE.md](../CLAUDE.md) — brand rules there still apply here.

## Scope discipline

- Do exactly what was asked. Don't fix unrelated issues you notice in passing —
  mention them in chat and let the user decide.
- Never write a session summary/status `.md` file (e.g. `DEPLOYMENT_STATUS.md`,
  `INFRASTRUCTURE_SUMMARY.md`). Summarize in chat. This repo has accumulated and
  since had to prune several of these — don't recreate them.
- Don't add ad-hoc `test-*.js` scripts at the repo root to manually poke at
  something. Use the real test suites (`pnpm test`, `pnpm test:e2e`,
  `pnpm test:visual`) or add a proper test file under the relevant app.

## Local dev

- `docker-compose.yml` still runs a local Postgres for `apps/api` dev (via
  Prisma) even though **production** uses Firestore — this mismatch is real,
  not a doc error; don't "fix" it by ripping out docker-compose or Prisma
  without being asked.
- `pnpm dev` starts the Firestore emulator + both apps. `pnpm stack:up` starts
  the full docker-compose stack (Postgres + API + web) instead.

## Secrets

- `.env` / `.env.local` are gitignored and must never be committed. Only
  `.env.example` / `.env.production.example` are tracked — keep them in sync
  with real env vars but never put real secrets in them.
