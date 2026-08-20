# Render / Railway (recommended for this SQLite app)

The app needs a persistent filesystem. Vercel serverless will not keep SQLite data or uploads.

1. Push this repo to GitHub
2. Create a Render Web Service from the repo
3. Build command: `npm ci && npx prisma generate && npx prisma db push && npm run db:seed && npx next build`
4. Start command: `npm start`
5. Set `SESSION_SECRET` to a long random string
6. Set `DATABASE_URL` to `file:./dev.db`

`render.yaml` in the repo root can also be used with Render Blueprints.
