<template>
  <UContainer class="py-6">
    <h1 class="text-2xl font-bold mb-6">{{ $t('pages.client.mastersPage.title') }}</h1>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="n in 3" :key="n">
        <div class="flex items-center gap-3 mb-3">
          <USkeleton class="size-12 rounded-full shrink-0" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-4 w-32 rounded" />
            <USkeleton class="h-3 w-20 rounded" />
          </div>
        </div>
        <USkeleton class="h-3 w-40 rounded mb-4" />
        <div class="flex gap-2">
          <USkeleton class="h-9 flex-1 rounded-md" />
          <USkeleton class="h-9 flex-1 rounded-md" />
        </div>
      </UCard>
    </div>

    <!-- Empty -->
    <UEmpty
      v-else-if="!masters.length"
      icon="i-heroicons-user-group"
      :title="$t('pages.client.mastersPage.empty')"
      :description="$t('pages.client.mastersPage.emptyHint')"
    >
      <template #actions>
        <UButton
          :to="localePath('/catalog')"
          color="primary"
          size="lg"
          icon="i-heroicons-magnifying-glass"
        >
          {{ $t('pages.client.findMasters') }}
        </UButton>
      </template>
    </UEmpty>

    <!-- Masters grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="master in masters" :key="master.id">
        <div class="flex items-center gap-3 mb-3">
          <UAvatar
            :src="master.avatar_url ?? undefined"
            :alt="master.full_name"
            size="lg"
            class="shrink-0"
          />
          <div class="min-w-0">
            <p class="font-semibold text-highlighted truncate">{{ master.full_name }}</p>
            <p v-if="master.city" class="text-sm text-muted truncate">{{ master.city }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 mb-4 text-sm text-muted">
          <div v-if="master.rating" class="flex items-center gap-1">
            <UIcon name="i-heroicons-star-solid" class="size-4 text-yellow-400" />
            <span>{{ master.rating.toFixed(1) }}</span>
          </div>
          <span v-if="master.rating && master.visitCount">·</span>
          <span>
            {{ $t('pages.client.mastersPage.visits', { count: master.visitCount }) }}
          </span>
        </div>

        <div v-if="master.lastVisitDate" class="text-xs text-muted mb-4">
          {{ $t('pages.client.mastersPage.lastVisit') }}:
          {{ formatDate(master.lastVisitDate) }}
        </div>

        <div class="flex gap-2">
          <UButton
            :to="master.username ? localePath(`/master/${master.username}`) : undefined"
            variant="outline"
            color="neutral"
            size="sm"
            class="flex-1"
          >
            {{ $t('pages.client.mastersPage.viewProfile') }}
          </UButton>
          <UButton
            :to="master.username ? localePath(`/master/${master.username}/book`) : undefined"
            color="primary"
            size="sm"
            class="flex-1"
          >
            {{ $t('pages.client.mastersPage.bookAgain') }}
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'client-only' })

const { t } = useI18n()
const localePath = useLocalePath()

interface Master {
  id: string
  full_name: string
  username: string | null
  avatar_url: string | null
  city: string | null
  rating: number | null
  lastVisitDate: string
  lastServiceName: string | null
  visitCount: number
}

const { data, pending } = await useLazyFetch<Master[]>('/api/me/masters')

const masters = computed(() => data.value ?? [])

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
