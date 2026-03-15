<script setup lang="ts">
import type { PortfolioItem } from '~/types'

const props = withDefaults(
  defineProps<{
    items: PortfolioItem[]
    editMode?: boolean
    loading?: boolean
  }>(),
  {
    editMode: false,
    loading: false,
  },
)

const emit = defineEmits<{
  delete: [id: string]
  reorder: [items: PortfolioItem[]]
  click: [item: PortfolioItem]
}>()

const { t } = useI18n()

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(item: PortfolioItem) {
  if (props.editMode) return
  lightboxIndex.value = props.items.indexOf(item)
  lightboxOpen.value = true
  emit('click', item)
}

function closeLightbox() {
  lightboxOpen.value = false
}

function prevPhoto() {
  lightboxIndex.value = (lightboxIndex.value - 1 + props.items.length) % props.items.length
}

function nextPhoto() {
  lightboxIndex.value = (lightboxIndex.value + 1) % props.items.length
}

// Close lightbox on Escape key
function handleKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

// Drag-and-drop sort (edit mode only)
const dragFromIndex = ref<number | null>(null)

function onDragStart(index: number) {
  dragFromIndex.value = index
}

function onDrop(toIndex: number) {
  if (dragFromIndex.value === null || dragFromIndex.value === toIndex) return
  const reordered = [...props.items]
  const [moved] = reordered.splice(dragFromIndex.value, 1)
  reordered.splice(toIndex, 0, moved)
  emit('reorder', reordered)
  dragFromIndex.value = null
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

const lightboxItem = computed(() => props.items[lightboxIndex.value] ?? null)
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div
      v-if="loading"
      class="grid grid-cols-3 gap-1 md:gap-2"
    >
      <USkeleton
        v-for="i in 6"
        :key="i"
        class="aspect-square rounded-lg"
      />
    </div>

    <!-- Empty state -->
    <UEmpty
      v-else-if="!items.length"
      icon="i-heroicons-photo"
      :title="t('pages.masterProfile.portfolio.empty')"
    />

    <!-- Grid -->
    <div
      v-else
      class="grid grid-cols-3 gap-1 md:gap-2"
    >
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        :draggable="editMode"
        @dragstart="onDragStart(index)"
        @dragover="onDragOver"
        @drop="onDrop(index)"
        @click="openLightbox(item)"
      >
        <img
          :src="item.image_url"
          :alt="item.caption ?? ''"
          class="size-full object-cover transition-transform duration-300"
          :class="editMode ? 'cursor-grab' : 'cursor-pointer hover:scale-105'"
          loading="lazy"
        >

        <!-- Caption overlay -->
        <div
          v-if="item.caption && !editMode"
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <p class="line-clamp-2 text-xs text-white">
            {{ item.caption }}
          </p>
        </div>

        <!-- Edit mode: delete button -->
        <UButton
          v-if="editMode"
          color="error"
          variant="solid"
          size="xs"
          icon="i-heroicons-trash"
          class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          :aria-label="t('common.delete')"
          @click.stop="emit('delete', item.id)"
        />
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen && lightboxItem"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="lg"
            class="absolute right-4 top-4 text-white hover:text-gray-300"
            :aria-label="t('common.close')"
            @click="closeLightbox"
          />

          <!-- Prev -->
          <UButton
            v-if="items.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-left"
            size="lg"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
            @click="prevPhoto"
          />

          <!-- Image -->
          <div class="max-h-[90vh] max-w-[90vw]">
            <img
              :src="lightboxItem.image_url"
              :alt="lightboxItem.caption ?? ''"
              class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            >
            <p
              v-if="lightboxItem.caption"
              class="mt-2 text-center text-sm text-gray-300"
            >
              {{ lightboxItem.caption }}
            </p>
          </div>

          <!-- Next -->
          <UButton
            v-if="items.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-right"
            size="lg"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
            @click="nextPhoto"
          />

          <!-- Counter -->
          <span class="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-gray-400">
            {{ lightboxIndex + 1 }} / {{ items.length }}
          </span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
