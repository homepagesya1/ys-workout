# YS.Workout — Project Analysis

**What it is:** A mobile-first personal workout tracking app. Users create routines, run live workouts, track sets/reps/weight, get real-time PR detection, and review history in a logbook.

---

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** for auth + primary DB (user data, sessions, PRs)
- **Second Supabase project** — read-only exercise library (separate URL/key)
- **IndexedDB** (`idb`) for offline workout persistence
- Tailwind v4 configured, but almost all styling uses inline `style` props with CSS custom properties from `globals.css`
- No external state manager, no chart library, no component library

---

## Architecture Pattern

Every `(app)` route follows: **async Server Component** (`page.tsx`) fetches data → passes as props to `*Client.tsx`. Clean RSC/client split throughout.

---

## Key Features & Files

| Feature | Key File |
|---|---|
| Active workout (most complex) | `WorkoutClient.tsx` |
| Exercise picker (search + filter + infinite scroll) | `AddExerciseModal.tsx` |
| Routine editing | `RoutineEditClient.tsx` |
| Per-exercise analytics (custom bar chart) | `ShowExerciseClient.tsx` |
| PR detection logic | `lib/pr.ts` |
| Offline storage | `lib/indexeddb.ts` |
| Auth guard + approval gate | `middleware.ts` |

---

## Notable Design Decisions

- **Offline-first active workouts** — IDB saved on every state change; Supabase sync every 2 min + on finish
- **PRs written only on finish** — detected live in state, never pollute the DB from abandoned sessions
- **Approval gating** — new users need `profiles.is_approved = true` (admin-flipped) before they can log in
- `stores/workout-store.ts` is empty — no global state management implemented yet, all state is local
- **Custom inline bar chart** — no charting library, just proportional flex divs