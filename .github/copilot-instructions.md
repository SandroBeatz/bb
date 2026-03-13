# BeautyBook Copilot Instructions

## Build, test, and lint commands

This repository uses Bun (`packageManager: bun@1.2.9` in `package.json`).

- `bun dev` - start the Nuxt 3 dev server
- `bun run build` - production build
- `bun run preview` - preview the production build
- `bun run generate` - static generation build

There are currently no lint scripts or test scripts in `package.json`, so there is no supported full-test or single-test command yet.

## High-level architecture

BeautyBook is a Nuxt 3 full-stack marketplace for beauty professionals. The app has three delivery surfaces that share the same core data model:

- Web app pages in `pages/`
- Telegram Mini App pages under `pages/tma/`
- A Grammy bot in `bot/`

Routing is file-based. The main user-facing areas are:

- `/dashboard/*` for authenticated masters
- `/master/[username]` and `/master/[username]/book` for public profiles and booking
- `/client/bookings` for a client’s booking history
- `/tma/*` for Telegram Mini App equivalents
- `/admin` for admin screens

Route access is enforced in middleware, not ad hoc in page components:

- `middleware/auth.ts` redirects anonymous users to `/sign-in`
- `middleware/master-only.ts` requires Clerk auth and then checks `profiles.role === 'master'` in Supabase

The backend is implemented as Nitro endpoints under `server/api/` with three main scopes:

- `server/api/masters/` for public master discovery, public profiles, available slots, and booking
- `server/api/master/` for authenticated master operations such as services, bookings, analytics, and payment types
- `server/api/me/` for the current signed-in user’s profile and bookings

Authentication and persistence are split across Clerk and Supabase:

- Clerk provides identity through `useAuth()`
- Supabase stores application data
- Server routes use `useServerSupabase()` from `server/utils/supabase.ts`, which creates a service-role client
- Client code uses `useSupabaseClient()` where direct browser reads are needed

State and data access are split intentionally:

- `composables/useBooking.ts` and `composables/useMaster.ts` wrap Nitro endpoints with `$fetch`
- `stores/booking.ts` and `stores/master.ts` hold longer-lived UI state and, in some cases, read directly from Supabase

Telegram support is a first-class part of the app, not an add-on:

- `composables/useTelegramApp.ts` initializes `@tma.js/sdk` and exposes TMA launch data
- `server/utils/telegram.ts` validates Telegram init data
- `bot/index.ts` wires the Grammy bot and webhook handler

Database shape is documented in code:

- `types/database.types.ts` is the typed schema reference used for tables and fields
- `supabase/migrations/` holds schema changes

For product intent and existing repository guidance, reuse `README.md`, `CLAUDE.md`, `KEYS_REQUIRED.md`, and `spec/beautybook_spec.md`.

## Key conventions

### API and auth conventions

Server handlers consistently use `defineEventHandler(...)`, extract params with `getRouterParam`, `getQuery`, and `readBody`, and fail with `createError(...)`.

Authenticated API routes do Clerk checks inside the handler before querying Supabase. The recurring pattern is:

1. `const { userId } = useAuth()`
2. reject with `401` if `userId.value` is missing
3. scope Supabase queries by that user ID (`master_id`, `client_id`, or profile `id`)

Master-only page access is handled in middleware rather than repeated inside page components.

### Supabase usage conventions

Use `useServerSupabase()` in server routes and `useSupabaseClient()` in browser code. Do not mix those responsibilities.

Supabase queries typically:

- use fluent filters such as `.eq(...)`, `.lt(...)`, `.gt(...)`, `.in(...)`, `.order(...)`
- call `.single()` when the route expects exactly one row
- throw a `createError` immediately when Supabase returns an error

Booking conflict detection is done with overlapping time-range checks in `server/api/masters/[id]/book.post.ts`, and slot generation is centralized in `server/utils/slots.ts`.

### Frontend data-flow conventions

Composables are the preferred place for request/response state (`loading`, `error`, fetched data) around `$fetch` calls.

Pinia stores are used for cross-page state such as:

- selected booking date/service and available slots in `stores/booking.ts`
- loaded master profile, services, and bookings in `stores/master.ts`

### Validation and data-shape conventions

This codebase mostly uses explicit manual validation in server routes rather than shared schema validators for API bodies. Required fields are checked inline and invalid requests throw `400` errors.

Date-sensitive booking flows expect `YYYY-MM-DD` query strings for slot lookup and ISO timestamps for persisted booking times.

When working on database-backed features, align changes across:

- `supabase/migrations/`
- `types/database.types.ts`
- any affected Nitro route, composable, and store

### Environment conventions

Environment variables follow the `NUXT_*` / `NUXT_PUBLIC_*` split from `.env.example` and `nuxt.config.ts`:

- Clerk keys
- Supabase URL, anon key, and service role key
- Telegram bot token and public bot username
- Resend API key
