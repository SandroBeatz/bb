import { init, type LaunchParams, retrieveLaunchParams } from '@tma.js/sdk'

export const useTelegramApp = () => {
  const isTMA = ref(false)
  const tgUser = ref<LaunchParams['tgWebAppData']['user'] | null>(null)
  const initData = ref<string | null>(null)

  onMounted(() => {
    try {
      init()
      const params = retrieveLaunchParams()
      isTMA.value = true
      tgUser.value = params.tgWebAppData?.user ?? null
      initData.value = params.tgWebAppInitData ?? null
    } catch {
      isTMA.value = false
    }
  })

  return { isTMA, tgUser, initData }
}
