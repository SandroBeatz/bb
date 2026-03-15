/**
 * BeautyBook — Nuxt UI v3 App Config
 * Design System: docs/DESIGN_SPEC.md
 *
 * Assigns semantic color roles and sets global component defaults
 * for a consistent, on-brand look across the entire application.
 */
export default defineAppConfig({
  ui: {
    // ── Color roles ──────────────────────────────────────────────────────────
    colors: {
      primary: 'rose', // Dusty Rose / Mauve (custom shades in main.css)
      secondary: 'stone', // Warm taupe — used for secondary actions
      neutral: 'stone', // All text, borders, bg surfaces → warm stone
      success: 'emerald', // Confirmed bookings, successful payments
      warning: 'amber', // Pending, upcoming reminders
      error: 'red', // Cancellations, validation errors
      info: 'sky', // Neutral hints and informational states
    },

    // ── Global component defaults ─────────────────────────────────────────────

    // Buttons — warm, rounded, confident
    button: {
      slots: {
        base: 'font-sans font-medium text-center justify-center tracking-wide cursor-pointer transition-transform active:scale-[0.97]',
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'solid',
      },
    },

    // Cards — soft radius, warm shadow
    card: {
      slots: {
        root: 'rounded-2xl shadow-sm border border-default bg-default',
        header: 'px-3 py-3 sm:px-5 sm:py-4 border-b border-default',
        body: 'px-3 py-3 sm:px-5 sm:py-4',
        footer: 'px-3 py-3 sm:px-5 sm:py-4 border-t border-default',
      },
    },

    // Inputs — larger touch targets, clear hierarchy
    input: {
      slots: {
        root: 'w-full',
        base: 'font-sans rounded-lg',
      },
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    // Textarea
    textarea: {
      slots: {
        base: 'font-sans rounded-lg resize-none',
      },
      defaultVariants: {
        size: 'md',
        color: 'neutral',
      },
    },

    // Select
    select: {
      slots: {
        base: 'font-sans rounded-lg',
      },
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },

    // Badges — rounded-full for all status / tag badges
    badge: {
      slots: {
        base: 'font-sans font-medium rounded-full',
      },
      defaultVariants: {
        size: 'sm',
        color: 'neutral',
        variant: 'soft',
      },
    },

    // Avatar
    avatar: {
      slots: {
        root: 'rounded-full ring-1 ring-default',
        fallback: 'font-sans font-medium',
      },
      defaultVariants: {
        size: 'md',
      },
    },

    // Modal — centered confirmation dialogs
    modal: {
      slots: {
        content: 'rounded-2xl',
        overlay: 'backdrop-blur-sm',
      },
    },

    // Container — less horizontal padding on mobile
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-3 sm:px-6 lg:px-8',
    },

    // DashboardPanel — less padding on mobile
    dashboardPanel: {
      slots: {
        body: 'flex flex-col flex-1 gap-4 sm:gap-6 overflow-y-auto py-4 px-2 sm:p-6',
      },
    },

    // Drawer — bottom sheet for mobile quick actions
    drawer: {
      slots: {
        content: 'rounded-t-3xl',
      },
    },

    // Tabs — underline style, clean and minimal
    tabs: {
      slots: {
        list: 'border-b border-default rounded-none bg-transparent gap-0 p-0',
        trigger: [
          'font-sans font-medium text-sm text-muted px-4 py-3 rounded-none',
          'border-b-2 border-transparent',
          'data-[state=active]:text-highlighted data-[state=active]:border-primary',
          'hover:text-default transition-colors',
        ].join(' '),
        content: 'pt-4',
      },
    },

    // Toast notifications
    toast: {
      slots: {
        root: 'rounded-xl shadow-lg font-sans',
        title: 'font-semibold text-sm',
      },
      defaultVariants: {
        position: 'bottom-right',
      },
    },

    // Tooltip
    tooltip: {
      slots: {
        content: 'font-sans text-xs rounded-lg px-2.5 py-1.5',
      },
    },

    // Form field labels
    formField: {
      slots: {
        label: 'font-sans font-medium text-sm text-default mb-1',
        hint: 'font-sans text-xs text-muted',
        error: 'font-sans text-xs text-error',
        help: 'font-sans text-xs text-muted',
      },
    },

    // Separator
    separator: {
      slots: {
        border: 'border-default',
        label: 'font-sans text-xs text-muted px-2',
      },
    },

    // Skeleton — shimmer is handled via .skeleton CSS class in main.css
    skeleton: {
      slots: {
        base: 'skeleton',
      },
    },

    // Pagination
    pagination: {
      slots: {
        base: 'font-sans text-sm',
      },
    },

    // Breadcrumb
    breadcrumb: {
      slots: {
        base: 'font-sans text-sm',
        item: 'text-muted hover:text-default transition-colors',
        separator: 'text-muted',
        active: 'text-default font-medium',
      },
    },

    // Dropdown Menu
    dropdownMenu: {
      slots: {
        content: 'rounded-xl shadow-lg border border-default font-sans text-sm',
        item: 'rounded-lg',
        label: 'font-medium text-xs text-muted uppercase tracking-wide px-2 py-1',
      },
    },

    // Navigation Menu (sidebar)
    navigationMenu: {
      slots: {
        base: 'font-sans text-sm',
        link: 'rounded-lg font-medium text-muted hover:text-default hover:bg-muted transition-colors',
        linkActive: 'text-primary bg-primary-50 dark:bg-primary-950/30',
        linkIcon: 'size-5',
      },
    },

    // Accordion (FAQ, expanded sections)
    accordion: {
      slots: {
        root: 'divide-y divide-default',
        item: 'py-0',
        trigger: 'font-sans font-medium text-base py-4 hover:no-underline',
        content: 'font-sans text-sm text-muted pb-4',
      },
    },

    // Alert
    alert: {
      slots: {
        root: 'rounded-xl p-4 font-sans text-sm',
        title: 'font-semibold text-sm',
        description: 'text-sm',
      },
    },

    // Progress (booking flow steps)
    progress: {
      slots: {
        indicator: 'bg-primary rounded-full transition-all duration-300',
      },
    },
  },
})
