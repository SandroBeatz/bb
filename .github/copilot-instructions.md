# BeautyBook Copilot Instructions

## Commands

```bash
bun dev             # Start dev server
bun run build       # Production build
bun run preview     # Preview production build
bun run generate    # Static site generation
bun run check       # Biome lint + format + autofix (run before committing)
bun run lint        # Biome lint + autofix only
bun run format      # Biome format + autofix only
```

There are no test scripts.

## High-level architecture

BeautyBook is a **Nuxt 4** full-stack marketplace for beauty professionals with three delivery surfaces sharing the same data model: web app, Telegram Mini App (TMA), and a Grammy Telegram bot.

### Directory layout (Nuxt 4 `srcDir: 'app'`)

```
app/                  ← srcDir
  pages/              ← file-based routing
  components/         ← UI components (no path prefix — import directly by name)
  composables/        ← $fetch wrappers with loading/error state
  stores/             ← Pinia stores for cross-page state
  middleware/         ← route guards
  layouts/            ← default.vue (public), dashboard.vue (master workspace)
  locales/            ← ru.json, ky.json (i18n)
  types/              ← database.types.ts (authoritative schema)
  assets/css/main.css ← Tailwind v4 + Nuxt UI imports via @theme
server/               ← Nitro API routes (stays at root, not inside app/)
bot/                  ← Grammy bot
supabase/migrations/
```

### Routing

- `/` — landing
- `/dashboard/*` — master workspace (calendar, services, portfolio, analytics)
- `/master/[username]` and `/master/[username]/book` — public profile + booking
- `/client/bookings` — client appointment history
- `/tma/*` — Telegram Mini App variants
- `/admin` — admin dashboard
- `/onboarding` — role selection after sign-up

Route protection is in `app/middleware/`, not in page components:
- `auth.ts` — requires sign-in; redirects unsigned users to `/sign-in`; also checks for a role and redirects roleless users to `/onboarding`
- `master-only.ts` — additionally checks `profiles.role === 'master'` in Supabase

### Authentication & data

- **Clerk** handles identity. `useAuth()` provides `userId` and `isSignedIn`.
- **Supabase** stores all application data. `app/types/database.types.ts` is the authoritative schema.
- Key tables: `profiles` (role: master/client/admin), `master_profiles`, `services`, `bookings`, `payment_types`, `payment_records`, `portfolio_items`, `reviews`.
- In server routes use `useServerSupabase()` (service-role key). In browser code use `useSupabaseClient()`. Never mix the two.

### API routes (Nitro under `server/api/`)

- `masters/` — public: list, profile, available slots, booking
- `master/` — authenticated master-only: services CRUD, bookings, analytics, checkout, payment-types
- `me/` — current user profile & client bookings
- `telegram/validate` — validates TMA init data
- `webhooks/clerk` — Clerk webhook handler (uses svix)

### State & composables

- **Composables** (`app/composables/`): wrap `$fetch` calls, own `loading`/`error` reactive state — `useBooking`, `useMaster`, `useQuickCheckout`, `useTelegramApp`
- **Pinia stores** (`app/stores/`): cross-page state — `useBookingStore` (selected date/service, available slots), `useMasterStore` (loaded profile, services, bookings)

### Telegram

- `app/composables/useTelegramApp.ts` + `@tma.js/sdk` detect TMA context
- `server/utils/telegram.ts` validates init data server-side
- `bot/` wires Grammy commands and webhook handler

### i18n

`@nuxtjs/i18n` with `prefix_except_default` strategy: Russian (`ru`) is the default with no URL prefix; Kyrgyz (`ky`) uses `/ky/` prefix. Locale files live in `app/locales/`. Always use `useLocalePath()` for programmatic navigation (e.g. `navigateTo(localePath('/sign-in'))`), not bare string paths.

## Key conventions

### Server route pattern

```ts
export default defineEventHandler(async (event) => {
  const { userId } = useAuth()            // Clerk
  if (!userId.value) throw createError({ statusCode: 401 })

  const supabase = useServerSupabase()    // service role
  const { data, error } = await supabase
    .from('table')
    .select(...)
    .eq('master_id', userId.value)
    .single()
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

Extract params with `getRouterParam`, queries with `getQuery`, bodies with `readBody`. Fail with `createError`.

### Supabase query style

Use fluent filters (`.eq`, `.lt`, `.gt`, `.in`, `.order`). Call `.single()` for exactly-one-row queries. Throw `createError` immediately on Supabase errors. Booking conflict detection uses overlapping time-range checks (`server/api/masters/[id]/book.post.ts`); slot generation is in `server/utils/slots.ts`.

### Frontend forms & validation

Zod schemas + `vee-validate` + `@vee-validate/zod`:

```ts
const schema = z.object({ name: z.string().min(1) })
const { handleSubmit } = useForm({ validationSchema: toTypedSchema(schema) })
```

Use `UForm` + `UFormField` — never build raw form markup.

### Database-backed feature checklist

When adding or changing database features, update all of:
1. `supabase/migrations/` — new migration file
2. `app/types/database.types.ts` — type definitions
3. Affected Nitro routes, composables, and stores

### Dates

Slot lookup uses `YYYY-MM-DD` query strings. Persisted booking times use ISO 8601 timestamps.

### Environment variables

Follow the `NUXT_*` / `NUXT_PUBLIC_*` split. Copy `.env.example` to `.env`:
- `NUXT_CLERK_SECRET_KEY` / `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY` / `NUXT_SUPABASE_SERVICE_ROLE_KEY`
- `NUXT_TELEGRAM_BOT_TOKEN` / `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- `NUXT_RESEND_API_KEY`

## UI components (Nuxt UI + Tailwind v4)

**Always use Nuxt UI components — never write raw HTML alternatives.**

Tailwind is configured CSS-first via `@theme` in `app/assets/css/main.css`. Do not use `tailwind.config.js`.

### Layout components

| Component | Use |
|-----------|-----|
| `UHeader` | Sticky header. Slots: `#title`, `#left`, `#right`, `#body` (mobile) |
| `UMain` | Main content wrapper for `default` layout |
| `UFooter` | Footer. Slots: `#left`, `#right` |
| `UDashboardGroup` | Root wrapper for dashboard (`fixed inset-0`). Must contain `UDashboardSidebar` + content |
| `UDashboardSidebar` | Always use `resizable collapsible` props. Slots: `#header`, `#footer` |
| `UDashboardPanel` | Main dashboard content. Slot: `#header` for `UDashboardNavbar` |
| `UDashboardNavbar` | Top navbar inside panel. Props: `title`, `icon` |

### Dashboard page template

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

### Component preferences

- `UNavigationMenu` — all nav lists (horizontal in header; `orientation="vertical"` in sidebar)
- `UButton` — all buttons; use `variant`/`color`/`size` props, not custom CSS classes
- `USkeleton` — loading states (not `animate-pulse` divs)
- `UEmpty` — empty states
- `UUser` — user avatar + name display
- `UDropdownMenu` — contextual menus
- `UCard` — content cards
- `UTable` — data tables
- `UModal` / `USlideover` — overlays
- `UForm` + `UFormField` — all forms

Use the MCP server `mcp__nuxt-ui-remote__get-documentation-page` to look up component APIs.

### Calendar — `nuxt-calendar`

**Always use `<NuxtCalendar>` — never use `@samk-dev/nuxt-vcalendar` or `<VCalendar>`.**

Docs: https://nuxtcalendar.com/docs/getting-started/installation

```vue
<template>
  <div class="h-full">
    <NuxtCalendar :events="events" />
  </div>
</template>

<script setup lang="ts">
const events = ref([
  {
    id: 1,
    title: 'Appointment',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    description: 'Client booking',
  },
])
</script>
```

Event shape: `{ id, title, start: Date, end: Date, description?: string }`.
Config in `nuxt.config.ts` under `nuxtCalendar: { timeFormat: '24h', weekStartsOn: 1 }`.

### Code quality

Biome v2 (`biome.json` at root) handles linting and formatting with experimental Vue support (`html.experimentalFullSupportEnabled`). Run `bun run check` before committing.
