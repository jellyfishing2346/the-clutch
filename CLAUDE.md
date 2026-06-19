# Clutch — Project Context

Hyperlocal NYC task marketplace. Neighbors post tasks, other neighbors apply to help,
get paid in cash/credits/exchange/free, and message each other once accepted.

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **apps/web:** Next.js 15 (App Router), Supabase (auth + Postgres + realtime), Tailwind, TypeScript
- **apps/mobile:** Expo Router, React Native, NativeWind — **currently 100% mock data, not wired to the live Supabase backend at all**
- **packages/shared:** shared TypeScript types, constants, and mock data, imported as `'shared'` in both apps

## Conventions to follow for any new code

### Demo mode
Every function in `apps/web/src/lib/api/*.ts` starts with:
```ts
const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
```
and short-circuits to empty/mock values when true. Preserve this in any new API function so the app still runs without env vars configured.

### File structure for a new feature
1. Add types to `packages/shared/src/types.ts` first.
2. DB schema changes go in a new numbered migration under `supabase/migrations/` (e.g. `005_xxx.sql`) — **never edit a committed migration in place**, write a new one even to fix an earlier one.
3. Data access goes in `apps/web/src/lib/api/<feature>.ts` — one function per operation, typed against the shared types, `IS_DEMO` guard at the top of each.
4. Pages go in `apps/web/src/app/(app)/<feature>/page.tsx`, `'use client'`, fetch via the `lib/api` functions in `useEffect`.

### Styling
Tailwind only. Brand color is `clutch-{50-950}` in `tailwind.config.ts`. Reusable classes (`.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.label`) live in `globals.css` — use these instead of rewriting utility classes inline.

## Known gotchas — read before touching RLS or embedded Supabase queries

1. **RLS circular references → `infinite recursion detected in policy for relation X` (Postgres error 42P17).** Happens when table A's policy subqueries table B, and table B's policy subqueries table A. Fix: wrap the cross-table check in a `SECURITY DEFINER` SQL function instead of an inline subquery — it bypasses RLS internally and breaks the cycle. Example already in the codebase: `is_accepted_helper_for_task(task_id, user_id)`, used by the `tasks_select` policy instead of a raw subquery into `task_applications`.

2. **Never embed `supabase.rpc(...)` directly as a field value inside `.update({...})`.** It does not call the RPC and substitute the result — it serializes the query builder object, and the column update silently does nothing (no error thrown). Always call `await supabase.rpc('fn_name', {...})` as its own statement, backed by a `SECURITY DEFINER` SQL function that does the mutation atomically server-side. (We hit this exact bug with credits balance updates in `referrals.ts`, fixed via an `increment_credits(user_id, amount)` Postgres function.)

3. **PostgREST embedded resources type as arrays in TS without generated DB types.** This project doesn't run `supabase gen types typescript` / use `createBrowserClient<Database>(...)`, so every embedded relation (`select('*, foo:bar(...)')`) is inferred by TypeScript as an array, even when it's a to-one relationship at runtime. Cast through `unknown` and defensively `Array.isArray(...)`-check rather than casting straight to the object shape.

4. **`participant_ids` on `conversations` is a plain `UUID[]` column, not a real foreign key.** You cannot embed `profiles!conversations_participant_ids_fkey(*)` — that constraint can't exist (Postgres FKs don't support array-to-many-rows references). Resolve participants with a separate `.in('id', participant_ids)` query against `profiles`.

5. **`tasks_select` RLS allows `status = 'open' OR creator_id = auth.uid() OR` accepted-helper (via the function above).** If a new task status or a new "who should see this task" case gets added, the RLS policy needs to change alongside the app logic, or that user silently gets "Task not found" with no error in the UI.

6. **Every RLS-enabled table needs explicit SELECT/INSERT/UPDATE policies — enabling RLS with no policy denies everything by default, silently.** We found `conversations` (no SELECT/INSERT policy at all) and `task_applications` (no UPDATE policy) missing these after they were added, and every affected function just returned `null`/`[]`/`false` with no visible error. After adding any new table or policy, sanity-check with:
   ```sql
   SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = '<table>';
   ```

7. **Supabase project is on the Free tier.** Expect connection/bandwidth/realtime-channel limits and project auto-pausing on inactivity — don't be surprised by failures under any real load test that don't reproduce with one user.

## Known incomplete or risky areas

- Mobile app (`apps/mobile`) is entirely mock data — not connected to Supabase.
- No notification system (email or push) for new applications, acceptances, or messages.
- No image upload on tasks or profiles, despite UI copy referencing photos.
- No reporting/moderation system, despite the About page FAQ promising one.
- `/tasks` and other browse pages require auth (blocked by middleware) — not indexable or shareable by logged-out users, which works against SEO/virality.
- `processReferral` is called immediately after `signUp()` and depends on an active session existing at that exact moment. If the Supabase project requires email confirmation, this most likely silently no-ops — needs verification against the actual Auth settings.
- No rate limiting on `/api/ai/chat` or `/api/ai/suggest-task`.
- `fetchNearbyTasks` doesn't actually filter by distance despite having a GIST index and `near`/`radiusKm` options defined on it — it's just `ORDER BY created_at`.

## Checklist for any new feature that touches the database

1. Write the migration with **explicit RLS policies for every new table** — don't enable RLS without immediately adding SELECT/INSERT/UPDATE policies.
2. Before wiring up the UI, test the raw SQL in the Supabase SQL editor and confirm policies landed with `SELECT * FROM pg_policies WHERE tablename = '...'`.
3. Check for circular RLS references between the new table and any table it cross-checks (gotcha #1).
4. Add/update types in `packages/shared/src/types.ts`.
5. Write the `api/*.ts` functions with the `IS_DEMO` guard, then the page.
