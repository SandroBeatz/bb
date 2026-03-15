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

**CRITICAL: Always use Nuxt UI components — never write raw HTML alternatives.**

#### Layout components (mandatory)
- **`UHeader`** — sticky top header with `#title`, `#left`, `#right`, `#body` (mobile) slots. Use `UNavigationMenu` in center slot for nav links.
- **`UMain`** — main content wrapper (auto-sized relative to `--ui-header-height`). Use in `default` layout.
- **`UFooter`** — footer with `#left`, `#right` slots. Use `UNavigationMenu` in center for links.
- **`UDashboardGroup`** — root wrapper for dashboard. Uses `fixed inset-0`. Must contain `UDashboardSidebar` + content.
- **`UDashboardSidebar`** — resizable/collapsible sidebar with `#header`, `#footer` slots. Always use `resizable collapsible` props.
- **`UDashboardPanel`** — main dashboard content area with `#header` slot for `UDashboardNavbar`.
- **`UDashboardNavbar`** — top navbar inside `UDashboardPanel`. Use `title` and `icon` props.

#### Layout files
- `app/layouts/default.vue` — public pages: `AppHeader` + `UMain` + `AppFooter` + `BottomNav`
- `app/layouts/dashboard.vue` — master workspace: `UDashboardGroup` + `UDashboardSidebar`

#### Dashboard pages pattern
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

#### Key components
- **`UNavigationMenu`** — use for all nav lists (horizontal in header, vertical in sidebar with `orientation="vertical"`)
- **`UButton`** — all buttons; use `variant`, `color`, `size` props instead of custom CSS classes
- **`USkeleton`** — loading states (not custom `animate-pulse` divs)
- **`UEmpty`** — empty states
- **`UUser`** — user display with avatar + name
- **`UDropdownMenu`** — contextual menus
- **`UCard`** — content cards
- **`UTable`** — data tables
- **`UModal`** / **`USlideover`** — overlays
- **`UForm`** + **`UFormField`** — forms with validation

Use the MCP server `mcp__nuxt-ui-remote__get-documentation-page` to look up component APIs when needed.

#### Calendar — FullCalendar (`@fullcalendar/vue3`)

**Never use `nuxt-calendar`, `@samk-dev/nuxt-vcalendar`, or `<VCalendar>` — use FullCalendar exclusively.**

FullCalendar uses browser-only APIs. Always wrap in a `.client.vue` component (see `app/components/Calendar/View.client.vue`) and use `<ClientOnly>` in pages.

Docs: https://fullcalendar.io/docs/vue

**Required packages:** `@fullcalendar/vue3`, `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`

**Plugin file** `app/plugins/fullcalendar.client.ts` must exist (enforces client-only loading).

**Usage pattern in pages:**
```vue
<ClientOnly>
  <CalendarView
    :events="calendarEvents"
    :locale="locale"
    @event-click="handleEventClick"
    @dates-set="handleDatesSet"
  />
  <template #fallback>
    <USkeleton class="h-full w-full rounded-lg" />
  </template>
</ClientOnly>
```

**Event schema** (pass to `events` prop):
```ts
{
  id: string,
  title: string,
  start: string,           // ISO string from DB
  end: string,
  backgroundColor: string, // status-based color
  borderColor: string,
  textColor: '#ffffff',
  extendedProps: { status, clientName, ... }
}
```

**`datesSet` callback** fires on initial render and every navigation — use it to fetch bookings for the visible range only:
```ts
function handleDatesSet(info: { startStr: string; endStr: string }) {
  fetchBookings({ from: info.startStr, to: info.endStr })
}
```

**`eventClick` → `USlideover` pattern** (never use built-in FullCalendar popups):
```ts
function handleEventClick(info: { event: { id: string } }) {
  selectedBooking.value = bookingMap.value.get(info.event.id)
  isSlideoverOpen.value = true
}
```

The `CalendarView.client.vue` wrapper component is in `app/components/Calendar/CalendarView.client.vue` and handles all FullCalendar imports and CSS overrides. Use it — do not import FullCalendar directly in page files.

**Important**: This project uses `pathPrefix: false` in nuxt.config.ts components config. Component names are based **only on the filename**, not the folder. Example: `Calendar/CalendarView.client.vue` → `<CalendarView>`, `Calendar/BookingPopover.vue` → `<BookingPopover>`. Always verify auto-import names in `.nuxt/components.d.ts`.

### Code quality

Biome v2 handles linting and formatting (`biome.json` at root). Vue file support is experimental (`html.experimentalFullSupportEnabled`). Run `bun run check` before committing.
