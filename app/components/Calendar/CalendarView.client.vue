<template>
  <div
    ref="containerRef"
    class="h-full fc-beautybook"
    @mousemove="onSlotHover"
    @mouseleave="hoveredTime = ''"
  >
    <FullCalendar :options="calendarOptions" />
    <div v-if="hoveredTime" class="fc-slot-time-hint" :style="hoverPos">
      {{ hoveredTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateClickArg, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import ruLocale from '@fullcalendar/core/locales/ru'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: Record<string, unknown>
}

const props = defineProps<{
  events: CalendarEvent[]
  locale: string
}>()

const emit = defineEmits<{
  eventClick: [info: EventClickArg]
  dateClick: [info: DateClickArg]
  datesSet: [info: DatesSetArg]
}>()

const { settings } = useCalendarSettings()

const containerRef = ref<HTMLElement | null>(null)
const hoveredTime = ref('')
const hoverPos = ref<Record<string, string>>({})

function onSlotHover(e: MouseEvent) {
  const target = e.target as Element

  // Don't show label over events, toolbar, or header
  if (
    target.closest('.fc-event') ||
    target.closest('.fc-toolbar') ||
    target.closest('.fc-col-header')
  ) {
    hoveredTime.value = ''
    return
  }

  const slotRow = target.closest('tr.fc-timegrid-slot-lane[data-time]')
  if (!slotRow || !containerRef.value) {
    hoveredTime.value = ''
    return
  }

  const timeAttr = slotRow.getAttribute('data-time')!
  const [h, m] = timeAttr.split(':')
  hoveredTime.value = `${Number.parseInt(h)}:${m}`

  // Position label inside the specific column cell being hovered
  const colTd = target.closest('td:not(.fc-timegrid-slot-label)')
  if (!colTd) {
    hoveredTime.value = ''
    return
  }

  const tdRect = colTd.getBoundingClientRect()
  const containerRect = containerRef.value.getBoundingClientRect()
  hoverPos.value = {
    top: `${tdRect.top - containerRect.top + tdRect.height / 2}px`,
    left: `${tdRect.left - containerRect.left + 6}px`,
  }
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: settings.value.defaultView,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  timeZone: 'UTC',
  locale: props.locale === 'ru' ? ruLocale : undefined,
  firstDay: 1,
  slotMinTime: '07:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: settings.value.slotDuration,
  // Time axis label format: 9:00  14:00 (no leading zero, no AM/PM)
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  },
  allDaySlot: false,
  height: '100%',
  selectable: false,
  nowIndicator: true,
  events: props.events,
  eventClick: (info: EventClickArg) => emit('eventClick', info),
  dateClick: (info: DateClickArg) => emit('dateClick', info),
  datesSet: (info: DatesSetArg) => emit('datesSet', info),
}))
</script>

<style>
.fc-beautybook {
  --fc-border-color: var(--ui-border);
  --fc-button-bg-color: transparent;
  --fc-button-border-color: var(--ui-border);
  --fc-button-hover-bg-color: var(--ui-bg-elevated);
  --fc-button-hover-border-color: var(--ui-border);
  --fc-button-active-bg-color: var(--ui-bg-elevated);
  --fc-button-text-color: var(--ui-text);
  --fc-today-bg-color: color-mix(in srgb, var(--ui-primary) 6%, transparent);
  --fc-now-indicator-color: var(--ui-primary);
  --fc-event-border-color: transparent;
  --fc-page-bg-color: var(--ui-bg);
  --fc-neutral-bg-color: var(--ui-bg-elevated);
}

.fc-beautybook .fc-toolbar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.fc-beautybook .fc-button {
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  box-shadow: none;
  text-transform: none;
}

.fc-beautybook .fc-button:focus {
  box-shadow: none;
  outline: none;
}

.fc-beautybook .fc-button-primary:not(:disabled).fc-button-active,
.fc-beautybook .fc-button-primary:not(:disabled):active {
  background-color: var(--ui-primary);
  border-color: var(--ui-primary);
  color: white;
}

.fc-beautybook .fc-col-header-cell-cushion,
.fc-beautybook .fc-timegrid-axis-cushion,
.fc-beautybook .fc-timegrid-slot-label-cushion {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}

.fc-beautybook .fc-event {
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.fc-beautybook .fc-event-title {
  font-weight: 600;
  padding: 0 2px;
}

.fc-beautybook .fc-timegrid-event {
  border-radius: 0.375rem;
}

.fc-beautybook .fc-daygrid-event {
  border-radius: 0.375rem;
}

.fc-beautybook .fc-scrollgrid {
  border-radius: 0;
}

.fc-beautybook th,
.fc-beautybook td {
  border-color: var(--ui-border);
}

/* ── Slot hover & active ──────────────────────────────────────── */
.fc-beautybook .fc-timegrid-slot-lane {
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.fc-beautybook .fc-timegrid-slot-lane:hover {
  background-color: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.fc-beautybook .fc-timegrid-slot-lane:active {
  background-color: color-mix(in srgb, var(--ui-primary) 16%, transparent);
}

/* ── Day grid (month view) cell hover & active ───────────────── */
.fc-beautybook .fc-daygrid-day {
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.fc-beautybook .fc-daygrid-day:hover {
  background-color: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.fc-beautybook .fc-daygrid-day:active {
  background-color: color-mix(in srgb, var(--ui-primary) 16%, transparent);
}

/* ── Hover time hint ──────────────────────────────────────────── */
.fc-slot-time-hint {
  position: absolute;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  color: var(--ui-primary);
  pointer-events: none;
  transform: translateY(-50%);
  z-index: 5;
}
</style>
