<template>
  <UCalendar
    v-model="internalValue"
    :min-value="minCalendarDate"
    :is-date-unavailable="isDateUnavailableFn"
    :week-starts-on="1"
    :year-controls="false"
    color="primary"
    size="lg"
    class="bb-calendar"
  >
    <template #day="{ day }">
      <span :data-available="isAvailableDate(day) || undefined">{{ day.day }}</span>
    </template>
  </UCalendar>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

const props = defineProps<{
  availableDates?: Date[]
  unavailableDates?: Date[]
  selectedDate?: Date | null
  minDate?: Date
}>()

const emit = defineEmits<{
  select: [date: Date]
}>()

function toCalDate(date: Date): CalendarDate {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function toJsDate(cal: DateValue): Date {
  return new Date(cal.year, cal.month - 1, cal.day)
}

const minCalendarDate = computed(() =>
  toCalDate(props.minDate ?? new Date()),
)

const internalValue = computed<DateValue | undefined>({
  get() {
    return props.selectedDate ? toCalDate(props.selectedDate) : undefined
  },
  set(val: DateValue | undefined) {
    if (val) emit('select', toJsDate(val))
  },
})

function dateSetKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function calDateKey(date: DateValue): string {
  const m = String(date.month).padStart(2, '0')
  const d = String(date.day).padStart(2, '0')
  return `${date.year}-${m}-${d}`
}

const availableSet = computed(
  () => new Set((props.availableDates ?? []).map(dateSetKey)),
)

const unavailableSet = computed(
  () => new Set((props.unavailableDates ?? []).map(dateSetKey)),
)

function isAvailableDate(date: DateValue): boolean {
  return availableSet.value.has(calDateKey(date))
}

function isBusyDate(date: DateValue): boolean {
  return unavailableSet.value.has(calDateKey(date))
}

function isDateUnavailableFn(date: DateValue): boolean {
  return isBusyDate(date)
}
</script>
