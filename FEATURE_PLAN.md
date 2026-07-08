# NewsWave — Feature Implementation Plan (DRAFT)

> Status: **Draft for discussion.** Nothing here is committed or pushed. Scoping + sequencing only.
> Author date: 2026-07-04

## Current stack (ground truth)

| Layer | Tech |
|---|---|
| Frontend | Next.js 14.2 (App Router), React 18, Tailwind, TipTap editor |
| Backend | NestJS 10 (separate API server, `/api` prefix, port 4000) |
| DB | PostgreSQL (Neon) via TypeORM 0.3, **`synchronize=true` — no migrations** |
| Auth | Custom JWT (`@nestjs/jwt` + passport-jwt + bcrypt), token in `localStorage` |
| Media | Cloudinary (`media.service.ts`) |
| Hosting | Frontend → Vercel, Backend → Render, DB → Neon |
| State | React Context only (no Redux/RTK) |

**Key gaps that shape this plan:**
- `Manager` table has a `role` column (`admin`/`editor`) but **no code enforces it** — no RolesGuard, no superadmin.
- No real scheduled publishing — only a `published` boolean + a `published_at` *display* date. Future `published_at` articles are already live.
- No watermark logic in Cloudinary uploads.
- No email/push infra at all (subscribers collected + moderated, but nothing is ever sent).
- Social dispatch fires only on article **create**, not update.
- Schema auto-syncs — adding columns is automatic, but **destructive in prod if a column is renamed/dropped**. Treat every entity change as a prod-schema change.

---

## Priority + sequencing

Ordered by dependency and value. RBAC (#4) first because ad management, scheduling, and multi-site all need real roles.

| Order | Feature | Size | Risk | Notes |
|---|---|---|---|---|
| 1 | **Auto Scheduled Posting** | M | Med | Highest-value ask; needs a cron/worker |
| 2 | **Super Admin & Admin RBAC (#4)** | M | Med | Unblocks #5, #9; role column already exists |
| 3 | **SEO Features (#3)** | S–M | Low | Metadata API already in place; mostly additive |
| 4 | **Automatic Logo Watermark (#1)** | S | Low | Cloudinary transform, one place |
| 5 | **Advt Placement Management (#5)** | M | Low | New entity + admin UI + render slots |
| 6 | **Newsletter Subscription Mgmt (#7)** | M | Med | Needs email provider decision |
| 7 | **Push Notification (#6)** | M | Med | Web Push (VAPID) or FCM decision |
| 8 | **GA4 Integration (#8)** | S | Low | Partially present already |
| 9 | **Empanelment file (#2)** | XS | Low | Ambiguous — needs clarification |
| 10 | **Central Publishing System (#9)** | XL | High | Future / architectural — do NOT build now |

---

## 1. Auto News Scheduled Posting ⭐ (the explicit ask)

**Goal:** set a publish date+time on an article; it goes live automatically at that time, no manual action.

**Current reality:** `published` is a plain boolean. `published_at` exists but is only a display date — list queries filter on the boolean, not on `published_at <= now`.

**Approach (lazy, uses what's there):**
1. Add a `status` enum to `article.entity.ts`: `'draft' | 'scheduled' | 'published'`. Keep `published` boolean in sync for backward compat, or migrate reads to `status`. Add `scheduled_at timestamptz nullable, indexed`.
2. **Publishing filter:** public list/detail queries return only `status='published'`. A scheduled article is NOT visible until its time.
3. **The trigger — cheapest that works:** NestJS `@nestjs/schedule` (`@Cron`) worker runs every 1 min: `UPDATE articles SET status='published', published_at=now() WHERE status='scheduled' AND scheduled_at <= now()`. On flip, fire the existing social/webhook dispatch (currently create-only — reuse that path here).
   - `// ponytail: 1-min cron poll. Fine for a news site. Move to a queue (BullMQ) only if we need sub-minute precision or thousands of scheduled items.`
   - ⚠️ Render free/single-instance is fine for `@Cron`. If backend ever scales to >1 instance, the cron double-fires → add a DB advisory lock or single "scheduler" instance.
4. **Frontend:** in `ArticleForm.tsx`, a status selector (Draft / Publish now / Schedule) + a `datetime-local` input (native, no picker lib) shown when "Schedule" chosen. Admin article list shows a "Scheduled" badge + the time.

**Backend files:** `article.entity.ts`, `articles.service.ts` (list filter + new cron method), new `scheduler` provider or method, `create-/update-article.dto.ts`.
**Frontend files:** `ArticleForm.tsx`, `admin/articles/page.tsx`, `lib/types.ts`, `lib/api.ts`.

**Skipped:** timezone picker (store UTC, render in admin's local tz via `datetime-local`); per-article retry/queue. Add when scale demands.

---

## 2. Super Admin & Admin Controls — RBAC (#4)

**Goal:** super admin manages everything (settings, users, permissions, content); admins get scoped access by role.

**Current reality:** role column exists, zero enforcement. All protected routes just check "valid token".

**Approach:**
1. Extend `Manager.role` to `'superadmin' | 'admin' | 'editor'`. Seed one superadmin.
2. Build a `RolesGuard` + `@Roles(...)` decorator in NestJS. Apply to sensitive routes (user management, ad management, settings, delete operations). `JwtAuthGuard` already puts role in the payload — the guard just reads it.
3. **User management UI** (superadmin only): list managers, create/edit/deactivate, assign role. New `admin/users/` page + `managers` controller endpoints (currently the entity has no CRUD controller — add one, guarded).
4. Frontend: hide nav items / actions by role from the JWT payload (client-side hiding is UX only — **the guard is the real gate**).

**Backend files:** `manager.entity.ts`, new `roles.guard.ts` + `roles.decorator.ts`, `managers/` controller (new), apply guards across controllers.
**Frontend files:** `AdminShell.tsx` (role-aware nav), new `admin/users/page.tsx`, `AdminAuth.tsx` (decode role from token), `lib/api.ts`.

**Skipped:** granular per-permission matrix. Start with 3 fixed roles; add fine-grained permissions only if a real need appears (YAGNI).

---

## 3. SEO Features (#3)

**Goal:** SEO-friendly URLs, meta tags, focused keyword, live URL preview.

**Current reality:** Metadata API + per-article `generateMetadata()`, sitemap, robots, OG image — already solid. Slugs auto-generated backend-side (supports Hindi/Punjabi). This is mostly **enhancement, not greenfield**.

**Approach:**
1. Add SEO fields to article: `meta_title`, `meta_description`, `focus_keyword`, `canonical_url` (all nullable text). Fall back to title/description when empty (already the default behavior).
2. `generateMetadata()` uses the new fields when present.
3. **Editable slug** in `ArticleForm.tsx` (currently auto-only) with a **live Google-style URL/snippet preview** component (pure client, no dep): shows how title + meta description render in search + the final URL. Warn on slug edit that it breaks existing links unless a redirect is added.
4. Add JSON-LD `NewsArticle` structured data to the article page (`<script type="application/ld+json">`) — big SEO win for Google News, ~20 lines.
5. Keyword field is advisory (helps editors) — optionally a simple "keyword appears in title/desc/body?" check in the editor.

**Backend files:** `article.entity.ts`, DTOs, `articles.service.ts`.
**Frontend files:** `article/[slug]/page.tsx` (metadata + JSON-LD), `ArticleForm.tsx` (SEO section + snippet preview), new `SnippetPreview.tsx`.

**Skipped:** slug-change redirect table (add only if editors rename published slugs often); meta `keywords` tag (Google ignores it — use focus keyword for internal checks only).

---

## 4. Automatic Logo Watermark (#1)

**Goal:** logo auto-overlaid on every image at a fixed position (e.g. top-right).

**Current reality:** Cloudinary uploads pass no transformations. All images (hero + gallery) go through `media.service.ts` `uploadBuffer`.

**Approach (one place, Cloudinary does the work):**
1. Upload the logo once to Cloudinary as a named asset (e.g. `newswave/logo`).
2. In `uploadBuffer`, add an overlay transformation: `{ overlay: 'newswave:logo', gravity: 'north_east', width: 0.15, flags: 'relative', opacity: 70, x: 10, y: 10 }`. This bakes the watermark into the stored derived image — or apply it as a delivery transformation on the returned URL (keeps original clean; recommended).
   - **Delivery-transform approach preferred:** store original, append transform to the delivered `secure_url`. Non-destructive, and lets us change/remove the watermark later without re-uploading.
   - `// ponytail: one transform string, applied at delivery. No per-image config UI unless someone asks for movable positions.`
3. Config: watermark position/opacity/size as env vars or a single settings row, so it's tunable without a deploy.

**Backend files:** `media.service.ts` only (plus a config value).

**Skipped:** per-image watermark on/off toggle, drag-to-position UI. Fixed corner as requested. Add toggle if editors need exceptions (e.g. infographics).

**Watch:** externally-added images by URL (`adminAddImageByUrl`) bypass Cloudinary upload — decide whether those get re-fetched through Cloudinary to watermark, or are exempt.

---

## 5. Advt Placement Management (#5)

**Goal:** admin manages ad placements site-wide — homepage banner, sidebar, in-article native, etc.

**Approach:**
1. New `Ad` entity: `id`, `slot` (enum: `home_banner | sidebar | in_article | ...`), `type` (`image` | `script`/adsense), `image_url`, `target_url`, `html` (for network/adsense snippets), `active` bool, `start_at`/`end_at` nullable, `priority`, timestamps. + CRUD service/controller (RBAC-guarded).
2. Frontend: `admin/ads/page.tsx` to manage slots. A generic `<AdSlot slot="sidebar" />` component fetches the active ad(s) for that slot and renders image+link or injects the script. Place `<AdSlot>` in the layout/home/sidebar/article template.
3. In-article native: inject an ad after N paragraphs in the article render (`article/[slug]/page.tsx`).

**Backend files:** new `ads/` module (entity, service, controller, dto).
**Frontend files:** new `admin/ads/page.tsx`, new `AdSlot.tsx`, wire into `layout.tsx` / home / `SmartStickySidebar` / article page, `lib/api.ts`.

**Skipped:** impression/click analytics, A/B rotation, geo-targeting. Ship fixed slots + active toggle first; measure demand before building an ad server.

---

## 6. Newsletter Subscription Management (#7)

> Card says "Discuss Gurtaran Ji" — **needs a conversation before building.** Scoping only below.

**Current reality:** subscriber collection + moderation exists (`pending/approved/rejected`), but **no email is ever sent.**

**Decision needed:** which email provider? Recommend a transactional/bulk service (e.g. a Resend/SendGrid/Mailgun account) rather than raw SMTP — deliverability + unsubscribe compliance matter for news.

**Likely scope (once decided):**
1. Provider integration in a new `mail/` module.
2. Compose + send a newsletter (manual "send digest of latest N articles" button, or scheduled digest reusing the #1 cron).
3. Unsubscribe link + token (legal requirement).
4. Admin UI: subscriber list already exists; add "compose & send" + send history.

**Blocked on:** provider choice, sending domain + DNS (SPF/DKIM), digest frequency.

---

## 7. Push Notification (#6)

**Goal:** notify users of new articles.

**Decision needed:** delivery channel —
- **Web Push (VAPID)** — free, browser-native, works on the existing site via a service worker. Recommended first step (no third party, no app).
- **FCM** — needed only if a mobile app exists later.

**Approach (Web Push):**
1. Service worker + subscription prompt on frontend; store push subscriptions in a new `push_subscription` table.
2. Backend `web-push` library sends on article publish (hook into the same publish path as #1 scheduling → one dispatch point).
3. Admin toggle: "send push on publish".

**Skipped:** FCM/mobile, segmentation by category/location. Add category-scoped push once subscriber volume justifies it.

**Blocked on:** confirm Web Push vs FCM.

---

## 8. GA4 Integration (#8)

**Current reality:** dashboard already has `AnalyticsCharts.tsx` referencing GA4 — partially present. Verify what's wired.

**Approach:**
1. Ensure GA4 tag (`gtag.js` via `next/script`) loads site-wide with the measurement ID from env.
2. Track pageviews on App Router route changes (App Router needs manual pageview on navigation) + key events (article read, subscribe, ad click).
3. Dashboard: confirm the Data API integration (service account) powering `AnalyticsCharts` is live, or wire it.

**Files:** `layout.tsx` (gtag), a `<GATracker>` client component for route-change pageviews, `admin/dashboard` + `AnalyticsCharts.tsx`.

**Skipped:** consent-mode/cookie banner unless EU traffic matters (flag for legal). Keep event set small.

---

## 9. Empanelment file (#2)

> **Ambiguous — needs clarification.** In Indian news context "empanelment" usually = the government/DAVP/RNI empanelment certificate proving the publication is approved for government ads.

**Lazy interpretation (pending confirmation):** a static page (`app/empanelment/page.tsx`) + a downloadable PDF, linked in the footer. ~30 min of work.

**If it means something else** (e.g. an upload-managed document, or a form for advertisers to request empanelment), scope changes — **confirm before building.**

---

## 10. Future Scalability — Central Publishing System (#9)

> **Do NOT build now.** Explicitly labelled "Future Scalability." This is a multi-tenant re-architecture (manage + distribute content to multiple sites from one panel, separate GA4 per site).

**Why defer:** it touches every entity (add `site`/`tenant` scoping), auth (per-site roles), routing (per-domain), and analytics (per-site GA4). Building it speculatively now would slow every feature above.

**What to do instead (cheap future-proofing):** when adding entities in features 1–8, keep them clean and avoid hardcoding single-site assumptions where trivial. When multi-site becomes a real requirement, plan it as its own project — likely a `Site` entity + tenant column on core tables + domain-based routing.

---

## Cross-cutting notes

- **No migrations (`synchronize=true`):** every entity field added here appears automatically in prod. Safe for *adding* nullable columns; **never rename/drop** a column in place (data loss). Consider turning on real migrations before the schema grows much more.
- **Reuse the publish dispatch point:** scheduling (#1), push (#7), and newsletter (#6) all want to fire "when an article goes live." Build **one** publish hook and let all three subscribe to it. Also fixes the existing bug where social dispatch fires only on create, not update.
- **RBAC before ad/user/settings features** so those endpoints are guarded from day one, not retrofitted.

## Deployment — free tier (how each piece runs at $0)

Current hosting is already all free-tier friendly. The one real trap is the scheduler.

| Piece | Free service | Free-tier limit | Gotcha |
|---|---|---|---|
| Frontend | **Vercel** Hobby | 100 GB bandwidth/mo, unlimited static | Fine. Commercial-use gray area on Hobby — upgrade if it's a revenue site |
| Backend | **Render** Free web service | 750 hrs/mo, **spins down after ~15 min idle** | ⚠️ Spin-down breaks the cron + adds cold-start lag |
| DB | **Neon** Free | 0.5 GB storage, autosuspend | Wakes on query; first query after idle is slow |
| Media | **Cloudinary** Free | 25 credits/mo (~25 GB storage or transforms) | Watermark = a transform; delivery-transform is cached so it's counted once per derived image, not per view |
| Analytics | **GA4** | Free | — |

### ⚠️ The scheduler problem (feature #1) on free tier

Render free **spins down when idle**, so an in-process `@Cron` job will NOT fire on schedule — it only runs while the server happens to be awake. Scheduled posts would publish late or never.

**Free fix (lazy, works):**
1. Expose a plain endpoint: `POST /api/scheduler/tick` — runs the "publish due articles" query + fires the publish hook. Protect it with a shared secret header (`SCHEDULER_TOKEN`), not JWT.
2. Use a **free external cron** (`cron-job.org`, or GitHub Actions scheduled workflow) to hit that URL every 1–5 min.
3. Side benefit: the ping also keeps Render awake, killing cold-start lag during active hours.
   - `// ponytail: external pinger instead of in-process cron. Zero cost, survives spin-down. Move to a real background worker only if we leave the free tier.`
4. Keep `@nestjs/schedule` `@Cron` too as a belt-and-suspenders for when the server IS awake — the endpoint is the reliable path.

> Note: news scheduling rarely needs sub-minute precision. A 1–5 min external tick is fine. Same tick can drive newsletter digests (#6) and publish-time push (#7).

### Free options for the new-service features

- **Newsletter (#7):** free bulk-email tiers — **Brevo** (300 emails/day free) or **Resend** (3,000/mo free). Pick based on volume. All need SPF/DKIM DNS on the sending domain (free to set up).
- **Push (#6):** **Web Push (VAPID) is fully free** — no third-party service, no cost. Just a service worker + the `web-push` lib on the backend. Strong reason to pick Web Push over FCM for free-tier.
- **Ads (#5):** self-hosted (own entity/UI) = $0. Google AdSense = free to integrate, pays you.

### Deploy flow (unchanged, already free)

1. Push to `main` → Vercel auto-deploys frontend, Render auto-deploys backend (both watch the repo).
2. Env vars set in each dashboard: `DATABASE_URL` (Neon), `JWT_SECRET`, `CLOUDINARY_*`, new ones per feature (`SCHEDULER_TOKEN`, mail keys, VAPID keys, GA4 ID).
3. `DATABASE_SYNCHRONIZE=true` means new columns appear on deploy automatically — see the schema warning above.

### When free tier stops being enough

- Render free spin-down / cold starts annoy users → **Render Starter (~$7/mo)** keeps it always-on and makes the in-process cron reliable (drop the external pinger).
- Neon 0.5 GB or Cloudinary 25 credits exceeded → paid tiers of the same services, no re-architecture.
- Everything scales in place; no code changes needed to move off free — just plan upgrades.

---

## Open questions (need answers before starting the blocked items)

1. **Empanelment (#2):** static certificate page, or a managed document/form?
2. **Newsletter (#7):** which email provider? sending domain? digest frequency?
3. **Push (#6):** Web Push (browser) or FCM (app)?
4. **Watermark (#1):** bake into stored image, or non-destructive delivery transform (recommended)? Watermark URL-added images too?
5. **RBAC:** exact role list + what each role can/can't do.
