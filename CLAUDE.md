# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev             # Start dev server
bun run build       # Production build
bun run preview     # Preview production build
bun run generate    # Static site generation
bun run lint        # Biome lint + autofix
bun run format      # Biome format + autofix
bun run check       # Biome lint + format + autofix (use this)
```

## Environment

Copy `.env.example` to `.env` and fill in:
- `NUXT_CLERK_SECRET_KEY` / `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY` / `NUXT_SUPABASE_SERVICE_ROLE_KEY`
- `NUXT_TELEGRAM_BOT_TOKEN` / `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- `NUXT_RESEND_API_KEY`

## Architecture

**BeautyBook** is a Nuxt 4 full-stack marketplace for beauty professionals. Supports three access modes: web, Telegram Mini App (TMA), and a Telegram bot.

### Directory structure (Nuxt 4)

```
app/                  ← srcDir (Nuxt 4 default)
  app.vue
  assets/css/main.css ← Tailwind v4 + Nuxt UI v3 imports
  pages/
  components/
  composables/
  stores/
  middleware/
  types/
server/               ← Nitro API routes, stays at root
bot/                  ← Grammy Telegram bot
supabase/migrations/
nuxt.config.ts
biome.json
```

### Routing

File-based routing via `app/pages/`:
- `/` — landing page
- `/dashboard/*` — master workspace: calendar, services, portfolio, clients, analytics
- `/master/[username]` — public master profile; `/master/[username]/book` — booking flow
- `/client/bookings` — client's appointment history
- `/tma/*` — Telegram Mini App variants of master/booking pages
- `/admin` — admin dashboard

Route protection via `app/middleware/`:
- `auth.ts` — requires any authenticated user (Clerk)
- `master-only.ts` — checks Clerk auth + `profiles.role === 'master'` in Supabase

### Data layer

- **Supabase** is the database. `app/types/database.types.ts` is the authoritative schema reference.
- Key tables: `profiles` (role: master/client/admin), `master_profiles`, `services`, `bookings`, `payment_types`, `payment_records`, `portfolio_items`, `reviews`.
- In server API routes, use `useServerSupabase()` (service role key). In browser code, use `useSupabaseClient()`.
- **Clerk** handles authentication. User identity flows from Clerk → Supabase `profiles` table.

### API routes (Nitro)

Organized under `server/api/`:
- `masters/` — public endpoints (list, profile, available slots, book)
- `master/` — authenticated master-only endpoints (services CRUD, bookings, analytics, checkout, payment-types)
- `me/` — current user profile & client bookings
- `telegram/validate` — validates Telegram Mini App init data

### State & composables

- **Pinia stores** (`app/stores/`): `useBookingStore`, `useMasterStore`
- **Composables** (`app/composables/`): `useBooking`, `useMaster`, `useQuickCheckout`, `useTelegramApp`

### Telegram integration

- `bot/` — Grammy bot with command handlers
- `app/composables/useTelegramApp.ts` + `@tma.js/sdk` — detects TMA context
- TMA pages under `app/pages/tma/`

### Forms & validation

Zod schemas with `vee-validate` + `@vee-validate/zod`. Define schemas with `z.object(...)`, pass to `useForm({ validationSchema })`.

### UI

`@nuxt/ui` v3 with Tailwind CSS v4. Styles are CSS-first — configure via `@theme` in `app/assets/css/main.css`. All pages are wrapped in `<UApp>` in `app/app.vue`.

### Code quality

Biome v2 handles linting and formatting (`biome.json` at root). Vue file support is experimental (`html.experimentalFullSupportEnabled`). Run `bun run check` before committing.
