<script setup lang="ts">
import type { PortfolioItem } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useI18n()
const toast = useToast()

const {
  data: items,
  pending,
} = await useAsyncData<PortfolioItem[]>('master-portfolio', () => $fetch('/api/master/portfolio'))

const portfolio = ref<PortfolioItem[]>(items.value ?? [])
watch(items, (val) => {
  if (val) portfolio.value = val
})

const editMode = ref(false)

function onUploaded(item: Record<string, unknown>) {
  portfolio.value.push(item as unknown as PortfolioItem)
  toast.add({ color: 'success', title: t('portfolio.toast.uploaded') })
}

async function onDelete(id: string) {
  try {
    await $fetch(`/api/master/portfolio/${id}`, { method: 'DELETE' })
    portfolio.value = portfolio.value.filter((p) => p.id !== id)
    toast.add({ color: 'success', title: t('portfolio.toast.deleted') })
  } catch {
    toast.add({ color: 'error', title: t('errors.general') })
  }
}

async function onReorder(reordered: PortfolioItem[]) {
  const previous = [...portfolio.value]
  portfolio.value = reordered
  try {
    await Promise.all(
      reordered.map((item, index) =>
        $fetch(`/api/master/portfolio/${item.id}`, {
          method: 'PATCH',
          body: { sort_order: index },
        }),
      ),
    )
  } catch {
    portfolio.value = previous
    toast.add({ color: 'error', title: t('errors.general') })
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :toggle="false"
        :title="$t('nav.portfolio')"
        icon="i-heroicons-photo"
      >
        <template #right>
          <UButton
            :label="editMode ? $t('portfolio.doneEditing') : $t('portfolio.edit')"
            :icon="editMode ? 'i-heroicons-check' : 'i-heroicons-pencil-square'"
            variant="ghost"
            color="neutral"
            size="sm"
            :disabled="!portfolio.length"
            @click="editMode = !editMode"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="space-y-6 p-4 md:p-6">
      <!-- Upload zone -->
      <PhotoUpload
        :current-count="portfolio.length"
        @uploaded="onUploaded"
      />

      <!-- Grid -->
      <PortfolioGrid
        :items="portfolio"
        :edit-mode="editMode"
        :loading="pending"
        @delete="onDelete"
        @reorder="onReorder"
      />
    </div>
  </UDashboardPanel>
</template>

