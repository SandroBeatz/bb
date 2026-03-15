# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev             # Start dev server
bun run build       # Production build
bun run preview     # Preview production build
bun run generate    # Static site generation
bun run check       # Biome lint + format + autofix (use this before committing)
bun run lint        # Biome lint only
bun run format      # Biome format only
```

## Environment

Copy `.env.example` to `.env` and fill in:
- `NUXT_CLERK_SECRET_KEY` / `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY` / `NUXT_SUPABASE_SERVICE_ROLE_KEY`
- `NUXT_TELEGRAM_BOT_TOKEN` / `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- `NUXT_RESEND_API_KEY`

## Architecture

**BeautyBook** — Nuxt 4 full-stack marketplace for beauty professionals. Three access modes: web, Telegram Mini App (TMA), and a Telegram bot.

### Directory structure

```
app/                  ← srcDir (Nuxt 4)
  assets/css/main.css ← Tailwind v4 + Nuxt UI v3 theme
  components/         ← Auto-imported, pathPrefix: false (see below)
  composables/        ← Auto-imported
  layouts/
    default.vue       ← Public pages: AppHeader + UMain + AppFooter + BottomNav
    dashboard.vue     ← Master workspace: UDashboardGroup + UDashboardSidebar
  middleware/
    auth.ts           ← Requires any authenticated Clerk user
    master-only.ts    ← Requires role === 'master' in Supabase profiles
    client-only.ts
  pages/
  plugins/
    fullcalendar.client.ts  ← Ensures FullCalendar never loads server-side
  stores/
  types/
    index.ts          ← App-level types (Booking, BookingStatus, etc.)
    database.types.ts ← Supabase schema — authoritative source of truth
server/               ← Nitro API routes
  api/
    masters/          ← Public endpoints (no auth)
    master/           ← Authenticated master-only endpoints
    me/               ← Current user profile & client bookings
    telegram/         ← TMA init data validation
  utils/
    auth.ts           ← requireAuth(event): string — throws 401
    requireMaster.ts  ← requireMaster(event): Profile — throws 401/403
    supabase.ts       ← useServerSupabase() — service role client
    slots.ts          ← generateSlots() — time slot calculation
bot/                  ← Grammy Telegram bot
supabase/migrations/  ← SQL migrations (apply manually via Supabase dashboard)
```

### Routing

- `/` — landing page
- `/dashboard/*` — master workspace (middleware: `auth`, layout: `dashboard`)
- `/master/[username]` — public master profile; `/master/[username]/book` — booking flow
- `/client/bookings` — client's appointment history
- `/tma/*` — Telegram Mini App pages
- `/admin` — admin dashboard

### Data layer

- **Supabase** is the database. `app/types/database.types.ts` is the authoritative schema.
- Key tables: `profiles` (role: master/client/admin), `master_profiles`, `services`, `bookings`, `payment_types`, `payment_records`, `portfolio_items`, `reviews`.
- Server API routes: use `useServerSupabase()` (service role). Browser code: use `useSupabaseClient()`.
- **Clerk** handles authentication. Clerk user ID maps 1:1 to `profiles.id`.
- All server routes requiring auth call `requireAuth(event)` or `requireMaster(event)` from `server/utils/`.

### State management

**Pinia stores** (`app/stores/`):
- `useDashboardCache` — central cache for the master dashboard. Holds bookings, analytics, services, clients, profile. Each resource has `fetch*()`, `*Loading`, `*Ready` flags. Dashboard pages call `cache.fetch*()` in `onMounted` and read from `storeToRefs(cache)`.
- `useBookingStore` — public booking flow state
- `useMasterStore` — public master profile state
- `useQuickCheckout` — Pinia store (not a composable) managing the checkout slideover for completing sessions

**Composables** (`app/composables/`):
- `useCalendarSettings` — `useCookie`-backed calendar preferences (defaultView, slotDuration). SSR-safe, persisted 1 year.
- `useBooking`, `useMaster` — wrap store actions with loading states
- `useTelegramApp` — detects TMA context via `@tma.js/sdk`, client-only (`onMounted`)
- `useProfile` — fetches and caches the current user's profile on sign-in (called in `app.vue`)

### Component auto-import — critical rule

`nuxt.config.ts` sets `components: [{ path: '~/components', pathPrefix: false }]`. This means **component names come from the filename only, not the folder path**:

```
components/Calendar/CalendarView.client.vue  →  <CalendarView>   ✓
components/Calendar/BookingPopover.vue       →  <BookingPopover> ✓
components/checkout/QuickCheckoutModal.vue   →  <QuickCheckoutModal> ✓
```

Always verify auto-import names in `.nuxt/components.d.ts`. After adding/renaming components, run `bun run postinstall` to regenerate.

### API routes pattern

Every master-only endpoint follows this pattern:

```ts
export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)  // auth + role check
  const supabase = useServerSupabase()
  // ... query
})
```

Public master endpoints use `requireAuth(event)` only. The `GET /api/master/bookings` accepts `?from=&to=&status=` query params for filtered fetching.

### Forms & validation

Zod schemas with `vee-validate` + `@vee-validate/zod`. Define with `z.object(...)`, pass to `useForm({ validationSchema })`. Use `<UForm :schema :state @submit>` with `<UFormField name>` children.

### i18n

Two locales: `ru` (default, no URL prefix) and `ky` (`/ky/` prefix). Locale files: `app/locales/ru.json`, `app/locales/ky.json`. Always add keys to **both** files. Access with `useI18n()` → `t('key')`.

### Telegram integration

- `bot/` — Grammy bot, `console.log` allowed (Biome override)
- `app/composables/useTelegramApp.ts` — detects TMA, client-only
- TMA pages under `app/pages/tma/`

---

## UI

`@nuxt/ui` v3 with Tailwind CSS v4. Styles configured via `@theme` in `app/assets/css/main.css`. All pages wrapped in `<UApp>` in `app/app.vue`.

**CRITICAL: Always use Nuxt UI components — never write raw HTML alternatives.**

### Layout components

- **`UDashboardGroup`** — root wrapper for dashboard (`fixed inset-0`). Contains `UDashboardSidebar` + content.
- **`UDashboardSidebar`** — always use `resizable collapsible` props.
- **`UDashboardPanel`** — main content area with `#header` slot for `UDashboardNavbar`.
- **`UDashboardNavbar`** — top bar inside panel; use `title`, `icon`, `#right` slot.
- **`UHeader`** / **`UMain`** / **`UFooter`** — for `default` layout pages.

### Dashboard page pattern

```vue
<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Page Title" icon="i-heroicons-..." />
    </template>
    <div class="p-6"><!-- content --></div>
  </UDashboardPanel>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
```

### Key components

- **`UButton`** — all buttons; use `variant`, `color`, `size` props
- **`USkeleton`** — loading states
- **`UEmpty`** — empty states
- **`UUser`** — user display with avatar + name
- **`UNavigationMenu`** — nav lists (horizontal in header, `orientation="vertical"` in sidebar)
- **`USlideover`** / **`UModal`** — overlays
- **`UForm`** + **`UFormField`** — forms with Zod validation
- **`UCard`**, **`UTable`**, **`UDropdownMenu`**, **`UBadge`**, **`UToggle`**

Use `mcp__nuxt-ui-remote__get-documentation-page` to look up component APIs when needed.

### Calendar — FullCalendar (`@fullcalendar/vue3`)

**Never use `nuxt-calendar`, `@samk-dev/nuxt-vcalendar`, or `<VCalendar>`.**

FullCalendar uses browser-only APIs. The wrapper component `app/components/Calendar/CalendarView.client.vue` handles all FullCalendar imports, plugin registration, CSS overrides, slot hover logic, and settings binding. The `.client.vue` suffix prevents SSR rendering.

**Usage in pages:**
```vue
<ClientOnly>
  <CalendarView
    :events="calendarEvents"
    :locale="locale"
    @event-click="handleEventClick"
    @date-click="handleDateClick"
    @dates-set="handleDatesSet"
  />
  <template #fallback><USkeleton class="h-full w-full" /></template>
</ClientOnly>
```

**Event schema:**
```ts
{
  id: string,
  title: string,
  start: string,        // ISO string (from DB)
  end: string,
  backgroundColor: string,
  borderColor: string,
  textColor: '#ffffff',
  extendedProps: { status, clientName, ... }
}
```

**`datesSet` callback fires on initial render and every navigation** — use it to fetch bookings for the visible range only (`?from=&to=`).

**`eventClick` → `USlideover` pattern:**
```ts
function handleEventClick(info: { event: { id: string } }) {
  selectedBooking.value = bookingMap.value.get(info.event.id)
  isSlideoverOpen.value = true
}
```

Calendar preferences (default view, slot duration) are stored in a cookie via `useCalendarSettings()`. Do not hardcode these values in `CalendarView.client.vue`.

---

## Code quality

**Biome v2** handles linting and formatting. Config: `biome.json`. Key rules:
- `noUnusedVariables` / `noUnusedImports` — **error**
- `noExplicitAny` — error
- `noConsole` — warn (disabled for `server/**` and `bot/**`)
- Single quotes, 2-space indent, 100-char line width, trailing commas

**Known Biome limitation**: Vue `<script setup>` variables used only in the template are incorrectly flagged as unused (Biome's experimental Vue support doesn't track template references). These are false positives — the code is correct.

`console.log` is allowed in `server/` and `bot/` via Biome override. Avoid it in `app/`.
