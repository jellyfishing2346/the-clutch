# Contributing to Clutch

Thanks for taking the time to contribute. Clutch is a community-powered project, and good contributions make it stronger.

---

## Before You Start

- Check the [open issues](../../issues) and [roadmap in the README](README.md#-roadmap) to avoid duplicating work.
- For large features, open an issue first to discuss the approach before writing code.
- All contributions must pass `npm run typecheck` and `npm run lint` before being submitted.

---

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Copy the env template and fill in your Supabase + Mapbox keys:
   ```
   apps/web/.env.local
   ```
4. Run the database schema: paste `supabase/setup.sql` into your Supabase SQL editor
5. Start the dev server: `npm run dev`

---

## Branching

| Branch type | Naming convention | Example |
|:---|:---|:---|
| New feature | `feature/short-description` | `feature/task-acceptance` |
| Bug fix | `fix/short-description` | `fix/credits-double-spend` |
| Chore / docs | `chore/short-description` | `chore/update-readme` |

Always branch off `main`.

---

## Commit Style

Use short, imperative subject lines:

```
add task acceptance flow
fix credits not deducting on task post
update RLS policy for task_applications
```

No ticket numbers required. No emoji. Keep it plain and factual.

---

## Pull Requests

- Keep PRs focused — one logical change per PR.
- Fill out the PR template fully: what changed, why, and how to test it.
- Link to the related issue if one exists (`Closes #42`).
- At least one approving review is required before merging.

---

## Code Standards

- **TypeScript strict mode** — no `any`, no `@ts-ignore` without a comment explaining why.
- **Tailwind only** — no inline styles and no new CSS files unless adding `@layer components` utilities.
- **No mock data in production paths** — fixtures live in `packages/shared/src/mock-data.ts` for dev only.
- **Database logic in the database** — counters, triggers, and constraints belong in `supabase/setup.sql`, not in application code.
- **No comments explaining what code does** — rename the variable or function instead. Comments are for non-obvious *why*, not *what*.

---

## What We Welcome

- Roadmap features (task acceptance, messaging, reviews, trust promotion)
- Bug fixes with a reproduction case
- Performance improvements with a measurable before/after
- Accessibility improvements
- Additional NYC borough or neighborhood coverage in constants

## What We Won't Merge

- Features not related to hyperlocal task-sharing
- UI changes without a clear UX rationale
- Dependency additions that can be avoided
- Code that disables RLS policies

---

## Questions?

Open a [GitHub Discussion](../../discussions) or file an issue with the `question` label.
