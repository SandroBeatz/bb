<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">{{ $t('pages.catalog.title') }}</h1>
      <p class="text-muted">{{ $t('pages.catalog.subtitle') }}</p>
    </div>

    <!-- Search -->
    <div class="mb-8">
      <UInput
        v-model="search"
        :placeholder="$t('pages.catalog.searchPlaceholder')"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        class="max-w-lg"
      />
    </div>

    <!-- Loading skeleton -->
    <template v-if="pending">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <USkeleton v-for="i in 8" :key="i" class="aspect-[4/5] rounded-2xl" />
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!filteredMasters.length">
      <UEmpty
        icon="i-heroicons-user-group"
        :title="$t('pages.catalog.empty')"
      />
    </template>

    <!-- Masters grid -->
    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <MasterCard
        v-for="master in filteredMasters"
        :key="master.id"
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
</template>

<script setup lang="ts">
interface MasterListItem {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  master_profiles:
    | {
        bio: string | null
        city: string | null
        specializations: string[]
        rating: number | null
        subscription_tier: string | null
      }[]
    | null
}

const { t } = useI18n()

useSeoMeta({
  title: computed(() => t('pages.catalog.title')),
})

const search = ref('')
const debouncedSearch = ref('')
let debounceTimer: ReturnType<typeof setTimeout>
watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})

const { data: masters, pending } = await useAsyncData('masters-catalog', () =>
  $fetch<MasterListItem[]>('/api/masters'),
)

const filteredMasters = computed(() => {
  const list = masters.value ?? []
  if (!debouncedSearch.value.trim()) return list
  const q = debouncedSearch.value.toLowerCase()
  return list.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(q) ||
      m.master_profiles?.[0]?.city?.toLowerCase().includes(q) ||
      m.master_profiles?.[0]?.specializations?.some((s) => s.toLowerCase().includes(q)),
  )
})
</script>
