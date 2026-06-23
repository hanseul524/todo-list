---
name: project-mobile-context
description: Mobile app tech stack, FSD structure, and key implementation rules for the todo-list project
metadata:
  type: project
---

Expo SDK 56 + React Native 0.85.3 + Expo Router v4 (file-based routing) + NativeWind v4 + Zustand v5 + Supabase.

**Why:** Mobile app mirrors the web todo app but uses React Native. FSD (Feature-Sliced Design) is used for both web and mobile.

**Key rules:**
- `EXPO_PUBLIC_` prefix for env vars (not `NEXT_PUBLIC_`)
- `detectSessionInUrl: false` in Supabase client (critical for React Native)
- Date keys via `toLocaleDateString("en-CA")` only — never toISOString()
- No Server Actions (Next.js only); all Supabase calls are direct client calls in `features/*/api/`
- Optimistic updates pattern: update Zustand store first, call API, rollback on error + Alert.alert
- Data loaded in tab screen's `useEffect` (allowed at layout/screen level), not inside component hooks
- GitHub OAuth deep link: `todo-app://auth/callback`
- `@/` alias → `./src/` (tsconfig paths)
- `@todo/types` and `@todo/utils` are workspace packages resolved via tsconfig

**FSD structure:**
- `src/shared/api/` — supabase client
- `src/shared/model/` — Zustand stores (auth, todo, category, calendar, filter)
- `src/entities/todo/ui/` — TodoItem presentational component
- `src/features/*/api/` — Direct Supabase CRUD functions
- `src/features/*/ui/` — Modal forms and buttons
- `src/widgets/` — CalendarWidget (react-native-calendars), TodoList (FlatList), Header
- `app/` — Expo Router pages: _layout, (auth)/*, (tabs)/*, auth/callback

**How to apply:** When modifying mobile app, follow FSD layer rules. Feature API files must not use Server Actions. Stores use session-only state (no persist middleware).
