---
version: 1.0
date: 2026-04-09
---

# Authentication

> Version 1.0 · 2026-04-09

## Overview

Authentication in BeautyBook is built on **Clerk** as the identity provider and **Supabase** as the database. Clerk handles all credential management — OAuth flows, email/password, session tokens, and JWT issuance. Supabase stores user profiles and enforces Row Level Security (RLS) using the Clerk user ID (`sub` claim from the JWT) as the row owner.

After signing in, the app distinguishes two user states: **new user** (no database record → goes to onboarding) and **existing user** (profile exists → goes to main tabs). This check is the only point where auth and database interact before the main app loads.

## Architecture

### Technology stack

| Layer | Technology | Role |
|---|---|---|
| Identity | Clerk (`@clerk/clerk-expo`) | Credentials, OAuth, sessions, JWT |
| Token storage | `expo-secure-store` | Persists Clerk session tokens on device |
| Database | Supabase | Profiles, master profiles, files |
| Auth bridge | Clerk JWT → Supabase `Authorization` header | Lets Supabase RLS identify the caller |

### Sign-in flow

```
App launch
  └─ ClerkProvider loads (reads token from SecureStore)
       ├─ isLoaded = false → AnimatedSplashOverlay shown
       └─ isLoaded = true
            ├─ isSignedIn = false → redirect to /(auth)
            └─ isSignedIn = true → (auth)/_layout checks DB
                  ├─ master_profiles row exists → /(tabs)
                  └─ no row → /onboarding
```

### Clerk ↔ Supabase bridge

Supabase does not know about Clerk users directly. The bridge works as follows:

1. After sign-in, the app calls `getToken({ template: 'supabase' })` via `useAuth()`.
2. Clerk mints a short-lived JWT using the **"supabase" JWT template** configured in the Clerk dashboard. The template sets the `sub` claim to the Clerk `userId`.
3. Supabase is configured with Clerk as a **third-party auth provider** (JWT secret shared between them).
4. The JWT is passed as `Authorization: Bearer <token>` on every Supabase request.
5. Supabase RLS policies read `auth.jwt() ->> 'sub'` to identify the user and enforce row ownership.

This means **no Supabase session is created** — `persistSession: false`, `autoRefreshToken: false`. Each Supabase client instance lives only for the duration of one component/operation.

### Token caching

Clerk session tokens are persisted in the iOS/Android secure keychain via the `tokenCache` object defined in `src/app/_layout.tsx`:

```ts
const tokenCache = {
  async getToken(key: string) { return SecureStore.getItemAsync(key); },
  async saveToken(key: string, value: string) { SecureStore.setItemAsync(key, value); },
  async clearToken(key: string) { SecureStore.deleteItemAsync(key); },
};
```

This allows the app to restore an authenticated session after a cold start without asking the user to sign in again.

## Configuration

| Variable | Location | Description |
|---|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env` | Clerk publishable key |
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` | Supabase anon key (public) |

Additionally, two things must be configured in external dashboards:

- **Clerk dashboard** — "supabase" JWT template must exist with the `sub` claim set to the user ID.
- **Supabase dashboard** — Clerk must be added as a third-party auth provider (JWT secret from Clerk).

## Usage

### Checking auth state in a component

```ts
import { useAuth } from '@clerk/clerk-expo';

const { isSignedIn, isLoaded, userId } = useAuth();
```

`isLoaded` must be `true` before trusting `isSignedIn`. The root layout renders `AnimatedSplashOverlay` during this period.

### Making an authenticated Supabase query

```ts
import { useSupabase } from '@/hooks/use-supabase';

const { getClient } = useSupabase();

const db = await getClient();                           // fetches fresh Clerk JWT
const { data } = await db.from('profiles').select('*').eq('id', userId);
```

`getClient()` calls `getToken({ template: 'supabase' })` internally and returns a pre-configured Supabase client. Always `await getClient()` — it is async because token fetching is async.

### Public (unauthenticated) Supabase queries

```ts
import { supabase } from '@/lib/supabase';

const { data } = await supabase.from('master_profiles').select('id');
```

`supabase` (from `src/lib/supabase.ts`) is a shared client using only the anon key. Use it only for data not protected by RLS — public master profiles, public listings. Never use it for writes or user-specific reads.

## File Structure

```
src/
├── app/
│   ├── _layout.tsx                  # Root: ClerkProvider, tokenCache, auth guard (redirects to (auth))
│   ├── (auth)/
│   │   ├── _layout.tsx              # Checks DB for master_profiles; routes to tabs or onboarding
│   │   ├── index.tsx                # Welcome screen — Google OAuth, Apple OAuth, email button
│   │   └── email-auth.tsx           # Email sign-in / sign-up / verify flow (3 modes in one screen)
│   └── onboarding.tsx               # 5-step wizard; writes to profiles + master_profiles on submit
├── lib/
│   └── supabase.ts                  # supabase (anon) + createAuthClient(token) factory
└── hooks/
    └── use-supabase.ts              # useSupabase() — wraps getToken + createAuthClient
```

### Database tables involved

| Table | Written by | Purpose |
|---|---|---|
| `profiles` | `onboarding.tsx` | Base user profile: `id` (= Clerk userId), `role`, `full_name`, `username`, `avatar_url`, `email`, `phone` |
| `master_profiles` | `onboarding.tsx` | Master-specific data: `id` (= Clerk userId), `city`, `contacts` (JSON), `work_hours` (JSON) |
| `avatars` (storage bucket) | `onboarding.tsx` | Avatar images at path `{userId}/avatar.{ext}` |

Both tables use the Clerk `userId` as the primary key (`id`). RLS policies on both tables use `auth.jwt() ->> 'sub' = id` to restrict access to the row owner.
