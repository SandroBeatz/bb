import { updateClerkOptions } from '@clerk/vue'

const LIGHT_APPEARANCE = {
  variables: {
    colorPrimary: '#C85C82',
    colorBackground: '#FAF8F5',
    colorInputBackground: '#FFFFFF',
    colorText: '#1C1917',
    colorTextSecondary: '#78716C',
    colorNeutral: '#78716C',
    borderRadius: '0.75rem',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontFamilyButtons: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
}

const DARK_APPEARANCE = {
  variables: {
    colorPrimary: '#C85C82',
    colorBackground: '#1A1612',
    colorInputBackground: '#231D18',
    colorText: '#F5F0EC',
    colorTextSecondary: '#A8998E',
    colorNeutral: '#78716C',
    borderRadius: '0.75rem',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontFamilyButtons: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
}

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  const clerk = useClerk()

  watch(
    [clerk, () => colorMode.value],
    ([instance, mode]) => {
      if (!instance?.loaded) return
      updateClerkOptions({ appearance: mode === 'dark' ? DARK_APPEARANCE : LIGHT_APPEARANCE })
    },
    { immediate: true },
  )
})
