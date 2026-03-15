<script setup lang="ts">
import type { PortfolioItem, Service } from '~/types'

interface MasterProfileMeta {
  bio: string | null
  city: string | null
  specializations: string[]
  contacts: Record<string, string>
  work_hours: Record<string, unknown>
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

interface ReviewWithClient {
  id: string
  rating: number
  comment: string | null
  created_at: string
  client: { full_name: string; avatar_url: string | null } | null
}

const props = defineProps<{ master: MasterData }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const masterProfile = computed(
  (): MasterProfileMeta | null => props.master.master_profiles?.[0] ?? null,
)

const specializations = computed(() => masterProfile.value?.specializations?.join(', ') ?? '')

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
  { label: t('pages.masterProfile.tabs.services'), slot: 'services' },
  { label: t('pages.masterProfile.tabs.portfolio'), slot: 'portfolio' },
  { label: t('pages.masterProfile.tabs.reviews'), slot: 'reviews' },
  { label: t('pages.masterProfile.tabs.about'), slot: 'about' },
])

const { data: services, pending: servicesPending } = useLazyFetch<Service[]>(
  `/api/masters/${props.master.username}/services`,
)

const { data: portfolio, pending: portfolioPending } = useLazyFetch<PortfolioItem[]>(
  `/api/masters/${props.master.username}/portfolio`,
)

const { data: reviews, pending: reviewsPending } = useLazyFetch<ReviewWithClient[]>(
  `/api/masters/${props.master.username}/reviews`,
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}
</script>

<template>
  <div class="pb-24">
    <!-- ── Hero ── -->
    <div class="relative">
      <!-- Cover photo / gradient fallback -->
      <div
        class="h-[240px] overflow-hidden bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-950/40 dark:to-pink-950/40 md:h-[360px]"
      />

      <!-- Avatar overlapping cover bottom edge -->
      <div class="absolute bottom-0 left-4 translate-y-1/2 md:left-8">
        <div
          class="size-20 overflow-hidden rounded-full bg-gray-200 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-900 md:size-24"
        >
          <img
            v-if="master.avatar_url"
            :src="master.avatar_url"
            :alt="master.full_name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center font-serif text-3xl font-light text-gray-500 dark:text-gray-300"
          >
            {{ master.full_name.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Profile info ── -->
    <div class="px-4 pt-14 md:px-8 md:pt-16">
      <div class="flex items-start justify-between">
        <div class="min-w-0 flex-1">
          <h1 class="font-serif text-3xl font-light text-highlighted">
            {{ master.full_name }}
          </h1>
          <p
            v-if="specializations"
            class="mt-1 font-sans text-base text-muted"
          >
            {{ specializations }}
          </p>
        </div>

        <!-- Trust badges -->
        <div class="mt-1 flex shrink-0 gap-1.5">
          <UBadge
            v-if="masterProfile?.subscription_tier === 'pro'"
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ $t('pages.masterProfile.badges.pro') }}
          </UBadge>
        </div>
      </div>

      <!-- City + Rating -->
      <div class="mt-3 flex flex-wrap items-center gap-4">
        <span
          v-if="masterProfile?.city"
          class="flex items-center gap-1 text-sm text-muted"
        >
          <UIcon name="i-heroicons-map-pin" class="size-4 shrink-0" />
          {{ masterProfile.city }}
        </span>

        <span class="flex items-center gap-1 text-sm">
          <UIcon name="i-heroicons-star-solid" class="size-4 shrink-0 text-yellow-400" />
          <span class="font-medium">{{ masterProfile?.rating?.toFixed(1) ?? '–' }}</span>
          <span class="text-muted">
            ({{ reviews?.length ?? 0 }} {{ $t('pages.masterProfile.reviews.count') }})
          </span>
        </span>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="mt-6">
      <UTabs
        :items="tabItems"
        variant="underline"
        color="neutral"
        class="w-full"
      >
        <!-- Services tab -->
        <template #services>
          <div class="space-y-3 px-4 py-4 md:px-8">
            <template v-if="servicesPending">
              <USkeleton
                v-for="i in 3"
                :key="i"
                class="h-20 rounded-xl"
              />
            </template>
            <template v-else-if="services?.length">
              <div
                v-for="service in services"
                :key="service.id"
                class="flex items-start justify-between rounded-xl border border-default bg-elevated p-4"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-highlighted">
                    {{ service.name }}
                  </p>
                  <p
                    v-if="service.description"
                    class="mt-0.5 line-clamp-2 text-sm text-muted"
                  >
                    {{ service.description }}
                  </p>
                  <span class="mt-1 flex items-center gap-1 text-sm text-muted">
                    <UIcon name="i-heroicons-clock" class="size-4 shrink-0" />
                    {{ service.duration_minutes }}
                    {{ $t('pages.masterProfile.services.duration') }}
                  </span>
                </div>
                <div class="ml-4 shrink-0">
                  <span class="font-sans text-lg font-semibold text-primary">
                    {{ formatPrice(service.price) }}
                  </span>
                </div>
              </div>
            </template>
            <UEmpty
              v-else
              :title="$t('pages.masterProfile.services.empty')"
              icon="i-heroicons-scissors"
            />
          </div>
        </template>

        <!-- Portfolio tab -->
        <template #portfolio>
          <div class="px-4 py-4 md:px-8">
            <PortfolioGrid
              :items="portfolio ?? []"
              :loading="portfolioPending"
            />
          </div>
        </template>

        <!-- Reviews tab -->
        <template #reviews>
          <div class="space-y-4 px-4 py-4 md:px-8">
            <template v-if="reviewsPending">
              <USkeleton
                v-for="i in 3"
                :key="i"
                class="h-24 rounded-xl"
              />
            </template>
            <template v-else-if="reviews?.length">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="flex gap-3"
              >
                <UAvatar
                  :src="review.client?.avatar_url ?? undefined"
                  :alt="review.client?.full_name ?? ''"
                  size="sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-highlighted">
                      {{ review.client?.full_name ?? '–' }}
                    </span>
                    <div
                      class="flex items-center gap-0.5"
                      :aria-label="`${$t('pages.masterProfile.reviews.count')}: ${review.rating}/5`"
                      role="img"
                    >
                      <UIcon
                        v-for="i in 5"
                        :key="i"
                        name="i-heroicons-star-solid"
                        class="size-3"
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'"
                      />
                    </div>
                  </div>
                  <p
                    v-if="review.comment"
                    class="mt-1 text-sm text-muted"
                  >
                    {{ review.comment }}
                  </p>
                  <p class="mt-1 text-xs text-muted">
                    {{ formatDate(review.created_at) }}
                  </p>
                </div>
              </div>
            </template>
            <UEmpty
              v-else
              :title="$t('pages.masterProfile.reviews.empty')"
              icon="i-heroicons-chat-bubble-left-ellipsis"
            />
          </div>
        </template>

        <!-- About tab -->
        <template #about>
          <div class="space-y-6 px-4 py-4 md:px-8">
            <!-- Bio -->
            <div>
              <h3 class="mb-2 font-medium text-highlighted">
                {{ $t('pages.masterProfile.about.bio') }}
              </h3>
              <p
                v-if="masterProfile?.bio"
                class="text-sm leading-relaxed text-muted"
              >
                {{ masterProfile.bio }}
              </p>
              <p
                v-else
                class="text-sm text-muted"
              >
                {{ $t('pages.masterProfile.about.noBio') }}
              </p>
            </div>

            <!-- Contacts -->
            <div v-if="contactLinks.length">
              <h3 class="mb-2 font-medium text-highlighted">
                {{ $t('pages.masterProfile.about.contacts') }}
              </h3>
              <div class="space-y-2">
                <a
                  v-for="contact in contactLinks"
                  :key="contact.type"
                  :href="contact.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <UIcon
                    :name="contact.icon"
                    class="size-4 shrink-0"
                  />
                  {{ contact.label }}
                </a>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- ── Sticky CTA ── -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-default bg-default/95 px-4 pb-safe pt-3 shadow-lg backdrop-blur-sm"
    >
      <UButton
        size="lg"
        block
        :to="localePath(`/master/${master.username}/book`)"
      >
        {{ $t('pages.masterProfile.book') }}
      </UButton>
    </div>
  </div>
</template>
