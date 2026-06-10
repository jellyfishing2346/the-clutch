<div align="center">

# 🫶 Clutch

### *Your neighbor is ready to help. Are you?*

Clutch is a hyperlocal task-sharing platform built for New York City — connecting real neighbors for everyday tasks, paid in cash, credits, or community goodwill.

<br />

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<br />

> *Carrying groceries, fixing Wi-Fi, walking dogs, tutoring kids —*
> *Clutch turns your block into a community that actually shows up.*

</div>

---

## ✦ What is Clutch?

Most apps connect you to strangers. **Clutch connects you to neighbors.**

Post a task — anything from "help me carry boxes up four flights" to "fix my router" — and someone down the street will offer to help. They earn **Clutch Credits**. You get what you need. The neighborhood gets a little stronger.

A built-in trust system means sensitive tasks only go to people who've earned it. A credits economy means helping someone today pays forward to when *you* need help tomorrow.

**Built for all five NYC boroughs. Free to join. Powered by community.**

---

## ✦ Core Features

```
📍 Live Task Map        Browse open tasks on a Mapbox-powered neighborhood map
📋 Task Feed            Filter by category, borough, payment type, and sort order
🚀 Post a Task          3-step wizard — details, location, payment
🤝 Apply to Help        Send an intro message; poster picks their helper
◈  Credits Economy      Earn by helping, spend to get help
👤 Trust Profiles       4-tier reputation system with ratings and reviews
✏️  Edit Profile         Update bio, borough, neighborhood, and spoken languages
⚡ Error Boundaries     Graceful crash recovery — no blank white screens
```

---

## ✦ The Credits Economy

Clutch Credits are the community currency that power the platform. You earn them by being a good neighbor. You spend them when you need one.

| Action | Credits |
|:---|:---:|
| 🎁 Welcome bonus — one time on signup | **+20 CR** |
| 🤝 Help with a free task | **+10 CR** |
| ⭐ Receive a 5-star review | **+5 CR** |
| 📮 Post a simple task (errands, delivery) | **−5 CR** |
| 🔧 Post a moderate task (cleaning, tech help) | **−15 CR** |
| ⚡ Post a skilled task (repairs, tutoring) | **−30 CR** |

---

## ✦ The Trust System

Not every task needs the same level of trust. Picking up groceries is different from letting someone into your apartment. Clutch's four-tier system matches helpers to tasks by reputation.

| Badge | Level | How you earn it |
|:---:|:---|:---|
| ○ | **New** | Email verified — anyone can join |
| ◆ | **Established** | 3+ completed tasks · Rating 4.0+ |
| ★ | **Trusted** | 10+ completed tasks · Rating 4.5+ · No reports |
| ✓ | **Verified** | Government ID verified · Background check passed |

Each task category has a required trust level baked in. Simple tasks accept anyone. Skilled or in-home tasks require Trusted or Verified helpers — automatically enforced at the database level.

---

## ✦ Tech Stack

### Frontend

| | Technology | Why |
|:---:|:---|:---|
| 🖼️ | **Next.js 15** (App Router) | Server components, file-based routing, built-in image optimization |
| 🔷 | **TypeScript 5** | Strict mode across the entire codebase |
| 🎨 | **Tailwind CSS v3** | Utility-first with custom `@layer components` for `.btn-*`, `.card`, `.input` |
| 🗺️ | **Mapbox GL** via `react-map-gl` | Interactive task map with marker clustering |
| ✍️ | **Poppins** | Clean, modern typeface from Google Fonts |

### Backend

| | Technology | Why |
|:---:|:---|:---|
| 🟢 | **Supabase** | PostgreSQL database, auth, realtime subscriptions |
| 🔐 | **Supabase Auth** | Email/password with SSR-safe session cookies |
| 📡 | **`@supabase/ssr`** | Separate browser and server client factories |
| 🔒 | **Row Level Security** | Every table has RLS — data access enforced at the database layer |

### Monorepo

| | Technology | Why |
|:---:|:---|:---|
| ⚡ | **Turborepo** | Parallel builds, shared cache, workspace orchestration |
| 📦 | **npm workspaces** | Shared `packages/shared` for types and constants |

---

## ✦ Project Structure

```
the-clutch/
│
├── apps/
│   └── web/                         # Next.js 15 web application
│       └── src/
│           ├── app/
│           │   ├── (app)/            # 🔒 Authenticated route group
│           │   │   ├── home/         #    Map + live task feed
│           │   │   ├── tasks/        #    Browse, detail, and post new task
│           │   │   ├── profile/[id]/ #    Public profile + edit modal
│           │   │   ├── credits/      #    Balance + transaction history
│           │   │   ├── error.tsx     #    Error boundary (crash recovery UI)
│           │   │   └── layout.tsx    #    Shared layout with Navbar
│           │   ├── login/            # 🌐 Public — email/password login
│           │   ├── signup/           # 🌐 Public — account creation
│           │   └── page.tsx          # 🌐 Public — landing page
│           │
│           ├── components/
│           │   ├── layout/           # Navbar (desktop top + mobile bottom)
│           │   ├── map/              # TaskMap — Mapbox integration
│           │   ├── tasks/            # TaskCard
│           │   └── ui/               # Avatar, TrustBadge, StarRating, PaymentBadge
│           │
│           ├── lib/
│           │   ├── api/              # fetchNearbyTasks, fetchProfile, createTask, etc.
│           │   ├── supabase/         # createClient (browser) + createClient (server)
│           │   └── utils.ts          # cn(), formatRelativeTime(), getPaymentLabel()
│           │
│           └── middleware.ts         # Protects all (app) routes — redirects to /login
│
├── packages/
│   └── shared/                      # Internal npm package: "shared"
│       └── src/
│           ├── types.ts              # All TypeScript interfaces and union types
│           ├── constants.ts          # Categories, trust levels, credits config, boroughs
│           └── mock-data.ts          # Dev fixture data
│
└── supabase/
    └── setup.sql                    # Complete, idempotent DB schema — paste & run
```

---

## ✦ Database Architecture

The entire schema lives in [`supabase/setup.sql`](supabase/setup.sql). It's designed to be idempotent — you can run it multiple times without errors, using `IF NOT EXISTS`, `OR REPLACE`, and `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` blocks throughout.

### Tables at a glance

```
auth.users  (Supabase managed)
    │
    └──▶  profiles          User identity, stats, trust level, credits balance
               │
               ├──▶  tasks                Posted tasks with location (JSONB), payment, status
               │         │
               │         └──▶  task_applications   Helper applications with status
               │
               ├──▶  reviews              Ratings + comments between users
               ├──▶  credits_transactions Ledger of every credit earned or spent
               └──▶  messages             Conversation messages (schema ready)
```

### Table reference

<details>
<summary><strong>profiles</strong> — one row per user</summary>

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | UUID PK | — | References `auth.users` |
| `name` | TEXT | `''` | Captured from signup metadata |
| `avatar_url` | TEXT | NULL | |
| `bio` | TEXT | NULL | |
| `neighborhood` | TEXT | NULL | |
| `borough` | TEXT | NULL | |
| `credits_balance` | INTEGER | `20` | Welcome bonus; never goes below 0 |
| `trust_level` | ENUM | `'new'` | `new \| established \| trusted \| verified` |
| `rating_avg` | NUMERIC(3,2) | `0` | Recalculated by trigger after each review |
| `rating_count` | INTEGER | `0` | |
| `tasks_completed` | INTEGER | `0` | |
| `tasks_posted` | INTEGER | `0` | Incremented by trigger on task insert |
| `languages` | TEXT[] | `{"en"}` | ISO 639-1 codes |
| `is_id_verified` | BOOLEAN | `false` | Set after ID check |

</details>

<details>
<summary><strong>tasks</strong> — open task listings</summary>

| Column | Type | Notes |
|:---|:---|:---|
| `id` | UUID PK | `gen_random_uuid()` |
| `creator_id` | UUID FK | References `profiles` |
| `title` | TEXT | 3–100 characters |
| `description` | TEXT | 5–600 characters |
| `category` | ENUM | 12 categories |
| `required_trust_level` | ENUM | Minimum helper trust level |
| `location` | JSONB | `{ "lat": 40.78, "lng": -73.97 }` — no PostGIS dependency |
| `address` | TEXT | Approximate landmark |
| `borough` | TEXT | One of the 5 NYC boroughs |
| `payment_type` | ENUM | `cash \| credits \| exchange \| free` |
| `payment_amount` | NUMERIC | USD for cash tasks |
| `credits_amount` | INTEGER | Credits for credits tasks |
| `status` | ENUM | `open \| in_progress \| completed \| cancelled` |
| `applicant_count` | INTEGER | Incremented by trigger |
| `scheduled_for` | TIMESTAMPTZ | Optional scheduled time |

</details>

<details>
<summary><strong>task_applications</strong> — helper applications</summary>

| Column | Type | Notes |
|:---|:---|:---|
| `id` | UUID PK | |
| `task_id` | UUID FK | References `tasks` |
| `applicant_id` | UUID FK | References `profiles` |
| `message` | TEXT | Optional introduction |
| `status` | ENUM | `pending \| accepted \| rejected` |

</details>

<details>
<summary><strong>reviews</strong> — post-task ratings</summary>

| Column | Type | Notes |
|:---|:---|:---|
| `reviewer_id` | UUID FK | |
| `reviewee_id` | UUID FK | |
| `task_id` | UUID FK | |
| `rating` | INTEGER | 1–5 |
| `comment` | TEXT | |

</details>

<details>
<summary><strong>credits_transactions</strong> — full credits ledger</summary>

| Column | Type | Notes |
|:---|:---|:---|
| `user_id` | UUID FK | |
| `amount` | INTEGER | Positive = earned, negative = spent |
| `type` | ENUM | `earned \| spent \| bonus` |
| `description` | TEXT | Human-readable label |
| `task_id` | UUID | Nullable — links transaction to a task |

</details>

### Database Triggers

All business logic that must be consistent is handled at the database level, not the application level.

| Trigger | Fires on | What it does |
|:---|:---|:---|
| `handle_new_user` | `auth.users` INSERT | Creates profile + grants +20 CR welcome bonus |
| `increment_tasks_posted` | `tasks` INSERT | Bumps `profiles.tasks_posted` for the creator |
| `increment_applicant_count` | `task_applications` INSERT | Bumps `tasks.applicant_count` |
| `update_user_rating` | `reviews` INSERT | Recalculates `rating_avg` and `rating_count` on the reviewee |

### Row Level Security

RLS is enabled on every table. No client can bypass it.

| Table | Read | Write |
|:---|:---|:---|
| `profiles` | Anyone | Owner only |
| `tasks` | Anyone (open tasks) | Authenticated users; creator to update/delete |
| `task_applications` | Applicant or task creator | Applicant to insert |
| `reviews` | Anyone | Reviewer to insert; no edits or deletes |
| `credits_transactions` | Owner only | No client inserts (triggers only) |

---

## ✦ Authentication Flow

```
User fills signup form
        │
        ▼
supabase.auth.signUp()  ←── { name, borough, neighborhood } in raw_user_meta_data
        │
        ▼
Postgres trigger: handle_new_user
  ├── INSERT INTO profiles (id, name, borough, neighborhood, ...)
  └── INSERT INTO credits_transactions (type: 'bonus', amount: 20)
        │
        ▼
Session cookie set via @supabase/ssr
        │
        ▼
middleware.ts runs on every request
  ├── Public path (/login, /signup, /) → pass through
  └── Protected path → read session cookie
            ├── Valid session → continue
            └── No session → redirect to /login
```

Two separate Supabase client factories prevent cookie/session issues:

- **`lib/supabase/client.ts`** → `createBrowserClient()` — used in `'use client'` components
- **`lib/supabase/server.ts`** → `createServerClient()` — used in Server Components and middleware

---

## ✦ Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 10+
- A free [Supabase](https://supabase.com) project
- A free [Mapbox](https://mapbox.com) account

### 1 — Install

```bash
git clone https://github.com/your-username/the-clutch.git
cd the-clutch
npm install
```

### 2 — Configure environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
```

Your Supabase URL and anon key are in **Project Settings → API**.

> **No credentials?** The app runs in demo mode — auth is bypassed, the map is hidden, and all data fetches return empty results. Useful for previewing the UI without a backend.

### 3 — Set up the database

1. Open your Supabase project → **SQL Editor**
2. Paste [`supabase/setup.sql`](supabase/setup.sql) and click **Run**

All tables, enums, indexes, RLS policies, and triggers are created in one shot. Safe to re-run.

### 4 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — go to `/signup`, create an account, and your 20 welcome credits will already be waiting.

---

## ✦ Scripts

**From the repo root:**

| Command | Description |
|:---|:---|
| `npm run dev` | Start all apps in development mode |
| `npm run dev:web` | Start only the web app |
| `npm run build` | Production build all apps |
| `npm run build:web` | Production build web only |
| `npm run lint` | ESLint across all packages |
| `npm run format` | Prettier format all TS and MD files |

**From `apps/web/`:**

| Command | Description |
|:---|:---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` — type check without building |

---

## ✦ Design Decisions

**Why JSONB instead of PostGIS for location?**
Task coordinates are stored as `{ "lat": number, "lng": number }` in a JSONB column. PostGIS adds a database extension dependency and returns locations as WKB binary that requires deserialization. Since Clutch doesn't need native spatial queries like `ST_DWithin`, JSONB gives simpler reads, simpler writes, and zero setup friction.

**Why the `(app)` route group?**
Next.js route groups use parentheses to organize files without affecting the URL. Everything inside `app/(app)/` is served at the root path — `/home`, `/tasks`, `/profile` — not `/app/home`. This keeps the navbar layout shared across all authenticated pages with a single `layout.tsx`.

**Why skeleton loading instead of mock data initialization?**
Previously, every page initialized state with fixture data, then replaced it when the real API responded. Users would see "Alex Rivera's" tasks appear then swap to their own. Now every page starts with `null` / `[]`, shows animated skeleton placeholders, and renders real data only. Errors surface as empty states rather than silently staying as fake data.

**Why database triggers for counters?**
`tasks_posted`, `applicant_count`, and `rating_avg` are updated by Postgres triggers, not application code. This makes the counts consistent regardless of which client touches the database — direct SQL, server functions, or the web app — and prevents race conditions from concurrent writes.

---

## ✦ Roadmap

The data model and types already support these features. Building them is the next chapter.

- [ ] **Task acceptance** — poster selects a helper, task moves to `in_progress`
- [ ] **Task completion** — helper marks done, credits transfer, review prompted
- [ ] **In-app messaging** — conversation thread between poster and applicant
- [ ] **Review submission** — post-task rating UI wired to the `reviews` table
- [ ] **Trust level promotion** — auto-upgrade based on `tasks_completed` and `rating_avg`
- [ ] **ID verification flow** — government ID upload and verification pipeline
- [ ] **Push notifications** — alerts for new applicants and task updates
- [ ] **Infinite scroll** — pagination beyond the current 50-task limit

---

## ✦ Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — branching conventions, code standards, and what we will and won't merge.

---

## ✦ License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Clutch** — Built with care for the city that never stops needing neighbors.

*New York City · All 5 boroughs · Free to join*

</div>
