<template>
  <UModal v-model:open="store.isOpen" :title="$t('checkout.title')">
    <template #body>
      <div class="px-4 pt-2 pb-4">

        <p v-if="bookingInfo" class="text-sm text-muted mb-4">
          {{ $t('checkout.sessionWith', { client: bookingInfo.clientName }) }}
          &mdash; {{ bookingInfo.serviceName }}
        </p>

        <UForm :schema="schema" :state="formState" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('checkout.amount')" name="amount" required>
            <UInput
              v-model="formState.amount"
              inputmode="decimal"
              :placeholder="$t('checkout.amountPlaceholder')"
              size="lg"
              class="w-full"
              :ui="{ base: 'text-2xl font-semibold' }"
            />
          </UFormField>

          <UFormField :label="$t('checkout.paymentType')" name="paymentTypeId" required>
            <USelect
              v-model="formState.paymentTypeId"
              :items="paymentTypeOptions"
              :placeholder="$t('checkout.paymentTypePlaceholder')"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('checkout.note')" name="note">
            <UTextarea
              v-model="formState.note"
              :placeholder="$t('checkout.notePlaceholder')"
              size="lg"
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <UAlert
            v-if="store.paymentTypes.length === 0 && !loadingPaymentTypes"
            color="warning"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            :description="$t('checkout.noPaymentTypes')"
          />

          <div class="flex gap-3 pt-2 pb-4">
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              size="lg"
              class="flex-1"
              @click="store.isOpen = false"
            >
              {{ $t('common.cancel') }}
            </UButton>
            <UButton
              type="submit"
              color="success"
              size="lg"
              class="flex-1"
              :loading="store.loading"
              :disabled="store.paymentTypes.length === 0"
            >
              {{ $t('checkout.confirm') }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'

interface BookingInfo {
  id: string
  serviceName: string
  clientName: string
  price: number
}

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()
const toast = useToast()

const store = useQuickCheckout()

const loadingPaymentTypes = ref(false)

const bookingInfo = computed<BookingInfo | null>(() => {
  if (!store.booking) return null
  const b = store.booking as typeof store.booking & {
    services?: { name: string; price: number } | null
    profiles?: { full_name: string } | null
  }
  return {
    id: b.id,
    serviceName: b.services?.name ?? '',
    clientName: b.profiles?.full_name ?? '',
    price: b.services?.price ?? 0,
  }
})

const paymentTypeOptions = computed(() =>
  store.paymentTypes.filter((pt) => pt.is_active).map((pt) => ({ label: pt.name, value: pt.id })),
)

const schema = z.object({
  amount: z.coerce.number().positive(t('checkout.validation.amountPositive')),
  paymentTypeId: z.string().min(1, t('checkout.validation.paymentTypeRequired')),
  note: z.string().optional(),
})

const defaultState = () => ({
  amount: undefined as number | undefined,
  paymentTypeId: '' as string,
  note: '' as string,
})

const formState = reactive(defaultState())

watch(
  () => store.isOpen,
  async (open) => {
    if (open) {
      Object.assign(formState, defaultState())
      if (bookingInfo.value) {
        formState.amount = bookingInfo.value.price
      }
      if (store.paymentTypes.length === 0) {
        loadingPaymentTypes.value = true
        await store.fetchPaymentTypes()
        loadingPaymentTypes.value = false
      }
      if (paymentTypeOptions.value.length > 0) {
        formState.paymentTypeId = paymentTypeOptions.value[0]?.value ?? ''
      }
    }
  },
)

async function onSubmit() {
  if (!bookingInfo.value) return
  try {
    await store.submitCheckout(
      bookingInfo.value.id,
      Number(formState.amount),
      formState.paymentTypeId,
      formState.note || undefined,
    )
    toast.add({ title: t('checkout.success'), color: 'success' })
    emit('success')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
}
</script>
