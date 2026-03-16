<template>
  <UMain>
    <!-- Hero -->
    <section
      class="py-20 px-6 text-center text-white"
      style="background: linear-gradient(135deg, #3C0F21 0%, #782A46 60%, #C85C82 100%)"
    >
      <div class="max-w-2xl mx-auto">
        <h1 class="font-serif text-4xl md:text-5xl font-light mb-4">
          {{ t('pages.about.title') }}
        </h1>
        <p class="text-white/75 text-lg leading-relaxed">
          {{ t('pages.about.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Mission -->
    <section class="py-16 px-6">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="font-serif text-2xl font-light mb-4">
          {{ t('pages.about.mission.title') }}
        </h2>
        <p class="text-muted leading-relaxed text-base">
          {{ t('pages.about.mission.text') }}
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="py-16 px-6 bg-muted">
      <div class="max-w-3xl mx-auto">
        <h2 class="font-serif text-2xl font-light text-center mb-12">
          {{ t('pages.about.values.title') }}
        </h2>
        <div class="grid sm:grid-cols-3 gap-8">
          <div
            v-for="value in values"
            :key="value.key"
            class="flex flex-col items-center text-center"
          >
            <div
              class="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
              style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
            >
              <UIcon :name="value.icon" class="size-6 text-primary" />
            </div>
            <h3 class="font-semibold text-sm mb-2">{{ value.title }}</h3>
            <p class="text-sm text-muted leading-relaxed">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-6 text-center">
      <div class="max-w-md mx-auto">
        <h2 class="font-serif text-2xl font-light mb-4">
          {{ t('pages.about.cta.title') }}
        </h2>
        <UButton color="primary" size="lg" :to="localePath('/sign-up')">
          {{ t('pages.home.hero.cta') }}
        </UButton>
      </div>
    </section>
  </UMain>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const values = computed(() => [
  {
    key: 'simplicity',
    icon: 'i-heroicons-light-bulb',
    title: t('pages.about.values.simplicity.title'),
    description: t('pages.about.values.simplicity.description'),
  },
  {
    key: 'growth',
    icon: 'i-heroicons-arrow-trending-up',
    title: t('pages.about.values.growth.title'),
    description: t('pages.about.values.growth.description'),
  },
  {
    key: 'trust',
    icon: 'i-heroicons-shield-check',
    title: t('pages.about.values.trust.title'),
    description: t('pages.about.values.trust.description'),
  },
])

useSeoMeta({
  title: computed(() => t('pages.about.title')),
  description: computed(() => t('pages.about.subtitle')),
})
</script>
