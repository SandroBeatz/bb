export default defineNuxtConfig({
  srcDir: 'app',

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  modules: [
    '@nuxtjs/color-mode',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@clerk/nuxt',
    'nuxt-calendar',
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

  nuxtCalendar: {
    timeFormat: '24h',
    weekStartsOn: 1, // Monday
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'bb-color-mode',
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
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    appearance: {
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
    },
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
    clerkWebhookSecret: process.env.NUXT_CLERK_WEBHOOK_SECRET,
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
