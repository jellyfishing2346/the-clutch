# Changelog

All notable changes to Clutch are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Task acceptance — poster selects a helper, task moves to `in_progress`
- Task completion — helper marks done, credits transfer, review prompted
- In-app messaging — conversation thread between poster and applicant
- Review submission — post-task rating UI wired to the `reviews` table
- Trust level promotion — auto-upgrade based on `tasks_completed` and `rating_avg`
- Push notifications — alerts for new applicants and task updates
- Infinite scroll — pagination beyond the current 50-task limit

---

## [0.3.0] — 2026-06-09

### Added
- Mobile app skeleton (`apps/mobile`) — Expo + React Native + NativeWind setup
- Turborepo monorepo structure with shared `packages/shared` workspace
- `npm run dev:mobile` and `npm run dev:web` workspace scripts

### Changed
- Migrated to monorepo layout (`apps/web`, `apps/mobile`, `packages/shared`)
- Shared types, constants, and mock data moved to `packages/shared`

---

## [0.2.0] — 2026-05-28

### Added
- Skeleton loading states on all data-fetching pages — no more mock data flash
- `error.tsx` error boundary on the authenticated layout for graceful crash recovery
- `PaymentBadge` component — visual label for cash / credits / exchange / free tasks
- Edit profile modal — update bio, borough, neighborhood, and spoken languages

### Fixed
- Profile page crash when `avatar_url` was null
- Credits balance showing stale value after posting a task without page refresh
- Signup redirect not firing in Safari due to cookie timing issue

### Changed
- All pages now initialize state as `null` / `[]` — real data replaces skeletons, never mock fixtures

---

## [0.1.0] — 2026-05-10

### Added
- Initial release
- Task feed with category, borough, payment type, and sort filters
- Live task map powered by Mapbox GL / `react-map-gl`
- Post a Task — 3-step wizard (details → location → payment)
- Apply to Help — intro message sent to task poster
- Credits economy — earn by helping, spend to post
- Trust profile system — New / Established / Trusted / Verified tiers
- Supabase authentication with SSR-safe session cookies
- Row Level Security on all tables
- Database triggers for `tasks_posted`, `applicant_count`, and `rating_avg`
- Complete idempotent schema in `supabase/setup.sql`
