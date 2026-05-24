# Feedback Inbox

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A small full-stack app: public-facing feedback form on `/submit`, admin review
queue at `/admin/submissions`. Each submission goes through `pending →
approved | rejected` with optional reviewer notes.

**This repo exists to demonstrate what [Baseplate](https://github.com/ConceptPending/baseplate)
becomes after applying one of its recipes — specifically
[`docs/recipes/public-submission-and-admin-queue.md`](https://github.com/ConceptPending/baseplate/blob/main/docs/recipes/public-submission-and-admin-queue.md).**
The base codebase is Baseplate v0.1.0 with the `Item` example removed
and the submission recipe applied. Total customisation: ~12 file changes,
all the same kind of edit an LLM following the recipe would produce.

## What it does

- Public homepage (`/`) and submit form (`/submit`) — no account needed.
  Each submission validates email + message length, lands in the database
  with status `pending`. Rate-limited to 3/minute per IP.
- Admin login (`/admin/login`) — email + password, bcrypt + JWT in
  HttpOnly cookie, CSRF protection on every authenticated write.
- Admin dashboard (`/admin`) — counts by status.
- Admin submissions queue (`/admin/submissions`) — filter by status,
  approve/reject, add reviewer notes.

## What it inherits from Baseplate

Without changes:

- FastAPI + SQLAlchemy 2 async + Pydantic v2 + Alembic
- Next.js 16 App Router + React 19 + Tailwind 4
- DB-backed multi-admin auth, JWT cookies, CSRF middleware,
  per-endpoint rate limiting, structured logging with request IDs
- Multi-stage non-root Docker images, healthchecks
- CI workflow + opt-in Railway deploy (gated on `RAILWAY_DEPLOY_ENABLED`)
- Pre-commit hooks (ruff, ESLint, tsc)
- Generated TypeScript types from the FastAPI OpenAPI spec (`make generate-client`)
- All the LLM-friendly conventions in `CLAUDE.md`

## What changed from Baseplate

| Removed | Added |
|---|---|
| `Item` model + routes + frontend pages | `Submission` model with status enum |
| `(public)/items` page | `submit` form page |
| `/admin/items` CRUD | `/admin/submissions` queue with status workflow |
| `001_initial` migration (items) | `002_submissions` migration |
| `api/items.py`, `api/public.py` | `api/submissions_admin.py`, `api/submissions_public.py` |
| Baseplate-specific docs (DEPLOYMENT, SECURITY, etc.) | This README, demo-specific |

CSRF middleware got one new exempt path — `/api/submissions` —
because unauthenticated endpoints have no session identity for a
cross-origin attacker to abuse. Rate limiting (3/min) + input
validation cover that surface.

## Quick start

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local

make install && make install-hooks
make hash-password   # paste output into backend/.env as ADMIN_PASSWORD_HASH

make db              # Postgres on :5433
make migrate
make dev             # backend :8001, frontend :3001
```

Visit:
- `http://localhost:3001` — the homepage
- `http://localhost:3001/submit` — the public form
- `http://localhost:3001/admin/login` — log in with the email + password from your `.env`

## Forking this

If you want to build something on Baseplate yourself, **don't start
from this repo**. Start from [Baseplate](https://github.com/ConceptPending/baseplate)
directly and apply whichever [recipe](https://github.com/ConceptPending/baseplate/tree/main/docs/recipes)
matches your shape. This repo will get stale as Baseplate evolves.

## License

MIT — same as Baseplate.
