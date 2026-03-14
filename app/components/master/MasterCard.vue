<template>
  <UCard
    as="article"
    class="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    @click="navigate"
  >
    <!-- Cover / Avatar photo (4:5 portrait) -->
    <div class="aspect-[4/5] overflow-hidden bg-elevated -mx-4 -mt-4">
      <img
        v-if="master.cover || master.avatar"
        :src="master.cover ?? master.avatar ?? ''"
        :alt="master.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-elevated">
        <UIcon name="i-heroicons-user" class="text-6xl text-muted" />
      </div>
    </div>

    <!-- Card body -->
    <div class="pt-3 flex flex-col gap-1.5">
      <!-- Name + specialty -->
      <div>
        <p class="font-sans font-semibold text-base text-highlighted leading-tight truncate">
          {{ master.name }}
        </p>
        <p v-if="master.specialty" class="font-sans text-sm text-muted truncate">
          {{ master.specialty }}
        </p>
      </div>

      <!-- Rating + review count -->
      <div class="flex items-center gap-1.5">
        <UBadge
          v-if="master.rating != null"
          color="neutral"
          variant="soft"
          size="xs"
          class="flex items-center gap-0.5"
        >
          <UIcon name="i-heroicons-star-solid" class="text-yellow-400 text-xs" />
          {{ master.rating.toFixed(1) }}
        </UBadge>
        <span v-if="master.reviewCount != null" class="text-xs text-muted">
          {{ master.reviewCount > 0 ? t('masterCard.reviews', { count: master.reviewCount }) : t('masterCard.noReviews') }}
        </span>
      </div>

      <!-- Price + city -->
      <div class="flex items-center justify-between mt-0.5">
        <span v-if="master.priceFrom" class="text-sm font-semibold text-primary">
          {{ t('masterCard.priceFrom', { price: master.priceFrom }) }}
        </span>
        <span v-if="master.city" class="text-xs text-muted truncate ml-2">
          {{ master.city }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface MasterCardProps {
  master: {
    username: string
    name: string
    avatar?: string | null
    cover?: string | null
    specialty?: string | null
    rating?: number | null
    reviewCount?: number | null
    priceFrom?: number | null
    city?: string | null
  }
}

const props = defineProps<MasterCardProps>()

const { t } = useI18n()
const localePath = useLocalePath()

function navigate() {
  navigateTo(localePath(`/master/${props.master.username}`))
}
</script>
