<script setup lang="ts">
import type { PortfolioItem, Service } from '~/types'

interface MasterProfileMeta {
  bio: string | null
  city: string | null
  specializations: string[]
  contacts: Record<string, string>
  work_hours: Record<string, { start: number; end: number } | null>
  cover_url: string | null
  rating: number
  subscription_tier: string
}

interface MasterData {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  master_profiles: MasterProfileMeta[]
}

const props = defineProps<{ master: MasterData }>()

const { t } = useI18n()
const localePath = useLocalePath()

const masterProfile = computed(
  (): MasterProfileMeta | null => props.master.master_profiles?.[0] ?? null,
)

const specializations = computed(() => masterProfile.value?.specializations?.join(' · ') ?? '')

const todaySchedule = computed(() => {
  const wh = masterProfile.value?.work_hours as Record<
    string,
    { start: string | number; end: string | number; off?: boolean } | null
  > | undefined
  if (!wh) return null

  const fullDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const shortDay: Record<string, string> = {
    sunday: 'sun', monday: 'mon', tuesday: 'tue', wednesday: 'wed',
    thursday: 'thu', friday: 'fri', saturday: 'sat',
  }
  const day = wh[shortDay[fullDay] ?? ''] ?? wh[fullDay] ?? null

  if (!day || day.off === true) return { off: true }

  // Normalise: "09:00" → "09:00", 9 → "09:00"
  const fmt = (v: string | number) =>
    typeof v === 'string' ? v.slice(0, 5) : `${String(v).padStart(2, '0')}:00`

  return { off: false, start: fmt(day.start), end: fmt(day.end) }
})

const whatsappLink = computed(() => {
  const wa = masterProfile.value?.contacts?.whatsapp
  if (!wa) return null
  return `https://wa.me/${wa.replace(/\D/g, '')}`
})

const contactLinks = computed(() => {
  const contacts = masterProfile.value?.contacts ?? {}
  const icons: Record<string, string> = {
    instagram: 'i-heroicons-camera',
    telegram: 'i-heroicons-paper-airplane',
    phone: 'i-heroicons-phone',
    whatsapp: 'i-heroicons-chat-bubble-left',
    email: 'i-heroicons-envelope',
    vk: 'i-heroicons-globe-alt',
    website: 'i-heroicons-globe-alt',
  }
  const urls: Record<string, (v: string) => string> = {
    instagram: (v) => `https://instagram.com/${v.replace('@', '')}`,
    telegram: (v) => `https://t.me/${v.replace('@', '')}`,
    phone: (v) => `tel:${v}`,
    whatsapp: (v) => `https://wa.me/${v.replace(/\D/g, '')}`,
    email: (v) => `mailto:${v}`,
    vk: (v) => `https://vk.com/${v.replace('@', '')}`,
    website: (v) => (v.startsWith('http') ? v : `https://${v}`),
  }
  return Object.entries(contacts)
    .filter(([, v]) => Boolean(v))
    .map(([type, value]) => ({
      type,
      label: value,
      icon: icons[type] ?? 'i-heroicons-link',
      url: urls[type] ? urls[type](value) : value,
    }))
})

const tabItems = computed(() => [
  { label: t('pages.masterProfile.tabs.booking'), slot: 'booking' },
  { label: t('pages.masterProfile.tabs.services'), slot: 'services' },
  { label: t('pages.masterProfile.tabs.portfolio'), slot: 'portfolio' },
  { label: t('pages.masterProfile.tabs.about'), slot: 'about' },
])

const { data: services, pending: servicesPending } = useLazyFetch<Service[]>(
  `/api/masters/${props.master.username}/services`,
)

const { data: portfolio, pending: portfolioPending } = useLazyFetch<PortfolioItem[]>(
  `/api/masters/${props.master.username}/portfolio`,
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}
</script>

<template>
  <div class="flex flex-col pb-10">

    <!-- ── Cover + Avatar hero ── -->
    <div class="relative">
      <!-- Cover photo -->
      <div class="h-[200px] overflow-hidden">
        <img
          v-if="masterProfile?.cover_url"
          :src="masterProfile.cover_url"
          :alt="master.full_name"
          class="size-full object-cover"
        >
        <div
          v-else
          class="size-full bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 dark:from-rose-950/60 dark:via-pink-950/40 dark:to-rose-950/60"
        />
        <!-- Bottom fade -->
        <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-default/60 to-transparent" />
      </div>

      <!-- Avatar — centred, overlapping bottom of cover -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
        <div class="size-[88px] overflow-hidden rounded-full ring-4 ring-default shadow-lg bg-muted">
          <img
            v-if="master.avatar_url"
            :src="master.avatar_url"
            :alt="master.full_name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900 dark:to-pink-900"
          >
            <span class="font-serif text-3xl font-light text-rose-600 dark:text-rose-300">
              {{ master.full_name.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Identity — centred below cover ── -->
    <div class="flex flex-col items-center px-4 pt-14 pb-1">
      <h1 class="text-center font-serif text-2xl font-light text-highlighted leading-snug">
        {{ master.full_name }}
      </h1>

      <p v-if="specializations" class="mt-1 text-center text-sm text-muted px-4">
        {{ specializations }}
      </p>

      <!-- Schedule pill + Pro badge -->
      <div class="mt-3 flex items-center gap-2 flex-wrap justify-center">
        <div
          v-if="todaySchedule"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          :class="
            todaySchedule.off
              ? 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          "
        >
          <span
            class="size-1.5 rounded-full shrink-0"
            :class="todaySchedule.off ? 'bg-stone-400' : 'bg-emerald-500'"
          />
          <span v-if="todaySchedule.off">{{ $t('pages.masterProfile.dayOff') }}</span>
          <span v-else>{{ todaySchedule.start }} – {{ todaySchedule.end }}</span>
        </div>

        <UBadge
          v-if="masterProfile?.subscription_tier === 'pro'"
          color="primary"
          variant="subtle"
          size="xs"
        >
          Pro
        </UBadge>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="mt-5">
      <UTabs
        :items="tabItems"
        variant="underline"
        color="primary"
        class="w-full"
        :ui="{
          list: 'border-b border-default',
          trigger: 'flex-1 justify-center font-sans text-sm font-medium',
        }"
      >
        <!-- ── Запись ── -->
        <template #booking>
          <div class="px-4 py-5 space-y-3">
            <UButton
              size="lg"
              block
              :to="localePath(`/${master.username}/book`)"
            >
              <template #leading>
                <UIcon name="i-heroicons-calendar-days" class="size-5" />
              </template>
              {{ $t('pages.masterProfile.book') }}
            </UButton>

            <UButton
              color="neutral"
              variant="outline"
              size="md"
              block
              :to="localePath(`/${master.username}/cancel`)"
            >
              {{ $t('pages.masterProfile.cancelBooking') }}
            </UButton>

            <UButton
              v-if="whatsappLink"
              color="neutral"
              variant="ghost"
              size="md"
              block
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <template #leading>
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="size-4" />
              </template>
              {{ $t('pages.masterProfile.whatsapp') }}
            </UButton>
          </div>
        </template>

        <!-- ── Услуги ── -->
        <template #services>
          <div class="space-y-2.5 px-4 py-4">
            <template v-if="servicesPending">
              <USkeleton v-for="i in 3" :key="i" class="h-[72px] rounded-xl" />
            </template>
            <template v-else-if="services?.length">
              <div
                v-for="service in services"
                :key="service.id"
                class="flex items-start justify-between rounded-xl border border-default bg-elevated p-4"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-highlighted text-sm">{{ service.name }}</p>
                  <p v-if="service.description" class="mt-0.5 line-clamp-2 text-xs text-muted">
                    {{ service.description }}
                  </p>
                  <span class="mt-1.5 inline-flex items-center gap-1 text-xs text-muted">
                    <UIcon name="i-heroicons-clock" class="size-3.5 shrink-0" />
                    {{ service.duration_minutes }} {{ $t('pages.masterProfile.services.duration') }}
                  </span>
                </div>
                <span class="ml-3 shrink-0 font-semibold text-primary text-sm">
                  {{ formatPrice(service.price) }}
                </span>
              </div>
            </template>
            <UEmpty
              v-else
              :title="$t('pages.masterProfile.services.empty')"
              icon="i-heroicons-scissors"
            />
          </div>
        </template>

        <!-- ── Портфолио ── -->
        <template #portfolio>
          <div class="px-4 py-4">
            <PortfolioGrid :items="portfolio ?? []" :loading="portfolioPending" />
          </div>
        </template>

        <!-- ── О мне ── -->
        <template #about>
          <div class="space-y-5 px-4 py-4">
            <p v-if="masterProfile?.bio" class="text-sm leading-relaxed text-muted">
              {{ masterProfile.bio }}
            </p>
            <p v-else class="text-sm text-muted">
              {{ $t('pages.masterProfile.about.noBio') }}
            </p>

            <div v-if="masterProfile?.city" class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-heroicons-map-pin" class="size-4 shrink-0 text-primary" />
              {{ masterProfile.city }}
            </div>

            <div v-if="contactLinks.length" class="space-y-2">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                {{ $t('pages.masterProfile.about.contacts') }}
              </h3>
              <a
                v-for="contact in contactLinks"
                :key="contact.type"
                :href="contact.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2.5 rounded-xl border border-default bg-elevated px-4 py-3 text-sm text-highlighted hover:bg-accented transition-colors"
              >
                <UIcon :name="contact.icon" class="size-4 shrink-0 text-primary" />
                {{ contact.label }}
              </a>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>
