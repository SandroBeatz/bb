<script setup lang="ts">
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MAX_PHOTOS = 20

const props = defineProps<{
  currentCount: number
}>()

const emit = defineEmits<{
  uploaded: [item: Record<string, unknown>]
}>()

const { t } = useI18n()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previews = ref<
  {
    file: File
    previewUrl: string
    progress: number
    error: string | null
    done: boolean
  }[]
>([])

const remaining = computed(() => MAX_PHOTOS - props.currentCount - previews.value.length)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  input.value = ''
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

function addFiles(files: File[]) {
  const imageFiles = files.filter((f) => ALLOWED_MIME.includes(f.type))
  const invalid = files.length - imageFiles.length
  if (invalid > 0) {
    toast.add({
      color: 'error',
      title: t('portfolio.upload.invalidType'),
    })
  }

  const available = remaining.value
  const toAdd = imageFiles.slice(0, Math.max(0, available))

  for (const file of toAdd) {
    if (file.size > MAX_SIZE_BYTES) {
      toast.add({ color: 'error', title: t('portfolio.upload.tooLarge', { name: file.name }) })
      continue
    }
    const previewUrl = URL.createObjectURL(file)
    const entry = reactive({
      file,
      previewUrl,
      progress: 0,
      error: null as string | null,
      done: false,
    })
    previews.value.push(entry)
    uploadFile(entry)
  }

  if (imageFiles.length > toAdd.length) {
    toast.add({ color: 'warning', title: t('portfolio.upload.limitReached', { max: MAX_PHOTOS }) })
  }
}

async function uploadFile(entry: {
  file: File
  previewUrl: string
  progress: number
  error: string | null
  done: boolean
}) {
  entry.progress = 10

  const formData = new FormData()
  formData.append('file', entry.file)

  const progressInterval = setInterval(() => {
    if (entry.progress < 80) entry.progress += 10
  }, 200)

  try {
    const result = await $fetch('/api/master/portfolio', {
      method: 'POST',
      body: formData,
    })

    entry.progress = 100
    entry.done = true
    emit('uploaded', result as Record<string, unknown>)

    // Clean up object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(entry.previewUrl), 5000)
  } catch (err: unknown) {
    entry.error = (err as { data?: { message?: string } })?.data?.message ?? t('errors.general')
    entry.progress = 0
  } finally {
    clearInterval(progressInterval)
  }
}

function removePreview(index: number) {
  URL.revokeObjectURL(previews.value[index].previewUrl)
  previews.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop zone -->
    <div
      class="relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
      :class="[
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-primary/60',
        remaining <= 0 ? 'pointer-events-none opacity-50' : '',
      ]"
      @click="openFilePicker"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="sr-only"
        @change="onFileInputChange"
      >

      <UIcon
        name="i-heroicons-arrow-up-tray"
        class="mx-auto mb-3 size-10 text-muted"
      />
      <p class="font-medium text-highlighted">
        {{ t('portfolio.upload.dropzone') }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{ t('portfolio.upload.hint') }}
      </p>
      <UButton
        variant="outline"
        size="sm"
        class="mt-4"
        @click.stop="openFilePicker"
      >
        {{ t('portfolio.upload.selectFiles') }}
      </UButton>
      <p class="mt-2 text-xs text-muted">
        {{ t('portfolio.upload.remaining', { remaining, max: MAX_PHOTOS }) }}
      </p>
    </div>

    <!-- Preview grid -->
    <div
      v-if="previews.length"
      class="grid grid-cols-3 gap-2 sm:grid-cols-4"
    >
      <div
        v-for="(p, i) in previews"
        :key="i"
        class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
      >
        <img
          :src="p.previewUrl"
          alt=""
          class="size-full object-cover"
        >

        <!-- Progress overlay -->
        <div
          v-if="!p.done && !p.error"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/50"
        >
          <span class="text-sm font-medium text-white">{{ p.progress }}%</span>
          <div class="mt-2 h-1 w-3/4 overflow-hidden rounded-full bg-white/30">
            <div
              class="h-full bg-white transition-all duration-200"
              :style="{ width: `${p.progress}%` }"
            />
          </div>
        </div>

        <!-- Error overlay -->
        <div
          v-else-if="p.error"
          class="absolute inset-0 flex items-center justify-center bg-red-900/70 p-2"
        >
          <p class="text-center text-xs text-white">
            {{ p.error }}
          </p>
        </div>

        <!-- Done: remove button -->
        <UButton
          v-if="p.done || p.error"
          color="neutral"
          variant="solid"
          size="xs"
          icon="i-heroicons-x-mark"
          class="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
          @click="removePreview(i)"
        />
      </div>
    </div>
  </div>
</template>
