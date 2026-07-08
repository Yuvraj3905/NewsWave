# NewsWave — Feature Setup Guide

Post-deploy configuration steps for features that need external setup or env vars.
Backend env vars go in the Render dashboard (or `render.yaml`); frontend
`NEXT_PUBLIC_*` vars go in Vercel.

---

## Automatic Logo Watermark

The logo is overlaid on every article image at a fixed corner. It's a
**non-destructive Cloudinary delivery transform** — the original upload is kept,
so the watermark can be changed or removed later just by editing env vars (no
re-upload).

### 1. Upload the logo to Cloudinary (one time)

Upload your logo (PNG with transparency recommended) to the same Cloudinary
account used for uploads. Note its **public_id**.

- Cloudinary dashboard → Media Library → Upload.
- Example public_id: `newswave/logo` (folder `newswave`, file `logo`).

### 2. Set the env vars (backend / Render)

| Var | Required | Default | Purpose |
|---|---|---|---|
| `WATERMARK_LOGO` | **yes** | *(unset = watermark off)* | Logo Cloudinary public_id, e.g. `newswave/logo` |
| `WATERMARK_GRAVITY` | no | `north_east` | Corner: `north_east`, `north_west`, `south_east`, `south_west` |
| `WATERMARK_WIDTH` | no | `0.15` | Logo width relative to image (0.15 = 15%) |
| `WATERMARK_OPACITY` | no | `70` | 0–100 |
| `WATERMARK_MARGIN` | no | `10` | Inset from the corner, in px |

Until `WATERMARK_LOGO` is set, watermarking is a no-op — images pass through
unchanged. Set it and redeploy/restart the backend.

### 3. Verify

- Upload a new hero image (or paste an image URL) on an article.
- Open the article; the logo should appear in the configured corner.
- Note: only images added **after** the env var is set are watermarked.
  Existing images keep their stored URLs until re-uploaded.

### How it applies

- **Uploaded files** (hero + gallery): watermarked at upload via a delivery
  transform on the stored asset.
- **Images added by URL** (hero-by-URL, gallery-by-URL): watermarked via
  Cloudinary `fetch` delivery. The remote URL must be publicly reachable.

### Disable

Unset `WATERMARK_LOGO` and redeploy.

---

## GA4 Analytics

The site loads the GA4 tag and tracks a `page_view` on every client-side
navigation (App Router SPA navigations don't fire pageviews on their own).

### 1. Create a GA4 property

- Google Analytics → Admin → Create property → add a **Web** data stream for
  your domain.
- Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).

### 2. Set the env var (frontend / Vercel)

| Var | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | yes | GA4 Measurement ID, e.g. `G-XXXXXXXXXX` |

Redeploy the frontend. Without this var the tag is a no-op (nothing loads).

### 3. Verify

- Open the site, click around a few pages.
- GA4 → Reports → Realtime should show the active user and one event per page
  you visit (not just the landing page).

> Note: this covers front-of-site tracking. The admin dashboard's analytics
> charts use the app's own DB, not the GA4 Data API — wiring GA4 reporting into
> the dashboard is a separate task (needs a Google service account).
