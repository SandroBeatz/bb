export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@clerk/nuxt',
    '@samk-dev/nuxt-vcalendar',
  ],
  supabase: {
    redirect: false,
  },
  clerk: {
    appearance: {},
  },
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    clerkSecretKey: '',
    supabaseServiceRoleKey: '',
    telegramBotToken: '',
    resendApiKey: '',
    public: {
      clerkPublishableKey: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      telegramBotUsername: '',
    },
  },
})
