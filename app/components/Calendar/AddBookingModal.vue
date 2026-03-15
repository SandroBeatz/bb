<template>
  <UModal v-model:open="isOpen" :title="$t('calendar.addBooking.title')">
    <template #body>
      <div class="p-4 space-y-4">
        <!-- Client picker -->
        <UFormField :label="$t('calendar.addBooking.clientName')" required>
          <ClientPicker @update:client-id="form.clientId = $event ?? ''" />
        </UFormField>

        <!-- Service -->
        <UFormField :label="$t('calendar.addBooking.service')" required>
          <USelect
            v-model="form.serviceId"
            :items="serviceOptions"
            :placeholder="$t('calendar.addBooking.servicePlaceholder')"
            :loading="loadingServices"
            class="w-full"
          />
        </UFormField>

        <!-- Date & Time -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="$t('calendar.addBooking.date')" required>
            <UInput v-model="form.date" type="date" class="w-full" />
          </UFormField>
          <UFormField :label="$t('calendar.addBooking.time')" required>
            <UInput v-model="form.time" type="time" class="w-full" />
          </UFormField>
        </div>

        <!-- Notes -->
        <UFormField :label="$t('calendar.notes')">
          <UTextarea
            v-model="form.notes"
            :placeholder="$t('calendar.notesPlaceholder')"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <!-- Conflict warning -->
        <UAlert
          v-if="conflictError"
          color="error"
          variant="subtle"
          icon="i-heroicons-exclamation-triangle"
          :title="$t('calendar.addBooking.conflictError')"
        />

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-1">
          <UButton variant="ghost" color="neutral" @click="isOpen = false">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            :disabled="!isFormValid"
            icon="i-heroicons-calendar-days"
            @click="submit"
          >
            {{ $t('calendar.addBooking.submit') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Service } from '~/types'

const props = defineProps<{
  defaultDatetime?: string | null
}>()

const emit = defineEmits<{
  created: []
}>()

const { t } = useI18n()
const toast = useToast()

const isOpen = defineModel<boolean>('open', { required: true })

const form = reactive({
  clientId: '',
  serviceId: '',
  date: '',
  time: '',
  notes: '',
})

const submitting = ref(false)
const conflictError = ref(false)
const loadingServices = ref(false)
const services = ref<Service[]>([])

const serviceOptions = computed(() =>
  services.value
    .filter((s) => s.is_active)
    .map((s) => ({
      label: `${s.name} · ${s.duration_minutes} мин · ${s.price} ₸`,
      value: s.id,
    })),
)

const isFormValid = computed(
  () => form.clientId && form.serviceId && form.date && form.time,
)

watch(isOpen, async (opened) => {
  if (!opened) return
  conflictError.value = false
  form.clientId = ''
  form.serviceId = ''
  form.notes = ''
  if (props.defaultDatetime) {
    const dt = new Date(props.defaultDatetime)
    form.date = dt.toISOString().slice(0, 10)
    form.time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  }
  await loadServices()
})

async function loadServices() {
  loadingServices.value = true
  try {
    services.value = await $fetch<Service[]>('/api/master/services')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loadingServices.value = false
  }
}

async function submit() {
  if (!isFormValid.value) return
  conflictError.value = false
  submitting.value = true
  try {
    const startsAt = new Date(`${form.date}T${form.time}:00`).toISOString()
    await $fetch('/api/master/bookings', {
      method: 'POST',
      body: {
        service_id: form.serviceId,
        starts_at: startsAt,
        client_id: form.clientId,
        notes: form.notes.trim() || undefined,
      },
    })
    toast.add({ title: t('calendar.addBooking.created'), color: 'success' })
    isOpen.value = false
    emit('created')
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 409) {
      conflictError.value = true
    } else {
      toast.add({ title: t('errors.general'), color: 'error' })
    }
  } finally {
    submitting.value = false
  }
}
</script>
