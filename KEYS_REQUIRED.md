# BeautyBook (BB) — Required API Keys & Services

---

## 1. Clerk — Authentication

- **Sign up / Dashboard**: https://dashboard.clerk.com
- **Environment variables**:
  - `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Publishable key (safe to expose in browser)
  - `NUXT_CLERK_SECRET_KEY` — Secret key (server-side only, never expose)
- **Where to find**: *Clerk Dashboard → Your Application → API Keys*
- **Required for MVP**: ✅ Yes

---

## 2. Supabase — Database & Storage

- **Sign up / Dashboard**: https://supabase.com/dashboard
- **Environment variables**:
  - `NUXT_PUBLIC_SUPABASE_URL` — Project URL (e.g. `https://xxxx.supabase.co`)
  - `NUXT_PUBLIC_SUPABASE_ANON_KEY` — Anon / public key
  - `NUXT_SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only, full DB access)
- **Where to find**: *Supabase Dashboard → Your Project → Project Settings → API*
- **Required for MVP**: ✅ Yes

---

## 3. Telegram Bot — Bot API via @BotFather

- **Create a bot**: Open Telegram → message [@BotFather](https://t.me/BotFather) → `/newbot`
- **Environment variables**:
  - `NUXT_TELEGRAM_BOT_TOKEN` — HTTP API token provided by BotFather
  - `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME` — Bot username (e.g. `@BeautyBookBot`)
- **Where to find**: BotFather sends the token immediately after `/newbot`. To retrieve later: `/mybots` → select bot → *API Token*
- **Required for MVP**: ⚠️ Optional (required only for Telegram Mini App / notifications feature)

---

## 4. Resend — Transactional Email

- **Sign up / Dashboard**: https://resend.com
- **Environment variables**:
  - `NUXT_RESEND_API_KEY` — API key
- **Where to find**: *Resend Dashboard → API Keys → Create API Key*
- **Required for MVP**: ⚠️ Optional (required for email confirmation / notifications)

---

## 5. Vercel — Deployment

- **Sign up / Dashboard**: https://vercel.com
- **Environment variables**: No `.env` key needed — Vercel reads environment variables configured in the project dashboard.
- **How to deploy**:
  1. Install Vercel CLI: `pnpm add -g vercel`
  2. Link project: `vercel link`
  3. Add environment variables in *Vercel Dashboard → Project → Settings → Environment Variables*
  4. Deploy: `vercel --prod`
- **Required for MVP**: ⚠️ Optional (use for hosting the Nuxt app; alternative: Railway, Render, etc.)

---

## 6. Railway — Bot Hosting

- **Sign up / Dashboard**: https://railway.app
- **Environment variables**: No dedicated `.env` key — set variables in the Railway project dashboard.
- **How to deploy**:
  1. Push code to GitHub
  2. Create a new Railway project → *Deploy from GitHub repo*
  3. Set `NUXT_TELEGRAM_BOT_TOKEN` and any other required variables in *Railway Dashboard → Variables*
  4. Configure the start command to run the bot: `node bot/index.js` (or via `tsx bot/index.ts`)
- **Required for MVP**: ⚠️ Optional (required only if running a persistent Telegram bot process)
