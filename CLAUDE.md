# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun dev           # Start dev server
bun run build     # Production build
bun run preview   # Preview production build
bun run generate  # Static site generation
```

No linting or test commands are configured yet.

## Environment

Copy `.env.example` to `.env` and fill in:
- `CLERK_*` — Clerk authentication keys
- `SUPABASE_*` — Supabase URL, anon key, service role key
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` — bot credentials
- `RESEND_API_KEY` — transactional email

## Architecture

**BeautyBook** is a Nuxt 3 full-stack marketplace for beauty professionals. It supports three access modes: web, Telegram Mini App (TMA), and a Telegram bot.

### Routing

File-based routing via `pages/`:
- `/` — landing page
- `/dashboard/*` — master (beauty pro) workspace: calendar, services, portfolio, clients, analytics
- `/master/[username]` — public master profile; `/master/[username]/book` — booking flow
- `/client/bookings` — client's appointment history
- `/tma/*` — Telegram Mini App variants of master/booking pages
- `/admin` — admin dashboard

Route protection is enforced by middleware:
- `auth.ts` — requires any authenticated user
- `master-only.ts` — checks Clerk auth + `profiles.role === 'master'` in Supabase

### Data layer

- **Supabase** is the database. `types/database.types.ts` is the authoritative schema reference.
- Key tables: `profiles` (role: master/client/admin), `master_profiles`, `services`, `bookings`, `payment_types`, `payment_records`, `portfolio_items`, `reviews`.
- In server API routes (`server/api/`), use `useServerSupabase()` (service role key). In browser code, use `useSupabaseClient()`.
- **Clerk** handles authentication. User identity flows from Clerk → Supabase `profiles` table.

### API routes (Nitro)

Organized under `server/api/`:
- `masters/` — public endpoints (list, profile, available slots, book)
- `master/` — authenticated master-only endpoints (services CRUD, bookings, analytics, checkout, payment-types)
- `me/` — current user profile & client bookings
- `telegram/validate` — validates Telegram Mini App init data

### State & composables

- **Pinia stores** (`stores/`): `useBookingStore` (selected date/service/slots), `useMasterStore` (profile, services, bookings)
- **Composables** (`composables/`): `useBooking`, `useMaster`, `useQuickCheckout`, `useTelegramApp` — encapsulate `$fetch` calls and reactive state

### Telegram integration

- `bot/` — Grammy bot with command handlers
- `composables/useTelegramApp.ts` + `@tma.js/sdk` — detects TMA context and exposes Telegram user data
- TMA pages mirror the web booking flow under `/tma/`

### Forms & validation

Zod schemas with `vee-validate` + `@vee-validate/zod` adapter. Define schemas with `z.object(...)`, pass to `useForm({ validationSchema })`.

### UI

`@nuxt/ui` (v2) for components and Tailwind CSS for utilities.
