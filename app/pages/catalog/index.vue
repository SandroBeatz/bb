<template>
  <UContainer style="--ui-container: 72rem" class="py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-1">
        {{ t('pages.catalog.title') }}
      </h1>
      <p class="text-sm text-muted">
        {{ t('pages.catalog.subtitle') }}
      </p>
    </div>

    <!-- Search + Sort -->
    <div class="flex flex-wrap gap-3 mb-6">
      <UInput
        v-model="search"
        :placeholder="t('pages.catalog.searchPlaceholder')"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        class="flex-1 min-w-48"
      />
      <USelect
        v-model="sort"
        :items="sortItems"
        size="lg"
        class="w-44"
      />
    </div>

    <!-- Category chips (horizontal scroll on mobile) -->
    <div class="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
      <UBadge
        v-for="cat in categories"
        :key="cat.value"
        :color="selectedCategory === cat.value ? 'primary' : 'neutral'"
        :variant="selectedCategory === cat.value ? 'solid' : 'soft'"
        class="cursor-pointer whitespace-nowrap flex-shrink-0 select-none"
        @click="toggleCategory(cat.value)"
      >
        {{ cat.label }}
      </UBadge>
    </div>

    <!-- City + Rating filters -->
    <div class="flex flex-wrap items-center gap-3 mb-8">
      <UInput
        v-model="city"
        :placeholder="t('pages.catalog.filterCityPlaceholder')"
        icon="i-heroicons-map-pin"
        class="w-48"
      />
      <span class="text-sm text-muted">{{ t('pages.catalog.filterRating') }}:</span>
      <div class="flex gap-2">
        <UBadge
          v-for="r in ratingOptions"
          :key="r"
          :color="minRating === r ? 'primary' : 'neutral'"
          :variant="minRating === r ? 'solid' : 'soft'"
          class="cursor-pointer select-none"
          @click="toggleRating(r)"
        >
          ★ {{ r }}+
        </UBadge>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="pending">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <USkeleton v-for="i in PAGE_SIZE" :key="i" class="aspect-[4/5] rounded-2xl" />
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!masters?.length">
      <UEmpty
        icon="i-heroicons-user-group"
        :title="t('pages.catalog.empty')"
        :description="hasActiveFilters ? t('pages.catalog.emptyHint') : undefined"
      />
    </template>

    <!-- Masters grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <MasterCard
        v-for="master in masters"
        :key="master.id"
        :master="{
          username: master.username ?? '',
          name: master.full_name ?? '',
          avatar: master.avatar_url,
          specialty: master.master_profiles?.[0]?.specializations?.[0] ?? null,
          rating: master.master_profiles?.[0]?.rating ?? null,
          city: master.master_profiles?.[0]?.city ?? null,
          priceFrom: master.priceFrom ?? null,
        }"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-10">
      <UPagination v-model:page="currentPage" :total="total" :page-size="PAGE_SIZE" />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
interface MasterListItem {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  priceFrom: number | null
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

interface CatalogResponse {
  data: MasterListItem[]
  total: number
  page: number
  limit: number
}

const { t } = useI18n()

useSeoMeta({
  title: computed(() => t('pages.catalog.title')),
})

const PAGE_SIZE = 20

// --- Filter state ---
const search = ref('')
const debouncedSearch = ref('')
const city = ref('')
const debouncedCity = ref('')
const selectedCategory = ref('')
const minRating = ref<number | null>(null)
const sort = ref('date')
const currentPage = ref(1)

// Debounce search input
let debounceSearchTimer: ReturnType<typeof setTimeout>
watch(search, (val) => {
  clearTimeout(debounceSearchTimer)
  debounceSearchTimer = setTimeout(() => {
    debouncedSearch.value = val
    currentPage.value = 1
  }, 300)
})

// Debounce city input
let debounceCityTimer: ReturnType<typeof setTimeout>
watch(city, (val) => {
  clearTimeout(debounceCityTimer)
  debounceCityTimer = setTimeout(() => {
    debouncedCity.value = val
    currentPage.value = 1
  }, 300)
})

onBeforeUnmount(() => {
  clearTimeout(debounceSearchTimer)
  clearTimeout(debounceCityTimer)
})

// Reset page when discrete filters change
watch([selectedCategory, minRating, sort], () => {
  currentPage.value = 1
})

// --- Category definitions (values match DB specialization strings, case-insensitive) ---
const categories = computed(() => [
  { value: '', label: t('pages.catalog.allCategories') },
  { value: 'маникюр', label: t('pages.catalog.categories.manicure') },
  { value: 'педикюр', label: t('pages.catalog.categories.pedicure') },
  { value: 'ресницы', label: t('pages.catalog.categories.lashes') },
  { value: 'брови', label: t('pages.catalog.categories.brows') },
  { value: 'макияж', label: t('pages.catalog.categories.makeup') },
  { value: 'тату', label: t('pages.catalog.categories.tattoo') },
  { value: 'стрижка', label: t('pages.catalog.categories.haircut') },
  { value: 'окрашивание', label: t('pages.catalog.categories.coloring') },
  { value: 'массаж', label: t('pages.catalog.categories.massage') },
])

const ratingOptions = [3, 4, 4.5] as const

const sortItems = computed(() => [
  { label: t('pages.catalog.sort.date'), value: 'date' },
  { label: t('pages.catalog.sort.rating'), value: 'rating' },
  { label: t('pages.catalog.sort.price'), value: 'price' },
])

// --- Helpers ---
function toggleCategory(value: string) {
  selectedCategory.value = selectedCategory.value === value ? '' : value
}

function toggleRating(value: number) {
  minRating.value = minRating.value === value ? null : value
}

const hasActiveFilters = computed(
  () =>
    !!debouncedSearch.value ||
    !!debouncedCity.value ||
    !!selectedCategory.value ||
    minRating.value !== null,
)

// --- Data fetching ---
const { data: response, pending } = await useAsyncData(
  'masters-catalog',
  () =>
    $fetch<CatalogResponse>('/api/masters', {
      query: {
        search: debouncedSearch.value || undefined,
        city: debouncedCity.value || undefined,
        category: selectedCategory.value || undefined,
        minRating: minRating.value ?? undefined,
        sort: sort.value,
        page: currentPage.value,
        limit: PAGE_SIZE,
      },
    }),
  { watch: [debouncedSearch, debouncedCity, selectedCategory, minRating, sort, currentPage] },
)

const masters = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))
</script>
