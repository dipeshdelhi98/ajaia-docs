# Ajaia Docs

Lightweight collaborative documents for the Ajaia full-stack assignment. Users can create, rename, edit with basic rich text, import files, share with seeded accounts, and reopen work after refresh.

This is intentionally **not** Google Docs. Real-time CRDT collaboration, comments, version history, and export were cut so the editing, persistence, and sharing flows could be finished well inside 4–6 hours.

## Demo accounts

Password for every account: `demo1234`

| Name | Email | Notes |
| --- | --- | --- |
| Alex Rivera | `alex@ajaia.dev` | Owns seeded docs, including one already shared with Jordan |
| Jordan Chen | `jordan@ajaia.dev` | Sees **Team kickoff notes** under Shared with me |
| Sam Okonkwo | `sam@ajaia.dev` | Use to demo inviting a third person |

## Supported file import

- `.txt` — each line becomes a paragraph
- `.md` — headings (`#` / `##` / `###`), bullets, numbered lists, paragraphs
- `.docx` — converted with Mammoth (plain-ish text into paragraphs)

Max size: **4 MB**. The original file is stored as an attachment on the new document.

## Local setup

Requires Node.js 20+.

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port Next.js prints) and sign in as Alex.

**Live product:** [https://ajaia-docs-rouge.vercel.app](https://ajaia-docs-rouge.vercel.app)  
**Walkthrough:** [https://ajaia-docs-rouge.vercel.app/walkthrough](https://ajaia-docs-rouge.vercel.app/walkthrough)  
**Source:** [https://github.com/dipeshdelhi98/ajaia-docs](https://github.com/dipeshdelhi98/ajaia-docs)

Vercel copies a seeded SQLite file into `/tmp` on cold start, so the Jordan share demo always works. New documents may reset when a new serverless instance starts. For durable writes, follow `DEPLOY.md`.

### Tests

```bash
npm test
```

The automated test covers sharing access rules (owner vs shared vs denied).

### Reset demo data

```bash
npm run db:reset
```

## Production notes

- Persistence is **SQLite** via Prisma (`prisma/dev.db`). That is reliable on a long-running Node host (Render, Fly, Railway, a VM). It is **not** a good fit for Vercel serverless because the filesystem is ephemeral.
- Set `SESSION_SECRET` to a long random string in production.
- Uploaded originals live in `/uploads`.

## Reviewer walkthrough (5 minutes)

1. Sign in as `alex@ajaia.dev`.
2. Open **Team kickoff notes**, change formatting, rename the title, refresh — content should persist.
3. Import `samples/kickoff.md`.
4. Share a document with `sam@ajaia.dev`.
5. Sign out, sign in as Sam, confirm it appears under **Shared with me**.
6. Sign in as Jordan to see the pre-shared kickoff doc.
