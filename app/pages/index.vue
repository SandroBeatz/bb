<template>
  <!-- Hero Section -->
  <section
    class="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white"
    style="background: linear-gradient(135deg, #3C0F21 0%, #782A46 40%, #C85C82 100%)"
  >
    <!-- Depth overlay -->
    <div class="absolute inset-0 bg-black/20" />

    <!-- Content -->
    <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
      <h1 class="font-serif text-5xl font-light tracking-tight text-white mb-5">
        {{ t('pages.home.hero.title') }}
      </h1>
      <p class="font-sans text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
        {{ t('pages.home.hero.subtitle') }}
      </p>
      <UButton
        color="primary"
        size="lg"
        @click="navigateTo(localePath('/catalog'))"
      >
        {{ t('pages.home.hero.cta') }}
      </UButton>
    </div>
  </section>

  <!-- How It Works Section -->
  <section class="py-16 px-6">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-serif text-3xl font-light text-center mb-12">
        {{ t('pages.home.howItWorks.title') }}
      </h2>
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Step 1 -->
        <div class="flex-1 flex flex-col items-center text-center px-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
            <UIcon name="i-heroicons-magnifying-glass" class="text-3xl text-primary" />
          </div>
          <h3 class="font-semibold text-base mb-2">
            {{ t('pages.home.howItWorks.step1.title') }}
          </h3>
          <p class="text-muted text-sm leading-relaxed">
            {{ t('pages.home.howItWorks.step1.description') }}
          </p>
        </div>

        <!-- Arrow (desktop only) -->
        <div class="hidden md:flex items-center justify-center text-muted pt-4">
          <UIcon name="i-heroicons-arrow-right" class="text-2xl" />
        </div>

        <!-- Step 2 -->
        <div class="flex-1 flex flex-col items-center text-center px-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
            <UIcon name="i-heroicons-calendar-days" class="text-3xl text-primary" />
          </div>
          <h3 class="font-semibold text-base mb-2">
            {{ t('pages.home.howItWorks.step2.title') }}
          </h3>
          <p class="text-muted text-sm leading-relaxed">
            {{ t('pages.home.howItWorks.step2.description') }}
          </p>
        </div>

        <!-- Arrow (desktop only) -->
        <div class="hidden md:flex items-center justify-center text-muted pt-4">
          <UIcon name="i-heroicons-arrow-right" class="text-2xl" />
        </div>

        <!-- Step 3 -->
        <div class="flex-1 flex flex-col items-center text-center px-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
            <UIcon name="i-heroicons-check-circle" class="text-3xl text-primary" />
          </div>
          <h3 class="font-semibold text-base mb-2">
            {{ t('pages.home.howItWorks.step3.title') }}
          </h3>
          <p class="text-muted text-sm leading-relaxed">
            {{ t('pages.home.howItWorks.step3.description') }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Top Masters Section -->
  <section class="py-16 px-6 bg-elevated">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-end justify-between mb-8 gap-4">
        <div>
          <h2 class="font-serif text-3xl font-light">
            {{ t('pages.home.topMasters.title') }}
          </h2>
          <p class="text-muted mt-1 text-sm">
            {{ t('pages.home.topMasters.subtitle') }}
          </p>
        </div>
        <UButton
          variant="ghost"
          color="primary"
          trailing-icon="i-heroicons-arrow-right"
          @click="navigateTo(localePath('/catalog'))"
        >
          {{ t('pages.home.topMasters.viewAll') }}
        </UButton>
      </div>

      <!-- Loading skeleton -->
      <template v-if="mastersPending">
        <div class="flex gap-4 overflow-x-auto pb-2">
          <USkeleton
            v-for="i in DISPLAY_LIMIT"
            :key="i"
            class="w-44 flex-shrink-0 aspect-[4/5] rounded-2xl"
          />
        </div>
      </template>

      <!-- Masters: horizontal scroll on mobile, 4-column grid on desktop -->
      <div
        v-else-if="topMasters?.length"
        class="overflow-x-auto snap-x snap-mandatory -mx-6 px-6 md:overflow-visible md:snap-none md:mx-0 md:px-0"
      >
        <div class="flex gap-4 md:grid md:grid-cols-4">
          <div
            v-for="master in topMasters"
            :key="master.id"
            class="w-44 flex-shrink-0 snap-start md:w-auto md:flex-shrink-0"
          >
            <MasterCard
              :master="{
                username: master.username ?? '',
                name: master.full_name ?? '',
                avatar: master.avatar_url,
                specialty: master.master_profiles?.[0]?.specializations?.[0] ?? null,
                rating: master.master_profiles?.[0]?.rating ?? null,
                city: master.master_profiles?.[0]?.city ?? null,
              }"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-else
        icon="i-heroicons-user-group"
        :title="t('pages.catalog.empty')"
      />
    </div>
  </section>

  <!-- For Masters Section -->
  <section class="py-16 px-6 bg-muted">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="font-serif text-3xl font-light mb-4">
        {{ t('pages.home.forMasters.title') }}
      </h2>
      <p class="text-lg text-muted mb-10 leading-relaxed">
        {{ t('pages.home.forMasters.subtitle') }}
      </p>

      <!-- Benefits -->
      <div class="flex flex-col md:flex-row justify-center gap-8 mb-10">
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-heroicons-clock" class="text-4xl text-primary" />
          <p class="font-medium text-sm">
            {{ t('pages.home.forMasters.benefit1') }}
          </p>
        </div>
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-heroicons-calendar" class="text-4xl text-primary" />
          <p class="font-medium text-sm">
            {{ t('pages.home.forMasters.benefit2') }}
          </p>
        </div>
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-heroicons-chart-bar" class="text-4xl text-primary" />
          <p class="font-medium text-sm">
            {{ t('pages.home.forMasters.benefit3') }}
          </p>
        </div>
      </div>

      <UButton
        color="primary"
        size="lg"
        @click="handleMasterCta"
      >
        {{ t('pages.home.forMasters.cta') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TopMasterItem {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  master_profiles:
    | {
        city: string | null
        specializations: string[]
        rating: number | null
        subscription_tier: string | null
      }[]
    | null
}

const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const DISPLAY_LIMIT = 8

useSeoMeta({
  title: computed(() => t('pages.home.title')),
  description: computed(() => t('pages.home.subtitle')),
  ogTitle: computed(() => t('pages.home.title')),
  ogDescription: computed(() => t('pages.home.subtitle')),
  ogType: 'website',
})

const { data: topMasters, pending: mastersPending } = await useAsyncData('top-masters', () =>
  $fetch<TopMasterItem[]>('/api/masters/top', { query: { limit: DISPLAY_LIMIT } }),
)

function handleMasterCta() {
  navigateTo(localePath(isSignedIn.value ? '/dashboard' : '/sign-up'))
}
</script>

