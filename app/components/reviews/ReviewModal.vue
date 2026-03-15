<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('reviews.form.title')"
    :ui="{ content: 'rounded-2xl p-6' }"
  >
    <template #body>
      <div class="space-y-5">
        <!-- Star rating -->
        <div>
          <p class="mb-2 text-sm font-medium text-highlighted">
            {{ $t('reviews.form.ratingLabel') }}
          </p>
          <div class="flex gap-2" role="group" :aria-label="$t('reviews.form.ratingLabel')">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="flex size-11 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="`${star} ${$t('reviews.form.stars')}`"
              :aria-pressed="hoveredRating >= star || (hoveredRating === 0 && selectedRating >= star)"
              @click="selectedRating = star"
              @mouseenter="hoveredRating = star"
              @mouseleave="hoveredRating = 0"
              @touchstart.passive="hoveredRating = star"
              @touchend.passive="hoveredRating = 0"
            >
              <UIcon
                name="i-heroicons-star-solid"
                class="size-7"
                :class="
                  (hoveredRating > 0 ? hoveredRating >= star : selectedRating >= star)
                    ? 'text-amber-400'
                    : 'text-muted'
                "
              />
            </button>
          </div>
          <p v-if="showValidation && selectedRating === 0" class="mt-1 text-xs text-error">
            {{ $t('reviews.validation.ratingRequired') }}
          </p>
        </div>

        <!-- Comment -->
        <div>
          <UFormField :label="$t('reviews.form.commentLabel')" name="comment">
            <UTextarea
              v-model="comment"
              :placeholder="$t('reviews.form.commentPlaceholder')"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="outline"
          @click="isOpen = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          color="primary"
          :loading="loading"
          @click="submit"
        >
          {{ $t('reviews.form.submit') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  bookingId: string
}>()

const emit = defineEmits<{
  submitted: []
}>()

const { t } = useI18n()
const toast = useToast()

const isOpen = defineModel<boolean>('open', { default: false })

const selectedRating = ref(0)
const hoveredRating = ref(0)
const comment = ref('')
const loading = ref(false)
const showValidation = ref(false)

watch(isOpen, (open) => {
  if (open) {
    selectedRating.value = 0
    hoveredRating.value = 0
    comment.value = ''
    showValidation.value = false
  }
})

async function submit() {
  showValidation.value = true
  if (selectedRating.value === 0) return

  loading.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        booking_id: props.bookingId,
        rating: selectedRating.value,
        comment: comment.value.trim() || null,
      },
    })
    toast.add({ title: t('reviews.toast.success'), color: 'success' })
    isOpen.value = false
    emit('submitted')
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 409) {
      toast.add({ title: t('reviews.toast.alreadyExists'), color: 'warning' })
      isOpen.value = false
    } else {
      toast.add({ title: t('reviews.toast.error'), color: 'error' })
    }
  } finally {
    loading.value = false
  }
}
</script>
