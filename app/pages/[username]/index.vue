<script setup lang="ts">
interface MasterProfileMeta {
  bio: string | null
  city: string | null
  specializations: string[]
  contacts: Record<string, string>
  work_hours: Record<string, unknown>
  cover_url: string | null
  rating: number
  subscription_tier: string
}

interface MasterResponse {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  master_profiles: MasterProfileMeta[]
}

const route = useRoute()
const { t } = useI18n()

const username = String(route.params.username)

const {
  data: master,
  error,
  pending,
} = await useAsyncData(`master-${username}`, () =>
  $fetch<MasterResponse>(`/api/masters/${username}`),
)

if (error.value || !master.value) {
  throw createError({ statusCode: 404, statusMessage: t('errors.notFound') })
}

const masterProfile = computed(() => master.value?.master_profiles?.[0] ?? null)

useSeoMeta({
  title: computed(() => master.value?.full_name ?? ''),
  description: computed(() => masterProfile.value?.bio ?? ''),
  ogTitle: computed(() => master.value?.full_name ?? ''),
  ogDescription: computed(() => masterProfile.value?.bio ?? ''),
  ogImage: computed(() => masterProfile.value?.cover_url ?? master.value?.avatar_url ?? undefined),
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] dark:bg-[#1A1612]">
    <div class="mx-auto max-w-[480px] min-h-screen bg-default shadow-xl">
      <template v-if="pending">
        <USkeleton class="h-[220px] w-full" />
        <div class="flex flex-col items-center gap-3 px-4 pt-16">
          <USkeleton class="size-[88px] rounded-full" />
          <USkeleton class="h-8 w-40" />
          <USkeleton class="h-4 w-28" />
        </div>
      </template>
      <MasterProfile v-else-if="master" :master="master" />
    </div>
  </div>
</template>
