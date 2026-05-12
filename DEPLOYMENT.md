# NewsWave Deployment Guide

End-to-end free-tier deployment in roughly 30 minutes.

## Architecture

```
[Vercel] Next.js Frontend  ->  [Render] NestJS API  ->  [Neon] PostgreSQL
                                       |
                                       +-> [Cloudinary] Media
                                       +-> [Make.com webhook] -> Instagram / Meta / X
```

## Prerequisites

- GitHub account (push the repo to GitHub)
- Free accounts: Vercel, Render, Neon, Cloudinary, Make.com (or Zapier), Google Analytics 4

## Step 1. PostgreSQL on Neon

1. Sign up at https://neon.tech and create a new project named `newswave`.
2. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.aws.neon.tech/newswave?sslmode=require`).
3. Save it as `DATABASE_URL` for the backend.

## Step 2. Cloudinary

1. Sign up at https://cloudinary.com.
2. From the dashboard, copy `Cloud name`, `API Key`, `API Secret`.
3. Save them as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Step 3. Backend on Render

1. Push the repo to GitHub.
2. In Render, click `New +` then `Blueprint`. Point it at the repo. Render will detect `render.yaml`.
3. Fill in the environment variables marked `sync: false`:
   - `DATABASE_URL` (from Neon)
   - `SEED_MANAGER_USERNAME` (e.g. `admin`)
   - `SEED_MANAGER_PASSWORD` (strong password, change after first login)
   - `CORS_ORIGINS` (your eventual Vercel URL, e.g. `https://newswave.vercel.app`)
   - `CLOUDINARY_*` (from Step 2)
   - `SOCIAL_WEBHOOK_URL` (from Step 5)
   - `PUBLIC_SITE_URL` (your Vercel URL)
4. Deploy. The API will be live at `https://newswave-api.onrender.com`. Swagger docs at `/api/docs`.

## Step 4. Frontend on Vercel

1. In Vercel, import the same GitHub repo.
2. Set the project root to `frontend/`.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://newswave-api.onrender.com/api`
   - `NEXT_PUBLIC_SITE_NAME=NewsWave`
   - `NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX` (from Step 6)
4. Deploy. The site will be live at `https://newswave.vercel.app` (or your custom domain).
5. Update Render's `CORS_ORIGINS` and `PUBLIC_SITE_URL` to match the final Vercel URL.

## Step 5. Social Distribution via Make.com

1. Create a new scenario in Make.com (or Zapier).
2. First module: `Webhooks > Custom webhook`. Copy the generated URL.
3. Add this URL to Render as `SOCIAL_WEBHOOK_URL`.
4. Wire downstream modules:
   - `X (Twitter) > Create a Tweet` using `{{title}} {{url}}`.
   - `Facebook Pages > Create a Post` using `{{title}}` and `{{image_url}}`.
   - `Instagram for Business > Create a Photo Post` (requires a Business account).
5. Webhook payload schema (sent by NewsWave on Publish):

   ```json
   {
     "id": "uuid",
     "title": "string",
     "slug": "string",
     "description": "string",
     "image_url": "string",
     "url": "https://newswave.vercel.app/article/<slug>",
     "categories": ["Sports"],
     "locations": ["Punjab"],
     "published_at": "ISO 8601 timestamp"
   }
   ```

## Step 6. Google Analytics 4

1. Create a GA4 property at https://analytics.google.com.
2. Copy the Measurement ID (`G-XXXXXXXXXX`).
3. Add it to Vercel as `NEXT_PUBLIC_GA4_ID`.
4. Redeploy. The frontend automatically loads gtag.

## First-time Smoke Test

1. Visit `https://newswave-api.onrender.com/health`. Expect `{ "status": "ok" }`.
2. Visit `https://newswave-api.onrender.com/api/docs` for Swagger.
3. Visit your Vercel site. Categories and locations should appear in the header (auto-seeded).
4. Login at `/admin` with the seed credentials. Change password promptly.
5. Publish a test article. Confirm:
   - Article visible on home page and direct URL.
   - Latest 10 sidebar populated.
   - Webhook fires and the post appears on the connected social channels.

## Local Development

```bash
pnpm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

pnpm dev:backend   # http://localhost:4000
pnpm dev:frontend  # http://localhost:3000
```

Local Postgres can be started with Docker:

```bash
docker run --name newswave-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=newswave -p 5432:5432 -d postgres:16
```

Then in `backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/newswave
DATABASE_SSL=false
```

## Cost Summary

| Layer | Provider | Cost |
|-------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free (sleeps after 15 min idle on free tier) |
| Database | Neon | Free (0.5 GB storage, autoscale) |
| Media | Cloudinary | Free (25 credits / month) |
| Social Automation | Make.com | Free (1000 ops / month) |
| Analytics | Google Analytics 4 | Free |
| **Total** | | **0 USD / month** |

Note: Render free tier sleeps after inactivity. First request after sleep takes ~30 seconds. For always-on, upgrade to the Starter plan or use a free uptime pinger like UptimeRobot.
