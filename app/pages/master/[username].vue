<script setup lang="ts">
interface MasterProfileMeta {
  bio: string | null
  city: string | null
  specializations: string[]
  contacts: Record<string, string>
  work_hours: Record<string, unknown>
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

const { data: master, error, pending } = await useAsyncData(
  `master-${username}`,
  () => $fetch<MasterResponse>(`/api/masters/${username}`),
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
  ogImage: computed(() => master.value?.avatar_url ?? undefined),
  twitterCard: 'summary',
})
</script>

<template>
  <div>
    <!-- Skeleton loading (client-side navigation) -->
    <template v-if="pending">
      <div class="relative">
        <USkeleton class="h-[240px] w-full md:h-[360px]" />
        <div class="absolute bottom-0 left-4 translate-y-1/2 md:left-8">
          <USkeleton class="size-20 rounded-full md:size-24" />
        </div>
      </div>
      <div class="space-y-3 px-4 pt-14 md:px-8 md:pt-16">
        <USkeleton class="h-9 w-48" />
        <USkeleton class="h-5 w-36" />
        <USkeleton class="h-4 w-32" />
      </div>
    </template>

    <!-- Profile -->
    <MasterProfile
      v-else-if="master"
      :master="master"
    />
  </div>
</template>
