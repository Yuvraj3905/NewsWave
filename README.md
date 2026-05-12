# NewsWave

Regional and National News Portal. Fast, mobile-first, SEO-friendly news platform with multi-lingual support and a Manager CMS.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL via TypeORM
- **Auth**: JWT (Manager dashboard)
- **Media**: Cloudinary
- **Docs**: Swagger / OpenAPI at `/api/docs`

## Project Layout

```
newswave/
  backend/    NestJS API + TypeORM entities
  frontend/   Next.js public site + admin dashboard
```

## Local Setup

Prerequisites: Node 20+, pnpm 9+, PostgreSQL (local or Neon).

```bash
pnpm install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

pnpm dev:backend
pnpm dev:frontend
```

Backend runs on `http://localhost:4000`. Frontend runs on `http://localhost:3000`. Swagger docs at `http://localhost:4000/api/docs`.

## Free Deployment

| Layer | Provider | Tier |
|-------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | Neon | Free (serverless Postgres) |
| Media | Cloudinary | Free |
| Social Automation | Make.com | Free |
| Analytics | Google Analytics 4 | Free |

See `DEPLOYMENT.md` for step-by-step deployment instructions.

## Modules

### Public Frontend
- Newspaper-style home grid + sticky "Latest 10" sidebar
- Single article page with related news
- Location and category filters
- Google Translate widget for English / Hindi / Punjabi
- Subscribe form + Contact page

### Manager Dashboard (`/admin`)
- JWT login
- Article CRUD with rich text + image upload
- Multi-select Categories and Locations
- Subscriber list management
- View statistics (internal counter + GA4 link)
- Webhook fires on Publish for social distribution

## License

Proprietary. All rights reserved.
