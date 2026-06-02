# Tinubu Support Group (TSG) — Next.js + MongoDB

A full-stack Next.js 15 application powering the Tinubu Support Group website. Backend = Next.js Route Handlers + Server Actions. Frontend = React Server Components + Client Components. Database = MongoDB via Mongoose. Email = Resend.

This is a port of the legacy Laravel 12 / MySQL application; URLs are preserved.

---

## Stack

- **Framework**: Next.js 15 (App Router) + React 19, TypeScript (strict)
- **Database**: MongoDB 7+ via Mongoose 8
- **Auth**: Custom JWT in `httpOnly` cookie. Signing key derived via HKDF from `MONGODB_URI` (no extra secret env var)
- **Passwords**: `bcryptjs` (12 rounds — compatible with Laravel's `bcrypt` hashes)
- **Validation**: Zod
- **Email**: Resend SDK + `react-email` for templates
- **File uploads**: MongoDB GridFS (served via `/api/files/[id]`), `sharp` for image resize
- **Forms**: React Hook Form-style local state + Zod
- **Styling**: Tailwind CSS v3 (existing Bootstrap 5 assets in `public/` still load)

---

## Required environment

Only **four** variables. No auth secret — it is derived from `MONGODB_URI` via HKDF (see `src/lib/auth.ts`).

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
MONGODB_DB=tsgweb

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=no-reply@tinubusupportgroup.com
```

The production URL, role list, OTP TTL, and other non-secret constants live in `src/lib/config.ts`. Edit that file and redeploy if you need to change them.

> **Note**: rotating `MONGODB_URI` (e.g. password rotation) invalidates all sessions, since the JWT signing key is derived from it. This is intentional.

---

## Setup

```bash
cp .env.example .env
# fill in MONGODB_URI, RESEND_API_KEY, RESEND_FROM_EMAIL
npm install
npm run seed                # creates super admin: test@tsgweb.com / password123
npm run dev                 # http://localhost:3000
```

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Production server (after build) |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run seed` | Seed super admin + base categories |
| `npm run migrate:db -- --mysql-uri=mysql://user:pass@host/tsgweb` | Import data from old MySQL DB |
| `npm run migrate:files -- --dir=public/storage/images` | Upload existing image files into GridFS |
| `npm run email:dev` | React Email preview server |

---

## Migrating from the legacy Laravel + MySQL app

1. Stand up a MongoDB instance and put its URI in `.env` (`MONGODB_URI`, `MONGODB_DB`).
2. Run `npm install`.
3. Run the database migration against the **legacy MySQL database**:
   ```bash
   npm run migrate:db -- \
     --mysql-uri="mysql://user:pass@host:3306/tsgweb"
   ```
   This reads every legacy table and upserts into Mongo. It is idempotent — safe to re-run; each Mongo doc keeps an `_oldId` so re-runs reconcile.
4. Run the file migration:
   ```bash
   npm run migrate:files -- --dir=public/storage/images
   ```
   This walks the legacy uploads directory, pushes each file into GridFS, and rewrites the matching `Image.link` to `/api/files/<id>`.
5. Verify counts: `users`, `posts`, `categories`, `images` should match between MySQL and Mongo.
6. After cutover and ~30 days of stability, archive `public/storage/images/` and remove the `_oldId` field with `db.users.updateMany({}, { $unset: { _oldId: '' } })` (and similarly for other collections).

The migration script is located at `scripts/migrate-mysql-to-mongo.ts` — flags are documented at the top.

---

## URL parity with the legacy app

Every public URL from the Laravel app exists at the same path:

- `/`, `/about`, `/contact`, `/blog`, `/b/{slug}`, `/category/{slug}`, `/events`, `/p/{slug}`, `/search`, `/faq`
- `/pbat`, `/nationals`, `/sub-nationals`, `/region`, `/state-register/{state}`, `/fg-ministries`, `/group-reg`, `/register`
- `/login`, `/forgot-password`, `/secure-otp`, `/new-password`, `/verify-account/{email}/{password}`
- `/dashboard` and all `/dashboard/...` admin pages

Mutations that the old admin's jQuery posted to (categories, events, etc.) live under `/api/admin/...`. Approve / disapprove / make-admin are now `POST /api/admin/users/[id]/{approve,disapprove,make-admin}` (the legacy used GET — corrected for safety).

---

## Project layout

```
src/
  app/
    (public)/        Public pages — guest-friendly
    (auth)/          Login, register, password-reset flows
    (dashboard)/     Authenticated admin pages
    api/             Route handlers (backend)
  components/
    public/          Header, Footer, PostCard, BlogSidebar, etc.
    dashboard/       Sidebar, etc.
    ui/              Alert
  emails/            React Email templates
  lib/               db, auth, mailer, uploads, validators, etc.
  middleware.ts      Route guards (auth/guest)
  models/            Mongoose models
scripts/
  seed.ts
  migrate-mysql-to-mongo.ts
  import-public-storage.ts
tests/
  unit/              Vitest
  e2e/               Playwright
public/              Existing brand assets, vendor JS, admin theme
```

---

## Deployment

**Vercel**: connect the repo, set the four env vars, deploy. GridFS uploads are limited to ~4.5 MB on the Hobby plan — fine since the app caps at 2 MB per upload.

**Self-host**: `npm run build && npm run start` behind a reverse proxy. MongoDB Atlas (free tier) works well as the DB.

---

## Notes for maintainers

- The auth signing secret is **derived from `MONGODB_URI`** via HKDF (see §6 of `todo.md` for rationale). There is no `NEXTAUTH_SECRET`, `JWT_SECRET`, or similar — that is by design.
- Bcrypt hashes from the legacy Laravel app verify correctly with `bcryptjs`. Imported users keep their original passwords.
- The admin theme JavaScript (jQuery, DataTables, Summernote, etc.) is **not** loaded in the new admin pages; React-native equivalents are used. The legacy assets remain in `public/main/` so individual screens can be ported back if needed.
- Hot-reload: Mongoose connection is cached on `globalThis` to survive Next.js dev hot-reload; see `src/lib/db.ts`.
- Maintenance mode: toggle via Settings → "Enable maintenance mode". The flag lives in the singleton `Setting` document; the public layout redirects to a maintenance screen when set.
