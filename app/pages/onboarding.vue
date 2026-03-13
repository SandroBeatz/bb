<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-(--ui-bg) px-4 py-16">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="mb-12 text-center">
        <NuxtLink
          :to="localePath('/')"
          class="mb-8 inline-block font-serif font-light text-3xl text-highlighted transition-opacity hover:opacity-75"
        >
          BeautyBook
        </NuxtLink>
        <h1 class="mt-6 font-sans text-2xl font-bold text-highlighted sm:text-3xl">
          {{ t('pages.onboarding.title') }}
        </h1>
        <p class="mt-3 font-sans text-base text-muted">
          {{ t('pages.onboarding.subtitle') }}
        </p>
      </div>

      <!-- Role cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Master card -->
        <button
          type="button"
          class="role-card group flex flex-col items-center rounded-2xl border-2 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          :class="
            selectedRole === 'master'
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-default hover:border-primary/40'
          "
          @click="selectedRole = 'master'"
        >
          <div
            class="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15"
          >
            <UIcon name="i-heroicons-scissors" class="size-8 text-primary" />
          </div>
          <h2 class="font-sans text-xl font-semibold text-highlighted">
            {{ t('pages.onboarding.master.title') }}
          </h2>
          <p class="mt-2 font-sans text-sm text-muted leading-relaxed">
            {{ t('pages.onboarding.master.description') }}
          </p>
          <div
            v-if="selectedRole === 'master'"
            class="mt-4 flex size-6 items-center justify-center rounded-full bg-primary"
          >
            <UIcon name="i-heroicons-check" class="size-4 text-white" />
          </div>
        </button>

        <!-- Client card -->
        <button
          type="button"
          class="role-card group flex flex-col items-center rounded-2xl border-2 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          :class="
            selectedRole === 'client'
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-default hover:border-primary/40'
          "
          @click="selectedRole = 'client'"
        >
          <div
            class="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15"
          >
            <UIcon name="i-heroicons-user" class="size-8 text-primary" />
          </div>
          <h2 class="font-sans text-xl font-semibold text-highlighted">
            {{ t('pages.onboarding.client.title') }}
          </h2>
          <p class="mt-2 font-sans text-sm text-muted leading-relaxed">
            {{ t('pages.onboarding.client.description') }}
          </p>
          <div
            v-if="selectedRole === 'client'"
            class="mt-4 flex size-6 items-center justify-center rounded-full bg-primary"
          >
            <UIcon name="i-heroicons-check" class="size-4 text-white" />
          </div>
        </button>
      </div>

      <!-- CTA -->
      <div class="mt-8">
        <UButton
          color="primary"
          size="lg"
          class="w-full font-sans font-medium"
          :loading="loading"
          :disabled="!selectedRole"
          @click="handleContinue"
        >
          {{ t('common.next') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const selectedRole = ref<'master' | 'client' | null>(null)
const loading = ref(false)

async function handleContinue() {
  if (!selectedRole.value) return

  loading.value = true
  try {
    await $fetch('/api/me/onboarding', {
      method: 'POST',
      body: { role: selectedRole.value },
    })

    if (selectedRole.value === 'master') {
      await navigateTo(localePath('/dashboard'))
    } else {
      await navigateTo(localePath('/'))
    }
  } catch (e) {
    console.error('Onboarding error:', e)
    toast.add({
      title: t('errors.general'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>
