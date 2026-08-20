# Architecture

## What this is

A Next.js App Router app with a TipTap editor, cookie sessions, and SQLite. One process serves UI and API. That matches the assignment: a small product slice, not a platform.

## Priorities

1. **A usable editing loop** — create, rename, format, autosave, reopen. TipTap stores ProseMirror JSON, so headings, marks, and lists survive refresh without a custom schema.
2. **Sharing you can demonstrate in two logins** — owner vs shared lists, invite by email among seeded users, revoke access. Auth is mocked with three bcrypt-hashed accounts so reviewers are not blocked by OAuth.
3. **File import that creates real documents** — `.txt` / `.md` / `.docx` become editable docs; the original is kept as an attachment. That is more product-relevant than a generic file dump.
4. **Persistence that survives refresh** — Prisma + SQLite. Simple to run locally, easy to inspect, enough for the timebox.

## Layout

```
Browser (React / TipTap)
        |
Next.js route handlers  (/api/auth, /api/documents, /api/documents/import, /api/share)
        |
Prisma  →  SQLite (users, documents, document_shares, attachments)
        |
uploads/  (original imported files)
```

Access rules live in `src/lib/access-rules.ts` so the same logic can be unit tested without spinning up HTTP.

Shared users can edit. Owners still uniquely share and delete. That keeps collaboration demonstrable without building role matrices.

## Deliberate cuts

- No live cursors / WebSockets. Autosave is enough to prove persistence; CRDTs would consume the timebox.
- No Google accounts. Seeded login is the sharing story.
- SQLite instead of hosted Postgres. Local setup stays zero-cost; deploy on a persistent Node host.
- `.docx` import is text extraction, not a pixel-perfect Word conversion.
- No comments, suggest mode, or PDF export.

## If there were 2–4 more hours

- Presence / last-edited-by
- Viewer vs editor roles
- Postgres + object storage so Vercel is viable
- Conflict handling if two people save at once
