export default defineNuxtConfig({
  srcDir: 'app',

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@clerk/nuxt',
    '@samk-dev/nuxt-vcalendar',
  ],

  i18n: {
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'ky', language: 'ky-KG', name: 'Кыргызча', file: 'ky.json' },
    ],
    defaultLocale: 'ru',
    strategy: 'prefix_except_default', // Russian (default) uses no prefix, Kyrgyz uses /ky/
    langDir: '../app/locales/',
    lazy: true,
  },

  ui: {
    theme: {
      // Semantic color roles available on all Nuxt UI components
      colors: ['primary', 'secondary', 'neutral', 'success', 'warning', 'error', 'info'],
    },
  },

  css: ['~/assets/css/main.css'],

  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY,
  },

  clerk: {
    appearance: {},
  },

  vite: {
    optimizeDeps: {
      include: [
        '@clerk/vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    clerkSecretKey: process.env.NUXT_CLERK_SECRET_KEY,
    supabaseServiceRoleKey: process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY,
    telegramBotToken: process.env.NUXT_TELEGRAM_BOT_TOKEN,
    resendApiKey: process.env.NUXT_RESEND_API_KEY,
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    },
  },
})
