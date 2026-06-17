---
id: SPEC-AUTH-001
version: "1.0.0"
status: draft
created: "2026-06-17"
updated: "2026-06-17"
author: manager-spec
priority: medium
issue_number: 0
---

## HISTORY

| Version | Date       | Author       | Changes                        |
|---------|------------|--------------|--------------------------------|
| 1.0.0   | 2026-06-17 | manager-spec | Initial draft — GitHub OAuth social login |

---

# SPEC-AUTH-001: GitHub OAuth 소셜 로그인

## Overview

기존 이메일/비밀번호 인증 흐름에 GitHub OAuth 소셜 로그인을 추가한다.
Supabase Auth의 OAuth 지원(`signInWithOAuth`)과 Next.js 15 App Router의 Route Handler를 활용하여
최소한의 코드 변경으로 GitHub 계정 기반 인증을 제공한다.

## Scope

**In Scope**

- GitHub OAuth 콜백 Route Handler (`src/app/auth/callback/route.ts`)
- `GitHubLoginButton` 클라이언트 컴포넌트 (`src/features/auth/ui/GitHubLoginButton.tsx`)
- `LoginForm` 에 GitHub 로그인 버튼 및 구분선 추가
- `SignupForm` 에 GitHub 로그인 버튼 및 구분선 추가
- Supabase Dashboard 설정 가이드 (JSDoc 주석)

**Out of Scope (Exclusions)**

아래 항목은 본 SPEC 범위에서 명시적으로 제외된다.

- Google, Kakao 등 다른 OAuth 프로바이더 추가
- 신규 DB 테이블 또는 RLS 정책 변경 (GitHub 인증은 기존 `users` 테이블 재사용)
- 이메일 확인(confirmation) 플로우 변경
- 미들웨어 레벨 인증 가드 변경
- 테스트 파일 생성 (Run 단계에서 DDD 모드로 추가)
- Zustand 스토어 신규 생성 (기존 `useAuthStore` 재사용)
- 신규 FSD 레이어 또는 슬라이스 추가

---

## Architecture Context

### 기술 스택 (Constitution 준수)

- **프레임워크**: Next.js 15 App Router, TypeScript strict mode
- **아키텍처**: Feature-Sliced Design (FSD) — `app → features → shared` 단방향 의존성
- **인증 라이브러리**: `@supabase/ssr` 0.12.0
- **UI**: shadcn/ui + Tailwind CSS + lucide-react
- **상태 관리**: Zustand (`useAuthStore`)

### FSD 레이어 규칙

```
app/auth/callback/route.ts     ← app 레이어 (Route Handler)
features/auth/ui/              ← features 레이어 (UI 컴포넌트)
shared/api/supabaseClient.ts   ← shared 레이어 (브라우저 클라이언트)
shared/api/supabaseServer.ts   ← shared 레이어 (서버 클라이언트)
```

**Import 방향**: `features` 컴포넌트는 `shared`를 import 가능. `app` 레이어는 `features`와 `shared` 모두 import 가능. 역방향 import 금지.

### OAuth 인증 흐름

```
사용자 클릭
    ↓
GitHubLoginButton (features/auth/ui)
    → supabase.auth.signInWithOAuth({ provider: 'github' })
    → GitHub OAuth 페이지로 리다이렉트

GitHub 인증 완료
    ↓
/auth/callback?code=... (app/auth/callback/route.ts)
    → supabase.auth.exchangeCodeForSession(code)
    → 성공: / 로 리다이렉트
    → 실패: /login?error=auth_failed 로 리다이렉트

세션 쿠키 자동 설정 (Supabase @supabase/ssr 처리)
    ↓
useAuthStore.setUser() — 기존 대시보드 레이아웃에서 세션 체크 시 호출 (변경 없음)
```

---

## Requirements

### REQ-01: OAuth 콜백 Route Handler

**파일**: `src/app/auth/callback/route.ts`

**R01-1** (Ubiquitous)
The system SHALL provide a GET Route Handler at `/auth/callback` that accepts a `code` query parameter.

**R01-2** (Event-Driven)
WHEN a GET request arrives at `/auth/callback` with a valid `code` query parameter, the system SHALL call `supabase.auth.exchangeCodeForSession(code)` using the server-side Supabase client (`createClient` from `@/shared/api/supabaseServer`).

**R01-3** (Event-Driven)
WHEN `exchangeCodeForSession` succeeds, the system SHALL redirect the user to `/` (home).

**R01-4** (Event-Driven — Unwanted Behavior)
IF `exchangeCodeForSession` throws an error or returns an error object, THEN the system SHALL redirect the user to `/login?error=auth_failed`.

**R01-5** (Ubiquitous)
The system SHALL include a JSDoc comment at the top of `route.ts` documenting the required Supabase Dashboard setup steps:
- Authentication → Providers → GitHub 에서 GitHub 프로바이더 활성화
- GitHub OAuth App의 callback URL: `https://{project-ref}.supabase.co/auth/v1/callback`

**R01-6** (Ubiquitous)
The Route Handler SHALL use the server-side Supabase client only. Browser client(`supabaseClient.ts`) SHALL NOT be imported in this file.

---

### REQ-02: GitHubLoginButton 컴포넌트

**파일**: `src/features/auth/ui/GitHubLoginButton.tsx`

**R02-1** (Ubiquitous)
The system SHALL provide a `GitHubLoginButton` Client Component (`"use client"`) in the `features/auth/ui` slice.

**R02-2** (Ubiquitous)
The `GitHubLoginButton` SHALL use the browser-side Supabase client (`import { createClient } from "@/shared/api/supabaseClient"`).

**R02-3** (Event-Driven)
WHEN the user clicks `GitHubLoginButton`, the system SHALL call:
```
supabase.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
})
```

**R02-4** (Ubiquitous)
The `GitHubLoginButton` SHALL render a shadcn `Button` with `variant="outline"` and `className="w-full"`.

**R02-5** (Ubiquitous)
The `GitHubLoginButton` SHALL display a lucide-react `Github` icon positioned to the left of the button text.

**R02-6** (Ubiquitous)
The button text SHALL be `"GitHub으로 계속하기"`.

**R02-7** (Ubiquitous)
The `GitHubLoginButton` SHALL apply the `button-secondary` design token style (DESIGN.md 기준: `Button variant="outline"` 가 해당 토큰에 매핑됨).

**R02-8** (Ubiquitous)
The component SHALL use TypeScript strict mode. No `any` type is permitted.

---

### REQ-03: LoginForm 수정

**파일**: `src/features/auth/ui/LoginForm.tsx` (기존 파일 수정)

**R03-1** (Ubiquitous)
The system SHALL add a visual divider and `GitHubLoginButton` to `LoginForm` below the submit button.

**R03-2** (Ubiquitous)
The divider SHALL use the following markup pattern:
```html
<div class="relative my-4">
  <div class="absolute inset-0 flex items-center">
    <span class="w-full border-t border-border"/>
  </div>
  <div class="relative flex justify-center text-xs uppercase">
    <span class="bg-background px-2 text-muted-foreground">또는</span>
  </div>
</div>
```

**R03-3** (Ubiquitous)
`GitHubLoginButton` SHALL be imported as:
```typescript
import { GitHubLoginButton } from "./GitHubLoginButton"
```

**R03-4** (State-Driven — Constraint)
WHILE modifying `LoginForm`, the system SHALL NOT modify:
- `signIn` Server Action 로직
- 폼 구조 (email/password 입력 필드)
- 기존 import 문

---

### REQ-04: SignupForm 수정

**파일**: `src/features/auth/ui/SignupForm.tsx` (기존 파일 수정)

**R04-1** (Ubiquitous)
The system SHALL add the identical divider and `GitHubLoginButton` to `SignupForm` below the submit button, following the same pattern as `LoginForm` (REQ-03).

**R04-2** (State-Driven — Constraint)
WHILE modifying `SignupForm`, the system SHALL NOT modify:
- `signUp` Server Action 로직
- 폼 구조
- 기존 import 문

---

### REQ-05: Supabase Dashboard 설정 가이드

**R05-1** (Ubiquitous)
The system SHALL include a JSDoc comment block at the top of `src/app/auth/callback/route.ts` (코드 위, import 아래) with clear setup instructions for:
1. Supabase Dashboard → Authentication → Providers → GitHub 활성화 방법
2. GitHub OAuth App 등록 및 callback URL 설정 방법
3. 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 확인 방법

---

## Non-Functional Requirements

**NF-01** (Ubiquitous — TypeScript)
The system SHALL maintain TypeScript strict mode compliance across all new and modified files. No `any` type is permitted.

**NF-02** (Ubiquitous — FSD)
The system SHALL maintain FSD import direction rules: `app → features → shared`. No reverse imports.

**NF-03** (Ubiquitous — Design Consistency)
The `GitHubLoginButton` SHALL visually match the existing button-secondary design token specification from DESIGN.md.

**NF-04** (Ubiquitous — Session)
The system SHALL NOT manually set or clear Supabase session state. Session cookie management is handled automatically by `@supabase/ssr` after the OAuth callback.

**NF-05** (Ubiquitous — Reuse)
The system SHALL NOT create new Zustand stores. `useAuthStore` from `src/entities/user/model/useAuthStore.ts` is reused without modification.

---

## Constraints

| Constraint | Value |
|------------|-------|
| Auth Library | `@supabase/ssr` 0.12.0 — API 변경 금지 |
| UI Library | shadcn `Button variant="outline"` (button-secondary 토큰) |
| Icon Library | lucide-react `Github` |
| TypeScript | strict mode, `any` 금지 |
| FSD | `app → features → shared` 단방향 |
| OAuth Provider | GitHub만 (Google/Kakao 등 제외) |
| Server Actions | `authActions.ts` 수정 금지 |
