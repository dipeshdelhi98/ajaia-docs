# AI workflow

## Tools used

- **Cursor (Grok 4.6 agent)** for scaffolding the Next.js/Prisma app, TipTap wiring, API routes, and first-pass copy for README / architecture notes.
- **No other AI products** (no Copilot chat, no ChatGPT browser, no image generators).

## Where AI sped things up

- Boilerplate: Prisma schema, seed users, JWT cookie session, REST handlers.
- TipTap editor + toolbar + debounce save loop.
- First drafts of assignment writeups so time stayed on product decisions.

## What I changed or rejected

- Rejected a Vercel-first deploy with SQLite. Serverless disk is ephemeral; the architecture note and Dockerfile target a long-running host instead.
- Rejected “viewer-only shares” as the default. Shared users can edit so the collab story is visible without extra UI.
- Tightened import: extension allowlist, 4 MB cap, empty-file check, `.docx` via Mammoth rather than pretending Word XML is trivial.
- Access rules extracted into a pure module so tests are not coupled to Next.js.
- UI copy and scope cuts were edited by hand so they read like product judgment, not a feature dump.

## How correctness was checked

- `npm test` for owner / shared / denied access and who may share.
- Manual path: seed → login as Alex → edit/rename/refresh → import markdown → share with Sam → login as Sam → confirm Shared with me → login as Jordan for the pre-shared doc.
- Error paths: bad password, empty title, unsupported file type, sharing with an unknown email, non-owner delete.

AI drafted structure. I owned scope, access model, and what “done” meant under the timebox.
