---
id: SPEC-MONO-001
version: "1.0.0"
status: draft
created: "2026-06-23"
updated: "2026-06-23"
author: manager-spec
priority: high
issue_number: 0
---

## HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-23 | Initial SPEC created |

## Description

단일 Next.js 프로젝트를 Turborepo 기반 모노레포로 전환하고, 동일한 Supabase 백엔드를 공유하는 Expo React Native 모바일 앱을 추가한다. 기존 웹 앱의 모든 기능(투두 CRUD, 캘린더 뷰, GitHub OAuth, 카테고리, 우선순위)을 모바일에서도 사용할 수 있도록 한다.

## Requirements

### REQ-01: 모노레포 루트 구조

**SPEC-MONO-001-REQ-01**: The system SHALL establish a Turborepo monorepo root with pnpm workspaces containing apps/ and packages/ directories.

Acceptance Criteria:
- 루트 `package.json`: name=todo-list-monorepo, packageManager=pnpm@9, scripts (dev:web, dev:mobile, build, lint)
- `pnpm-workspace.yaml`: `apps/*`, `packages/*` 포함
- `turbo.json`: build/dev/lint 태스크 정의
- 기존 `node_modules/` 제거 후 pnpm install로 재설치

---

### REQ-02: 웹 앱 이동 (apps/web)

**SPEC-MONO-001-REQ-02**: WHEN the monorepo is established, the system SHALL move the current Next.js app to apps/web/ with no functional changes.

Acceptance Criteria:
- 모든 `src/` 파일이 `apps/web/src/`로 이동
- `apps/web/package.json`: name=@todo/web, next/react/supabase 의존성 유지
- `apps/web/tsconfig.json`: `@/*: ["./src/*"]` paths 유지
- `apps/web/next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs` 그대로 이동
- `apps/web/` 에서 `npm run dev` → 정상 동작
- `.env.local` → `apps/web/.env.local`로 이동 (또는 루트에서 공유)

---

### REQ-03: 공유 패키지

**SPEC-MONO-001-REQ-03**: The system SHALL provide shared TypeScript packages for types and utilities usable by both apps.

Acceptance Criteria:
- `packages/types/`: `@todo/types` 패키지
  - `src/todo.ts`: Todo, Priority, CreateTodoInput, UpdateTodoInput
  - `src/category.ts`: Category, CreateCategoryInput
  - `src/index.ts`: re-export all
  - `package.json`: name=@todo/types, main=dist/index.js, types=dist/index.d.ts
  - `tsconfig.json`: strict mode
- `packages/utils/`: `@todo/utils` 패키지
  - `src/calendarUtils.ts`: getPriorityMapByDate (복사 from apps/web)
  - `src/cn.ts`: cn() utility (clsx + tailwind-merge)
  - `src/index.ts`: re-export all
  - `package.json`: name=@todo/utils, peerDeps: @todo/types
- 두 패키지 모두 TypeScript source를 직접 참조 (빌드 없이 tsconfig paths로)

---

### REQ-04: 모바일 앱 기본 구조 (apps/mobile)

**SPEC-MONO-001-REQ-04**: The system SHALL create a new Expo app at apps/mobile/ with Expo Router v4 file-based routing.

Acceptance Criteria:
- `apps/mobile/package.json`: name=@todo/mobile, Expo SDK 53
- `apps/mobile/app.json`: name=TodoApp, scheme=todo-app (OAuth deep link용)
- Expo Router v4 파일 구조:
  ```
  app/
    _layout.tsx          ← RootLayout (auth state check)
    (auth)/
      _layout.tsx
      login.tsx
      signup.tsx
    (tabs)/
      _layout.tsx
      index.tsx           ← 메인 투두 + 캘린더
      categories.tsx
    auth/
      callback.tsx        ← OAuth callback handler
  ```
- NativeWind v4 설정 (metro.config.js + tailwind.config.js)
- `apps/mobile/src/` FSD 구조 유지

---

### REQ-05: 모바일 인증

**SPEC-MONO-001-REQ-05**: WHEN a user opens the mobile app, the system SHALL authenticate via email/password or GitHub OAuth.

Acceptance Criteria:
- Supabase 클라이언트: `@supabase/supabase-js` + `expo-secure-store` (세션 저장)
- 이메일/비밀번호 로그인 → `supabase.auth.signInWithPassword()`
- GitHub OAuth → `expo-auth-session` + `makeRedirectUri(scheme: 'todo-app')` → Supabase OAuth
- `_layout.tsx`에서 `supabase.auth.getSession()` 체크 → 미인증 시 /(auth)/login으로 리다이렉트
- 로그아웃 → `supabase.auth.signOut()` + 세션 삭제

---

### REQ-06: 모바일 투두 CRUD

**SPEC-MONO-001-REQ-06**: The system SHALL provide full Todo CRUD on mobile using direct Supabase client calls.

Acceptance Criteria:
- createTodo: `supabase.from('todos').insert(...)` (Server Action 없음)
- updateTodo: `supabase.from('todos').update(...).eq('id', id)`
- deleteTodo: `supabase.from('todos').delete().eq('id', id)`
- toggleTodo: update `is_done`
- 낙관적 업데이트: Zustand store 선 업데이트, 실패 시 롤백 + Toast
- RLS 정책으로 타 사용자 데이터 격리 (web과 동일 DB 사용)

---

### REQ-07: 모바일 캘린더 뷰

**SPEC-MONO-001-REQ-07**: WHEN viewing the main screen, the system SHALL show a monthly calendar with priority color bars and date-filtered todo list.

Acceptance Criteria:
- `react-native-calendars` 컴포넌트 사용
- 투두 있는 날짜: `@todo/utils`의 `getPriorityMapByDate` 사용하여 마킹
- 날짜 선택 시 해당 날 투두만 표시
- 날짜 타이틀 표시 (예: "2026년 6월 23일 월요일")
- 빈 날짜 안내 메시지 표시

---

### REQ-08: 모바일 카테고리 관리

**SPEC-MONO-001-REQ-08**: The system SHALL allow creating and deleting categories on mobile.

Acceptance Criteria:
- 카테고리 목록 조회: `supabase.from('categories').select()`
- 카테고리 생성 (name + color)
- 카테고리 삭제 → 투두 category_id NULL로 (DB ON DELETE SET NULL)
- Zustand useCategoryStore (web과 동일 인터페이스)

---

## Exclusions (What NOT to Build)

- web 앱의 내부 코드 리팩터링 없음 (이동만 수행)
- DB 스키마 변경 없음 (기존 Supabase 테이블 그대로 사용)
- CI/CD 파이프라인 설정 (Turborepo CI) — 향후 별도 SPEC
- Expo EAS Build / App Store 배포 — 향후 별도 SPEC
- 모바일 DnD 드래그 앤 드롭 (탭으로 순서 변경 대체, 미구현)
- 오프라인 모드 (Supabase 연결 필수)
