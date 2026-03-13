<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-(--ui-bg) px-4 py-16">
    <div class="mb-8 text-center">
      <NuxtLink
        :to="localePath('/')"
        class="font-serif font-light text-3xl text-highlighted transition-opacity hover:opacity-75"
      >
        BeautyBook
      </NuxtLink>
    </div>
    <SignUp
      routing="path"
      path="/sign-up"
      :sign-in-url="localePath('/sign-in')"
      fallback-redirect-url="/onboarding"
    />
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

definePageMeta({
  layout: false,
})
</script>
