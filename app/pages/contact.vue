<template>
  <UMain>
    <!-- Hero -->
    <section
      class="py-20 px-6 text-center text-white"
      style="background: linear-gradient(135deg, #3C0F21 0%, #782A46 60%, #C85C82 100%)"
    >
      <div class="max-w-xl mx-auto">
        <h1 class="font-serif text-4xl md:text-5xl font-light mb-4">
          {{ t('pages.contact.title') }}
        </h1>
        <p class="text-white/75 text-lg">
          {{ t('pages.contact.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Contact options -->
    <section class="py-16 px-6">
      <div class="max-w-2xl mx-auto grid sm:grid-cols-2 gap-6">
        <!-- Telegram -->
        <div class="rounded-2xl border border-default bg-default p-8 flex flex-col items-center text-center">
          <div
            class="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
            style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
          >
            <UIcon name="i-simple-icons-telegram" class="size-6 text-primary" />
          </div>
          <h3 class="font-semibold text-base mb-2">{{ t('pages.contact.telegram.title') }}</h3>
          <p class="text-sm text-muted mb-5 leading-relaxed">
            {{ t('pages.contact.telegram.description') }}
          </p>
          <UButton
            color="primary"
            variant="soft"
            size="md"
            icon="i-simple-icons-telegram"
            to="https://t.me/beautybook_support"
            target="_blank"
          >
            {{ t('pages.contact.telegram.button') }}
          </UButton>
        </div>

        <!-- Email -->
        <div class="rounded-2xl border border-default bg-default p-8 flex flex-col items-center text-center">
          <div
            class="w-14 h-14 flex items-center justify-center rounded-2xl mb-4"
            style="background: linear-gradient(135deg, #FAE8EE 0%, #F4CEDB 100%)"
          >
            <UIcon name="i-heroicons-envelope" class="size-6 text-primary" />
          </div>
          <h3 class="font-semibold text-base mb-2">{{ t('pages.contact.email.title') }}</h3>
          <p class="text-sm text-muted mb-5 leading-relaxed">
            {{ t('pages.contact.email.description') }}
          </p>
          <UButton
            color="primary"
            variant="soft"
            size="md"
            icon="i-heroicons-envelope"
            to="mailto:hello@beautybook.kg"
          >
            hello@beautybook.kg
          </UButton>
        </div>
      </div>
    </section>
  </UMain>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: computed(() => t('pages.contact.title')),
  description: computed(() => t('pages.contact.subtitle')),
})
</script>
