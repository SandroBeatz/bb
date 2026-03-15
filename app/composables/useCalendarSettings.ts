export type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'
export type SlotDuration = '00:15:00' | '00:20:00' | '00:30:00' | '01:00:00'

export interface CalendarSettings {
  defaultView: CalendarView
  slotDuration: SlotDuration
}

const DEFAULT: CalendarSettings = {
  defaultView: 'timeGridWeek',
  slotDuration: '00:30:00',
}

export function useCalendarSettings() {
  const settings = useCookie<CalendarSettings>('bb-calendar-settings', {
    default: () => ({ ...DEFAULT }),
    maxAge: 60 * 60 * 24 * 365,
  })

  function setDefaultView(view: CalendarView) {
    settings.value = { ...settings.value, defaultView: view }
  }

  function setSlotDuration(duration: SlotDuration) {
    settings.value = { ...settings.value, slotDuration: duration }
  }

  return { settings, setDefaultView, setSlotDuration }
}
