<template>
  <!-- ── Hero ───────────────────────────────────────────────────────── -->
  <section
    class="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
    style="background: linear-gradient(145deg, #3C0F21 0%, #782A46 50%, #C85C82 100%)"
  >
    <!-- Soft radial glow -->
    <div
      class="absolute inset-0 opacity-30"
      style="background: radial-gradient(ellipse at 70% 40%, #EAAABF 0%, transparent 60%)"
    />

    <div class="relative z-10 text-center px-6 max-w-2xl mx-auto">
      <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
        <UIcon name="i-heroicons-sparkles" class="size-4 text-rose-200" />
        {{ t('pages.home.hero.badge') }}
      </div>

      <h1 class="font-serif text-5xl md:text-6xl font-light tracking-tight text-white mb-5 leading-tight">
        {{ t('pages.home.hero.title') }}
      </h1>
      <p class="font-sans text-lg text-white/75 mb-10 max-w-lg mx-auto leading-relaxed">
        {{ t('pages.home.hero.subtitle') }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton
          color="primary"
          size="xl"
          class="font-semibold"
          @click="navigateTo(localePath(isSignedIn ? '/dashboard' : '/sign-up'))"
        >
          {{ isSignedIn ? t('pages.home.hero.ctaDashboard') : t('pages.home.hero.cta') }}
        </UButton>
        <UButton
          variant="outline"
          size="xl"
          class="border-white/30 text-white hover:bg-white/10"
          :to="localePath('/master/demo')"
        >
          {{ t('pages.home.hero.demo') }}
        </UButton>
      </div>

      <!-- Social proof -->
      <p class="mt-8 text-xs text-white/40 uppercase tracking-widest">
        {{ t('pages.home.hero.free') }}
      </p>
    </div>
  </section>

  <!-- ── How It Works ──────────────────────────────────────────────── -->
  <section class="py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="font-serif text-3xl font-light mb-3">
          {{ t('pages.home.howItWorks.title') }}
        </h2>
        <p class="text-muted text-base max-w-md mx-auto">
          {{ t('pages.home.howItWorks.subtitle') }}
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="(step, i) in steps" :key="i" class="flex flex-col items-center text-center">
          <div
            class="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
            style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
          >
            <UIcon :name="step.icon" class="size-7 text-primary" />
          </div>
          <div class="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
            {{ t('pages.home.howItWorks.stepLabel', { n: i + 1 }) }}
          </div>
          <h3 class="font-semibold text-base mb-2">{{ step.title }}</h3>
          <p class="text-sm text-muted leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Features ──────────────────────────────────────────────────── -->
  <section class="py-20 px-6 bg-muted">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="font-serif text-3xl font-light mb-3">
          {{ t('pages.home.features.title') }}
        </h2>
        <p class="text-muted text-base max-w-md mx-auto">
          {{ t('pages.home.features.subtitle') }}
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-5">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="bg-default rounded-2xl p-6 border border-default"
        >
          <div
            class="w-11 h-11 flex items-center justify-center rounded-xl mb-4"
            style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
          >
            <UIcon :name="feature.icon" class="size-5 text-primary" />
          </div>
          <h3 class="font-semibold text-sm mb-1">{{ feature.title }}</h3>
          <p class="text-sm text-muted leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Pricing ───────────────────────────────────────────────────── -->
  <section class="py-20 px-6">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="font-serif text-3xl font-light mb-3">
          {{ t('pages.home.pricing.title') }}
        </h2>
        <p class="text-muted text-base">
          {{ t('pages.home.pricing.subtitle') }}
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-6">
        <!-- Free -->
        <div class="rounded-2xl border border-default bg-default p-8 flex flex-col">
          <div class="mb-6">
            <p class="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              {{ t('pages.home.pricing.free.name') }}
            </p>
            <div class="flex items-end gap-1">
              <span class="font-serif text-4xl font-light">{{ t('pages.home.pricing.free.price') }}</span>
              <span class="text-muted text-sm mb-1">{{ t('pages.home.pricing.free.period') }}</span>
            </div>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            <li
              v-for="feat in freeFeatures"
              :key="feat"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-heroicons-check-circle" class="size-4 text-success shrink-0 mt-0.5" />
              {{ feat }}
            </li>
          </ul>
          <UButton
            variant="outline"
            color="primary"
            size="lg"
            class="w-full"
            @click="navigateTo(localePath(isSignedIn ? '/dashboard' : '/sign-up'))"
          >
            {{ t('pages.home.pricing.free.cta') }}
          </UButton>
        </div>

        <!-- Pro -->
        <div
          class="rounded-2xl p-8 flex flex-col text-white relative overflow-hidden"
          style="background: linear-gradient(135deg, #3C0F21 0%, #782A46 100%)"
        >
          <div class="absolute top-4 right-4">
            <UBadge color="warning" variant="solid" size="sm">
              {{ t('pages.home.pricing.pro.badge') }}
            </UBadge>
          </div>
          <div class="mb-6">
            <p class="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">
              {{ t('pages.home.pricing.pro.name') }}
            </p>
            <div class="flex items-end gap-1">
              <span class="font-serif text-4xl font-light">{{ t('pages.home.pricing.pro.price') }}</span>
              <span class="text-white/60 text-sm mb-1">{{ t('pages.home.pricing.pro.period') }}</span>
            </div>
          </div>
          <ul class="space-y-3 flex-1 mb-8">
            <li
              v-for="feat in proFeatures"
              :key="feat"
              class="flex items-start gap-2 text-sm text-white/90"
            >
              <UIcon name="i-heroicons-check-circle" class="size-4 text-rose-200 shrink-0 mt-0.5" />
              {{ feat }}
            </li>
          </ul>
          <UButton
            color="primary"
            variant="solid"
            size="lg"
            class="w-full opacity-60 cursor-not-allowed"
            disabled
          >
            {{ t('pages.home.pricing.pro.cta') }}
          </UButton>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Final CTA ─────────────────────────────────────────────────── -->
  <section
    class="py-20 px-6 text-center"
    style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
  >
    <div class="max-w-xl mx-auto">
      <h2 class="font-serif text-4xl font-light mb-4 text-rose-950">
        {{ t('pages.home.cta.title') }}
      </h2>
      <p class="text-rose-800/70 text-base mb-8">
        {{ t('pages.home.cta.subtitle') }}
      </p>
      <UButton
        color="primary"
        size="xl"
        class="font-semibold"
        @click="navigateTo(localePath(isSignedIn ? '/dashboard' : '/sign-up'))"
      >
        {{ isSignedIn ? t('pages.home.hero.ctaDashboard') : t('pages.home.cta.button') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const freeFeatures = computed(() => [
  t('pages.home.pricing.free.feature1'),
  t('pages.home.pricing.free.feature2'),
  t('pages.home.pricing.free.feature3'),
  t('pages.home.pricing.free.feature4'),
])

const proFeatures = computed(() => [
  t('pages.home.pricing.pro.feature1'),
  t('pages.home.pricing.pro.feature2'),
  t('pages.home.pricing.pro.feature3'),
  t('pages.home.pricing.pro.feature4'),
  t('pages.home.pricing.pro.feature5'),
])

const steps = computed(() => [
  {
    icon: 'i-heroicons-user-circle',
    title: t('pages.home.howItWorks.step1.title'),
    description: t('pages.home.howItWorks.step1.description'),
  },
  {
    icon: 'i-heroicons-share',
    title: t('pages.home.howItWorks.step2.title'),
    description: t('pages.home.howItWorks.step2.description'),
  },
  {
    icon: 'i-heroicons-calendar-days',
    title: t('pages.home.howItWorks.step3.title'),
    description: t('pages.home.howItWorks.step3.description'),
  },
])

const features = computed(() => [
  {
    key: 'calendar',
    icon: 'i-heroicons-calendar',
    title: t('pages.home.features.calendar.title'),
    description: t('pages.home.features.calendar.description'),
  },
  {
    key: 'clients',
    icon: 'i-heroicons-users',
    title: t('pages.home.features.clients.title'),
    description: t('pages.home.features.clients.description'),
  },
  {
    key: 'checkout',
    icon: 'i-heroicons-banknotes',
    title: t('pages.home.features.checkout.title'),
    description: t('pages.home.features.checkout.description'),
  },
  {
    key: 'analytics',
    icon: 'i-heroicons-chart-bar',
    title: t('pages.home.features.analytics.title'),
    description: t('pages.home.features.analytics.description'),
  },
])

useSeoMeta({
  title: computed(() => t('pages.home.title')),
  description: computed(() => t('pages.home.subtitle')),
  ogTitle: computed(() => t('pages.home.title')),
  ogDescription: computed(() => t('pages.home.subtitle')),
  ogType: 'website',
})
</script>
