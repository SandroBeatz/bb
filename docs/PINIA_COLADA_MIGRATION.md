# Pinia Colada — план внедрения

> **Цель:** заменить ручное управление `loading/error/data` в сторах и composables на декларативный data-fetching слой `@pinia/colada`. Мигрируем постепенно, по одному слою за раз, не ломая работающий код.

---

## Фаза 1 — Установка и настройка

**Что делаем:**
- Устанавливаем `@pinia/colada`
- Создаём Nuxt-плагин для регистрации `PiniaColada`
- Подключаем devtools (опционально)

**Шаги:**

```bash
bun add @pinia/colada
bun add -D @pinia/colada-devtools  # опционально
```

Создать `app/plugins/pinia-colada.ts`:

```ts
import { PiniaColada } from '@pinia/colada'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PiniaColada, {
    queryOptions: {
      staleTime: 30_000,   // 30 сек — данные считаются свежими
      gcTime: 300_000,     // 5 мин — хранить в кеше после размонтирования
    },
  })
})
```

> Плагин должен регистрироваться **после** Pinia — Nuxt делает это автоматически, т.к. Pinia идёт через `@pinia/nuxt`.

В `app/app.vue` добавить devtools (только dev):

```vue
<template>
  <UApp>
    <NuxtPage />
    <PiniaColadaDevtools v-if="$dev" />  <!-- или через isDev() -->
  </UApp>
</template>
```

---

## Фаза 2 — Мигрируем `useProfile`

**Почему первым:** самый простой файл, один запрос + одна мутация. Хорошая тренировка.

**Файл:** `app/composables/useProfile.ts`

**До:**
```ts
const profile = ref(null)
const pending = ref(false)

async function fetch() {
  pending.value = true
  try { profile.value = await $fetch('/api/me/profile') }
  finally { pending.value = false }
}

async function update(data) {
  const updated = await $fetch('/api/me/profile', { method: 'PATCH', body: data })
  profile.value = updated
}
```

**После:**
```ts
import { defineQueryOptions, useMutation, useQuery, useQueryCache } from '@pinia/colada'

export const profileQuery = defineQueryOptions({
  key: ['me', 'profile'],
  query: () => $fetch('/api/me/profile'),
})

export function useProfile() {
  const { isSignedIn } = useAuth()
  const queryCache = useQueryCache()

  const { data: profile, asyncStatus } = useQuery({
    ...profileQuery,
    enabled: () => !!isSignedIn.value,
  })

  const { mutateAsync: update } = useMutation({
    mutation: (data: ProfileUpdate) => $fetch('/api/me/profile', { method: 'PATCH', body: data }),
    onSuccess: (updated) => {
      queryCache.setQueryData(profileQuery.key, updated)
    },
  })

  return {
    profile: readonly(profile),
    pending: computed(() => asyncStatus.value === 'loading'),
    fetch: () => queryCache.refresh(queryCache.ensure(profileQuery)),
    update,
  }
}
```

**Что даём:** автоматическая дедупликация запросов при нескольких вызовах `useProfile()` на одной странице, кеш между маршрутами.

---

## Фаза 3 — `analytics.vue`: `useLazyFetch` → `useQuery`

**Почему:** `analytics.vue` уже напрямую использует `useLazyFetch` с реактивным параметром `period`. Это идеальный кандидат — минимальные изменения, максимальный выигрыш (автоматическая инвалидация при смене периода).

**Файл:** `app/pages/dashboard/analytics.vue`

**До:**
```ts
const { data, pending } = useLazyFetch('/api/master/analytics', {
  query: { period },
  watch: [period],
})
```

**После:**
```ts
import { useQuery } from '@pinia/colada'

const { data, asyncStatus } = useQuery({
  key: () => ['master', 'analytics', period.value],
  query: () => $fetch('/api/master/analytics', { query: { period: period.value } }),
})

const pending = computed(() => asyncStatus.value === 'loading')
```

**Что получаем:** при переключении между периодами данные из кеша отдаются мгновенно (если уже грузились), фоновый рефетч делается автоматически.

---

## Фаза 4 — Мигрируем `useDashboardCache`: запросы на чтение

**Что делаем:** заменяем `fetchServices()`, `fetchClients()`, `fetchAnalytics()` внутри стора на `defineQueryOptions`. Сам стор пока оставляем — просто меняем внутреннюю реализацию.

**Файл:** `app/stores/dashboardCache.ts`

**Создаём `app/composables/queries/dashboard.ts`** — файл с переиспользуемыми определениями:

```ts
import { defineQueryOptions } from '@pinia/colada'
import type { BookingWithDetails, ClientItem, DashboardAnalytics, ProfileData } from '~/stores/dashboardCache'
import type { Database } from '~/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

export const bookingsQuery = defineQueryOptions({
  key: ['master', 'bookings'],
  query: () => $fetch<BookingWithDetails[]>('/api/master/bookings'),
  staleTime: 0,  // бронирования всегда обновляем при фокусе
})

export const analyticsQuery = defineQueryOptions({
  key: ['master', 'analytics'],
  query: () => $fetch<DashboardAnalytics>('/api/master/analytics'),
})

export const servicesQuery = defineQueryOptions({
  key: ['master', 'services'],
  query: () => $fetch<Service[]>('/api/master/services'),
  staleTime: 60_000,  // услуги меняются редко
})

export const clientsQuery = defineQueryOptions({
  key: ['master', 'clients'],
  query: () => $fetch<ClientItem[]>('/api/master/clients'),
})

export const masterProfileQuery = defineQueryOptions({
  key: ['master', 'profile'],
  query: () => $fetch<ProfileData>('/api/master/profile'),
})
```

**Обновляем страницы** — например `clients.vue`:

```ts
// было:
const cache = useDashboardCache()
const { clients, clientsLoading: loading } = storeToRefs(cache)
onMounted(() => cache.fetchClients())

// стало:
import { useQuery } from '@pinia/colada'
import { clientsQuery } from '~/composables/queries/dashboard'

const { data: clients, asyncStatus } = useQuery(clientsQuery)
const loading = computed(() => asyncStatus.value === 'loading')
```

Мигрируем страницы по одной: `services.vue` → `clients.vue` → `dashboard/index.vue`.

---

## Фаза 5 — Мутации: `useQuickCheckout` и отмена бронирований

**Что делаем:** заменяем `submitCheckout` и `cancelBooking` на `useMutation` с инвалидацией кеша.

**`useQuickCheckout`** (`app/composables/useQuickCheckout.ts`):

```ts
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { paymentTypesQuery } from '~/composables/queries/dashboard'

export const useQuickCheckout = defineStore('quickCheckout', () => {
  const isOpen = ref(false)
  const booking = ref<Booking | null>(null)
  const queryCache = useQueryCache()

  // useQuery вместо ручного fetchPaymentTypes
  const { data: paymentTypes } = useQuery(paymentTypesQuery)

  const { mutateAsync: submitCheckout, status: checkoutStatus } = useMutation({
    mutation: ({ bookingId, amount, paymentTypeId, note }: CheckoutPayload) =>
      $fetch(`/api/master/bookings/${bookingId}/checkout`, {
        method: 'POST',
        body: { payment_type_id: paymentTypeId, amount, note: note ?? null },
      }),
    onSuccess: () => {
      close()
      // инвалидируем связанные данные
      queryCache.invalidateQueries({ key: ['master', 'bookings'] })
      queryCache.invalidateQueries({ key: ['master', 'analytics'] })
    },
  })

  const loading = computed(() => checkoutStatus.value === 'pending')

  // ... openCheckout, close остаются без изменений

  return { isOpen, booking, paymentTypes, loading, openCheckout, close, submitCheckout }
})
```

**Отмена бронирования** (там, где вызывается `$fetch` напрямую в компонентах):

```ts
const { mutate: cancelBooking, asyncStatus } = useMutation({
  mutation: ({ id, reason }: { id: string; reason: string }) =>
    $fetch(`/api/master/bookings/${id}/cancel`, { method: 'POST', body: { reason } }),
  onSettled: () => {
    queryCache.invalidateQueries({ key: ['master', 'bookings'] })
  },
})
```

---

## Фаза 6 — Удаление `useDashboardCache`

**Когда:** после того как все страницы дашборда перешли на `useQuery` из фазы 4.

**Что делаем:**
1. Убеждаемся, что `useDashboardCache` больше нигде не импортируется (`grep -r "useDashboardCache"`)
2. Удаляем `app/stores/dashboardCache.ts`
3. Типы `BookingWithDetails`, `ClientItem`, `DashboardAnalytics`, `ProfileData` переносим в `app/types/index.ts`

**Что получаем:** устраняем ~100 строк boilerplate (`loading`, `ready`, `fetch*` флаги), кеш теперь управляется автоматически на уровне всего приложения.

---

## Фаза 7 — `useBookingStore`: публичный флоу бронирования

**Файл:** `app/stores/booking.ts`

**`fetchSlots`** — реактивный запрос зависящий от даты и услуги — идеальный `useQuery` с динамическим ключом:

```ts
// app/composables/queries/booking.ts
export const slotsQuery = (masterId: Ref<string>, date: Ref<Date | null>, serviceId: Ref<string | undefined>) =>
  defineQueryOptions(() => ({
    key: () => ['slots', masterId.value, date.value?.toISOString().slice(0, 10), serviceId.value],
    query: () => {
      const dateStr = date.value!.toISOString().slice(0, 10)
      return $fetch<TimeSlot[]>(`/api/masters/${masterId.value}/slots`, {
        query: { date: dateStr, ...(serviceId.value && { service_id: serviceId.value }) },
      })
    },
    enabled: () => !!date.value && !!masterId.value,
    staleTime: 60_000,
  }))
```

**`createBooking`** → `useMutation`:

```ts
const { mutateAsync: createBooking, asyncStatus } = useMutation({
  mutation: (payload: BookingPayload) =>
    $fetch(`/api/masters/${payload.masterId}/book`, {
      method: 'POST',
      body: { ... },
    }),
})
```

Стейт бронирования (`currentStep`, `selectedDate`, `selectedService`, `selectedSlot`) — оставляем в Pinia сторе, т.к. это UI-стейт, не серверные данные.

---

## Фаза 8 — Продвинутые паттерны (по желанию)

### Глобальная обработка ошибок

В `app/plugins/pinia-colada.ts`:

```ts
import { PiniaColada, PiniaColadaQueryHooksPlugin } from '@pinia/colada'

app.use(PiniaColada, {
  plugins: [
    PiniaColadaQueryHooksPlugin({
      onError(error) {
        const toast = useToast()
        toast.add({ title: 'Ошибка загрузки', description: error.message, color: 'error' })
      },
    }),
  ],
  mutationOptions: {
    onError(error) {
      const toast = useToast()
      toast.add({ title: 'Ошибка', description: error.message, color: 'error' })
    },
  },
})
```

### Автоматический retry

```bash
bun add @pinia/colada-plugin-retry
```

```ts
import { PiniaColadaRetryPlugin } from '@pinia/colada-plugin-retry'

app.use(PiniaColada, {
  plugins: [PiniaColadaRetryPlugin({ retry: 2 })],
})
```

### Prefetch при навигации

В роутере или `definePageMeta` middleware:

```ts
// middleware/prefetch-dashboard.ts
export default defineNuxtRouteMiddleware(async () => {
  const queryCache = useQueryCache()
  // Предзагружаем данные до рендера страницы
  await queryCache.refresh(queryCache.ensure(servicesQuery))
})
```

---

## Итоговый порядок выполнения

| # | Фаза | Файлы | Приоритет |
|---|------|-------|-----------|
| 1 | Установка и плагин | `plugins/pinia-colada.ts` | Обязательно |
| 2 | `useProfile` | `composables/useProfile.ts` | Высокий |
| 3 | Analytics page | `pages/dashboard/analytics.vue` | Высокий |
| 4 | Query definitions + страницы дашборда | `composables/queries/dashboard.ts` + 4 страницы | Высокий |
| 5 | Мутации (checkout, cancel) | `composables/useQuickCheckout.ts` + компоненты | Средний |
| 6 | Удаление `useDashboardCache` | `stores/dashboardCache.ts` | Средний |
| 7 | Публичный флоу бронирования | `stores/booking.ts` | Низкий |
| 8 | Глобальные хуки, retry, prefetch | `plugins/pinia-colada.ts` | По желанию |

---

## Ключевые правила при миграции

- **Все dashboard запросы только client-side** — `enabled: () => import.meta.client && !!isSignedIn.value`. Clerk не форвардит сессию при SSR → 401 на перезагрузке. Выноси в wrapper-composable (`useMasterProfileQuery`, etc.)
- **`key` всегда массив** — `['master', 'bookings']`, не строка
- **Динамические параметры = геттер в ключе:** `key: () => ['slots', date.value]`
- **`asyncStatus === 'loading'`** вместо старого `loading.value`
- **`status === 'success'`** вместо `ready.value`
- **Инвалидация после мутаций** — всегда через `queryCache.invalidateQueries()`
- **`useQueryCache()`** только внутри `setup()` или Pinia стора — не на модульном уровне
- **Biome**: `asyncStatus` используется только в шаблоне — Biome может ложно ругаться на "unused variable", это false positive
