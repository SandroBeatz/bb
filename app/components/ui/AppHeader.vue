<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink :to="localePath('/')" class="text-xl font-bold text-primary">
        BeautyBook
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          :to="localePath('/')"
          class="text-sm font-medium text-gray-700 hover:text-primary"
          active-class="text-primary"
        >
          {{ t('nav.home') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/dashboard/calendar')"
          class="text-sm font-medium text-gray-700 hover:text-primary"
          active-class="text-primary"
        >
          {{ t('nav.dashboard') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/client/bookings')"
          class="text-sm font-medium text-gray-700 hover:text-primary"
          active-class="text-primary"
        >
          {{ t('nav.bookings') }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <USelect
          v-model="selectedLocale"
          :items="localeItems"
          size="sm"
          class="w-36"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

const selectedLocale = ref(locale.value)

const localeItems = computed(() =>
  locales.value.map((l) => ({
    label: t(`language.${l.code}`),
    value: l.code,
  })),
)

watch(selectedLocale, async (code) => {
  await setLocale(code as 'ru' | 'ky')
})
</script>
