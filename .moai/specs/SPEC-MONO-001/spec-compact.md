# SPEC-MONO-001 Compact (Run Phase Reference)

**Status**: draft | **Priority**: high | **Date**: 2026-06-23

---

## 1. File Map

### Phase 1: 모노레포 루트

| Action | File | Notes |
|--------|------|-------|
| NEW | `pnpm-workspace.yaml` | apps/*, packages/* |
| NEW | `package.json` (root) | name: todo-list-monorepo, turbo scripts |
| NEW | `turbo.json` | build/dev/lint tasks |

### Phase 2: 웹 앱 이동

| Action | Notes |
|--------|-------|
| MOVE `src/` → `apps/web/src/` | 내부 코드 변경 없음 |
| MOVE `public/` → `apps/web/public/` | |
| MOVE `*.config.*` → `apps/web/` | next/tailwind/postcss |
| MOVE `.env.local` → `apps/web/.env.local` | |
| UPDATE `package.json` → `apps/web/package.json` | name: @todo/web |

### Phase 3: 공유 패키지

| Action | File | Notes |
|--------|------|-------|
| NEW | `packages/types/src/todo.ts` | Todo, Priority types |
| NEW | `packages/types/src/category.ts` | Category types |
| NEW | `packages/types/src/index.ts` | re-exports |
| NEW | `packages/types/package.json` | name: @todo/types |
| NEW | `packages/utils/src/calendarUtils.ts` | getPriorityMapByDate |
| NEW | `packages/utils/src/cn.ts` | cn() utility |
| NEW | `packages/utils/src/index.ts` | re-exports |
| NEW | `packages/utils/package.json` | name: @todo/utils |

### Phase 4-5: 모바일 앱 (apps/mobile)

| Action | File | Notes |
|--------|------|-------|
| NEW | `app.json` | scheme: todo-app (OAuth) |
| NEW | `app/_layout.tsx` | Auth check + session init |
| NEW | `app/(auth)/login.tsx` | |
| NEW | `app/(auth)/signup.tsx` | |
| NEW | `app/(tabs)/index.tsx` | Calendar + TodoList |
| NEW | `app/(tabs)/categories.tsx` | |
| NEW | `app/auth/callback.tsx` | OAuth deep link handler |
| NEW | `src/shared/api/supabase.ts` | SecureStore adapter |
| NEW | `src/shared/model/useTodoStore.ts` | Zustand store |
| NEW | `src/shared/model/useCategoryStore.ts` | Zustand store |
| NEW | `src/shared/model/useCalendarStore.ts` | Zustand store |
| NEW | `src/shared/model/useAuthStore.ts` | Zustand store |
| NEW | `src/shared/model/useFilterStore.ts` | Zustand store |
| NEW | `src/entities/todo/ui/TodoItem.tsx` | RN row style |
| NEW | `src/features/auth/ui/LoginForm.tsx` | RN TextInput |
| NEW | `src/features/todo-create/ui/AddTodoForm.tsx` | |
| NEW | `src/widgets/calendar/ui/CalendarWidget.tsx` | react-native-calendars |
| NEW | `src/widgets/todo-list/ui/TodoList.tsx` | FlatList |

---

## 2. Critical Implementation Details

### 루트 package.json

```json
{
  "name": "todo-list-monorepo",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev:web": "turbo run dev --filter=@todo/web",
    "dev:mobile": "turbo run dev --filter=@todo/mobile",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] }
  }
}
```

### packages/types/package.json

```json
{
  "name": "@todo/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" }
}
```

### packages/utils/package.json

```json
{
  "name": "@todo/utils",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "clsx": "^2",
    "tailwind-merge": "^3",
    "@todo/types": "workspace:*"
  }
}
```

### Mobile Supabase client (src/shared/api/supabase.ts)

```typescript
import { createClient } from "@supabase/supabase-js"
import * as SecureStore from "expo-secure-store"

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### Mobile env vars

`.env` in `apps/mobile/` — prefix는 `EXPO_PUBLIC_` (not `NEXT_PUBLIC_`):
- `EXPO_PUBLIC_SUPABASE_URL=...`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY=...`

### GitHub OAuth (mobile)

```typescript
import { makeRedirectUri, useAuthRequest } from "expo-auth-session"

// scheme: "todo-app" (app.json에 설정)
const redirectUri = makeRedirectUri({ scheme: "todo-app", path: "auth/callback" })

// Supabase 대시보드에 추가 필요:
// Redirect URLs: todo-app://auth/callback
```

### apps/mobile/package.json (key deps)

```json
{
  "name": "@todo/mobile",
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-auth-session": "~6.0.0",
    "expo-web-browser": "~14.0.0",
    "@supabase/supabase-js": "^2.108.2",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.1",
    "react-native-calendars": "^1.1305.0",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-reanimated": "~3.17.0",
    "react-native-safe-area-context": "4.16.0",
    "react-native-screens": "~4.10.0",
    "zustand": "^5.0.14",
    "date-fns": "^4.4.0",
    "@expo/vector-icons": "^14.0.0",
    "@todo/types": "workspace:*",
    "@todo/utils": "workspace:*"
  }
}
```

### apps/mobile/metro.config.js

```javascript
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)
module.exports = withNativeWind(config, { input: "./global.css" })
```

### CalendarWidget (react-native-calendars dot marking)

```typescript
// getPriorityMapByDate 결과를 react-native-calendars markedDates 형식으로 변환
const markedDates = useMemo(() => {
  const map = getPriorityMapByDate(todos)
  return Object.fromEntries(
    Object.entries(map).map(([date, priorities]) => [
      date,
      {
        marked: true,
        dotColor:
          priorities[0] === "high"
            ? "#e5534b"
            : priorities[0] === "medium"
              ? "#d9922a"
              : "#27a644",
      },
    ])
  )
}, [todos])
```

### Mobile todos filtering (same logic as web)

```typescript
const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA")
const filtered = todos.filter(
  (t) => toDateKey(t.created_at) === toDateKey(selectedDate)
)
```

---

## 3. Supabase Dashboard 추가 설정 (수동)

GitHub OAuth Redirect URL 추가:
- `todo-app://auth/callback` (모바일 deep link)

기존 설정 유지:
- `http://localhost:3001/auth/callback` (web dev)
- `https://{project-ref}.supabase.co/auth/v1/callback` (GitHub App)

---

## 4. Quick Acceptance Checklist

- [ ] `pnpm-workspace.yaml`, `turbo.json`, root `package.json` 존재
- [ ] `apps/web/` 에서 기존 웹 앱 정상 동작
- [ ] `apps/mobile/` Expo 앱 생성 완료
- [ ] `packages/types/` — @todo/types import 가능
- [ ] `packages/utils/` — @todo/utils import 가능
- [ ] 모바일: 이메일 로그인 동작
- [ ] 모바일: 투두 CRUD 동작
- [ ] 모바일: 캘린더 날짜 선택 → 필터링
- [ ] TypeScript 에러 0 (각 앱 기준)
- [ ] Supabase Dashboard: `todo-app://auth/callback` 추가됨

---

## 5. Exclusions

- web 앱 내부 import 경로 변경 없음 (`@/` 그대로 유지)
- CI/CD 설정 (향후 SPEC)
- Expo EAS Build / App Store 배포 (향후 SPEC)
- 모바일 DnD (탭 인터랙션으로 대체, 미구현)
- 오프라인 모드 (Supabase 연결 필수)
