---
name: project-clutch
description: Clutch — hyperlocal NYC community task marketplace (Project Alpaca final project)
metadata:
  type: project
---

Clutch is a hyperlocal marketplace connecting NYC neighbors for everyday tasks (carrying groceries, tech help, dog walks, etc.). Built for Project Alpaca Cohort 5 final project.

**Why:** Address community isolation and the awkwardness of asking for local help. Initially targeting Manhattan and Queens neighborhoods (Astoria, Sunnyside, Jackson Heights, Harlem).

**How to apply:** All suggestions should consider the target audience (older residents, immigrants, multilingual users), accessibility (colorblind-safe), and the trust model.

**Stack:**
- Monorepo: Turborepo + npm workspaces (`/the-clutch`)
- Web: Next.js 15, TypeScript, Tailwind CSS, Supabase SSR (`apps/web`)
- Mobile: Expo + React Native, NativeWind, Expo Router (`apps/mobile`)
- Shared: Types, constants, mock data (`packages/shared`)
- DB: Supabase (PostgreSQL + PostGIS), migrations in `supabase/migrations/`

**Key design decisions:**
- Blues/purples brand palette, Poppins font
- Trust levels (new → established → trusted → verified) determine task eligibility
- Credits system: earn by helping free tasks (+10 CR), spend to post tasks
- Demo mode: app works fully with mock data when no Supabase env vars are set
- Env template: `apps/web/.env.local.example`

**Run commands:**
- Web dev: `npm run dev:web` from root (or `cd apps/web && npm run dev`)
- Mobile: `cd apps/mobile && npx expo start`
