# Ajaia Docs — Assignment Submission

**Candidate:** Dipesh Gaur  
**Live product:** https://ajaia-docs-rouge.vercel.app  
**Walkthrough video:** https://ajaia-docs-rouge.vercel.app/walkthrough  
**Direct video file:** https://ajaia-docs-rouge.vercel.app/walkthrough.webm  
**Source code:** https://github.com/dipeshdelhi98/ajaia-docs

## Reviewer accounts

Password for every account: `demo1234`

| Name | Email | Role on “Team kickoff notes” |
| --- | --- | --- |
| Alex Rivera | alex@ajaia.dev | Owner |
| Jordan Chen | jordan@ajaia.dev | Editor (can edit) |
| Sam Okonkwo | sam@ajaia.dev | Viewer (read-only) |

## What to click (2 minutes)

1. Open the live URL and sign in as Alex.
2. Open **Team kickoff notes**, edit formatting, rename, refresh.
3. Import `samples/kickoff.md` (.txt / .md / .docx, max 4 MB).
4. Open Share — Jordan is Editor, Sam is Viewer.
5. Sign in as Jordan (can edit), then Sam (view only).
6. Watch the walkthrough if you want the same flow narrated on-screen: https://ajaia-docs-rouge.vercel.app/walkthrough

## What works

- Create, rename, rich-text edit (bold, italic, underline, H1–H3, bullets, numbers)
- Autosave and reopen after refresh
- Import .txt, .md, .docx into a new editable document
- Owner vs shared lists
- Invite / revoke, plus editor vs viewer roles (stretch)
- SQLite persistence + seeded login
- Automated tests for access rules

## Intentionally incomplete

- Live cursors / real-time CRDT collaboration
- Comments / suggestions
- Version history
- PDF export
- Vercel SQLite writes can reset on a new serverless instance; seeded shares still work. Local or Render is durable (`DEPLOY.md`).

## Local run

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Then open http://localhost:3000 (or the port Next prints).

## Notes for reviewers

Architecture: `ARCHITECTURE.md`  
AI workflow: `AI_WORKFLOW.md`  
This walkthrough is a silent captioned screen recording (not Loom/YouTube).
