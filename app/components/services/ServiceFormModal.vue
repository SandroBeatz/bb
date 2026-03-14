<template>
  <UModal
    v-model:open="open"
    :title="service ? $t('services.form.titleEdit') : $t('services.form.titleCreate')"
  >
    <template #body>
      <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
        <UFormField :label="$t('services.form.name')" name="name" required>
          <UInput
            v-model="formState.name"
            :placeholder="$t('services.form.namePlaceholder')"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('services.form.description')" name="description">
          <UTextarea
            v-model="formState.description"
            :placeholder="$t('services.form.descriptionPlaceholder')"
            size="lg"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('services.form.price')" name="price" required>
          <UInput
            v-model="formState.price"
            type="number"
            inputmode="decimal"
            :placeholder="$t('services.form.pricePlaceholder')"
            size="lg"
            class="w-full"
            :min="0"
          />
        </UFormField>

        <UFormField :label="$t('services.form.duration')" name="duration_minutes" required>
          <USelect
            v-model="formState.duration_minutes"
            :items="durationOptions"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="flex gap-3 pt-2">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            size="lg"
            class="flex-1"
            @click="open = false"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="flex-1"
            :loading="loading"
          >
            {{ service ? $t('services.form.update') : $t('services.form.save') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  is_active: boolean
}

const props = defineProps<{
  service?: Service | null
}>()

const emit = defineEmits<{
  saved: [service: Service]
}>()

const { t } = useI18n()
const toast = useToast()

const open = defineModel<boolean>('open', { default: false })

const schema = z.object({
  name: z.string().min(1, t('services.validation.nameRequired')),
  description: z.string().optional(),
  price: z.coerce.number().positive(t('services.validation.pricePositive')),
  duration_minutes: z.coerce.number().positive(t('services.validation.durationRequired')),
})

const durationOptions = computed(() =>
  [15, 30, 45, 60, 90, 120].map((min) => ({
    label: `${min} ${t('pages.masterProfile.services.duration')}`,
    value: min,
  })),
)

const defaultState = () => ({
  name: '',
  description: '',
  price: undefined as number | undefined,
  duration_minutes: 60 as number,
})

const formState = reactive(defaultState())
const loading = ref(false)

watch(
  () => props.service,
  (svc) => {
    if (svc) {
      formState.name = svc.name
      formState.description = svc.description ?? ''
      formState.price = svc.price
      formState.duration_minutes = svc.duration_minutes
    } else {
      Object.assign(formState, defaultState())
    }
  },
  { immediate: true },
)

watch(open, (val) => {
  if (val && !props.service) {
    Object.assign(formState, defaultState())
  }
})

async function onSubmit() {
  loading.value = true
  try {
    const body = {
      name: formState.name,
      description: formState.description || null,
      price: Number(formState.price),
      duration_minutes: Number(formState.duration_minutes),
    }

    let result: Service
    if (props.service) {
      result = await $fetch<Service>(`/api/master/services/${props.service.id}`, {
        method: 'PATCH',
        body,
      })
    } else {
      result = await $fetch<Service>('/api/master/services', {
        method: 'POST',
        body,
      })
    }

    emit('saved', result)
    open.value = false
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
