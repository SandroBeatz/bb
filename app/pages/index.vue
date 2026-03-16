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
        @click="navigateTo(localePath(isSignedIn ? '/dashboard' : '/sign-up'))"
      >
        {{ t('pages.home.forMasters.cta') }}
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
            <UIcon name="i-heroicons-user-plus" class="text-3xl text-primary" />
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
            <UIcon name="i-heroicons-link" class="text-3xl text-primary" />
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
            <UIcon name="i-heroicons-calendar-days" class="text-3xl text-primary" />
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

  <!-- For Masters CTA Section -->
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
        @click="navigateTo(localePath(isSignedIn ? '/dashboard' : '/sign-up'))"
      >
        {{ t('pages.home.forMasters.cta') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

useSeoMeta({
  title: computed(() => t('pages.home.title')),
  description: computed(() => t('pages.home.subtitle')),
  ogTitle: computed(() => t('pages.home.title')),
  ogDescription: computed(() => t('pages.home.subtitle')),
  ogType: 'website',
})
</script>
