# Implementation Plan: SPEC-MONO-001

## Overview

단일 Next.js 프로젝트를 Turborepo 기반 모노레포로 전환하고, Expo React Native 모바일 앱을 추가하는 구현 계획.

---

## Phase 1: 모노레포 루트 설정 (Priority: High)

1. `pnpm-workspace.yaml` 생성
2. 루트 `package.json` 생성 (name: todo-list-monorepo)
3. `turbo.json` 생성
4. Turborepo 루트 설치: `pnpm add -D turbo -w`
5. `apps/`, `packages/` 디렉터리 생성

---

## Phase 2: 웹 앱 이동 (Priority: High)

1. `apps/web/` 디렉터리 생성
2. 현재 루트의 모든 파일 → `apps/web/`로 이동:
   - `src/` → `apps/web/src/`
   - `public/` → `apps/web/public/`
   - `package.json` → `apps/web/package.json` (name: @todo/web 으로 변경)
   - `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc`, `components.json`
   - `.env.local` → `apps/web/.env.local`
3. 루트에서 `apps/web/node_modules` 제거 후 `pnpm install`
4. `pnpm --filter @todo/web dev` 검증

---

## Phase 3: 공유 패키지 생성 (Priority: High)

### packages/types/

```
packages/types/
  package.json    (name: @todo/types)
  tsconfig.json
  src/
    todo.ts       (Todo, Priority, CreateTodoInput, UpdateTodoInput)
    category.ts   (Category, CreateCategoryInput)
    index.ts      (re-exports)
```

- web app의 `src/entities/*/model/types.ts` 내용 복사 (web 내부는 그대로 유지)

### packages/utils/

```
packages/utils/
  package.json    (name: @todo/utils, peerDeps: @todo/types)
  tsconfig.json
  src/
    calendarUtils.ts  (getPriorityMapByDate — copied from web)
    cn.ts             (clsx + tailwind-merge)
    index.ts
```

---

## Phase 4: Expo 모바일 앱 생성 (Priority: High)

```bash
npx create-expo-app@latest apps/mobile --template blank-typescript
```

그 후 설치:
- `expo-router@4`
- `nativewind@4` + `tailwindcss`
- `@supabase/supabase-js`
- `expo-secure-store`
- `expo-auth-session`
- `react-native-calendars`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `zustand`
- `@todo/types` + `@todo/utils` (workspace 참조)
- `@expo/vector-icons`
- `date-fns`

---

## Phase 5: 모바일 앱 구현 (Priority: High)

순서: shared → entities → features → widgets → app (pages)

### shared 레이어
- `src/shared/api/supabase.ts` (mobile Supabase client with SecureStore)
- `src/shared/model/useTodoStore.ts` (web과 동일 interface)
- `src/shared/model/useCategoryStore.ts`
- `src/shared/model/useCalendarStore.ts`
- `src/shared/model/useAuthStore.ts`
- `src/shared/model/useFilterStore.ts`

### entities 레이어
- `src/entities/todo/ui/TodoItem.tsx` (RN StyleSheet 기반 행 스타일)
- `src/entities/todo/ui/PriorityBadge.tsx`
- `src/entities/category/ui/CategoryBadge.tsx`

### features 레이어
- `src/features/auth/api/authActions.ts` (direct supabase calls)
- `src/features/auth/ui/LoginForm.tsx` (RN TextInput 기반)
- `src/features/auth/ui/SignupForm.tsx`
- `src/features/auth/ui/GitHubLoginButton.tsx` (expo-auth-session)
- `src/features/todo-create/api/createTodo.ts`
- `src/features/todo-create/ui/AddTodoForm.tsx`
- `src/features/todo-edit/api/updateTodo.ts`
- `src/features/todo-edit/ui/TodoEditModal.tsx`
- `src/features/todo-delete/api/deleteTodo.ts`
- `src/features/todo-toggle/api/toggleTodo.ts`
- `src/features/category-create/api/createCategory.ts`
- `src/features/category-create/ui/CreateCategoryForm.tsx`

### widgets 레이어
- `src/widgets/todo-list/ui/TodoList.tsx`
- `src/widgets/calendar/ui/CalendarWidget.tsx`
- `src/widgets/header/ui/Header.tsx`

### app (Expo Router pages)
- `app/_layout.tsx`
- `app/(auth)/_layout.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/categories.tsx`
- `app/auth/callback.tsx`

---

## Setup Commands (순서 중요)

```bash
# 1. 루트에서 pnpm 전환 (npm → pnpm)
npm install -g pnpm

# 2. 현재 node_modules 제거
rm -rf node_modules package-lock.json

# 3. 루트 설정 파일 생성 (pnpm-workspace.yaml, turbo.json, root package.json)

# 4. 웹 앱 파일 이동
mkdir -p apps/web
mv src public package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs components.json .eslintrc.json .env.local apps/web/
# apps/web/package.json의 name을 "@todo/web"으로 변경

# 5. 패키지 설치
pnpm install

# 6. 웹 앱 검증
pnpm --filter @todo/web dev

# 7. Expo 앱 생성
pnpm create expo-app apps/mobile --template blank-typescript

# 8. 모바일 의존성 설치
pnpm --filter @todo/mobile add expo-router nativewind ...
```

---

## Key Constraints

- Mobile: `any` 타입 금지
- Mobile: `useEffect` 데이터 페칭 금지 (Zustand store 초기화는 `app/_layout.tsx`에서)
- Mobile Supabase: `expo-secure-store`를 storage adapter로 사용
- OAuth scheme: `todo-app://auth/callback` → Supabase Dashboard에 추가 필요
- pnpm workspace protocol: `"@todo/types": "workspace:*"`
- Turborepo: `turbo.json`의 `dependsOn: ["^build"]` 설정
- NativeWind: `metro.config.js`에 withNativeWind 래핑 필수

---

## Supabase Dashboard 추가 설정 (수동)

GitHub OAuth Redirect URL 추가:
- `todo-app://auth/callback` (모바일 deep link)

기존 설정 유지:
- `http://localhost:3001/auth/callback` (web dev)
- `https://{project-ref}.supabase.co/auth/v1/callback` (GitHub App)

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| pnpm workspace 경로 충돌 | High | Phase 2 완료 후 즉시 `pnpm install` 검증 |
| NativeWind v4 metro 설정 오류 | Medium | 공식 docs 기준 metro.config.js 작성 |
| Expo SecureStore OAuth 세션 유실 | Medium | `detectSessionInUrl: false` 설정 확인 |
| @todo/types 타입 충돌 (web vs mobile) | Low | 공유 타입은 순수 TS만 포함, RN/Next 의존성 배제 |
