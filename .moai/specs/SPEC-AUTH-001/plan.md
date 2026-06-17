# SPEC-AUTH-001 구현 계획

## Overview

GitHub OAuth 소셜 로그인을 기존 이메일/비밀번호 인증 흐름에 통합한다.
변경 범위는 신규 파일 2개(Route Handler, GitHubLoginButton)와 기존 파일 2개(LoginForm, SignupForm) 수정으로 최소화된다.

---

## 구현 대상 파일

| 파일 | 작업 종류 | 레이어 |
|------|-----------|--------|
| `src/app/auth/callback/route.ts` | 신규 생성 | app |
| `src/features/auth/ui/GitHubLoginButton.tsx` | 신규 생성 | features |
| `src/features/auth/ui/LoginForm.tsx` | 수정 | features |
| `src/features/auth/ui/SignupForm.tsx` | 수정 | features |

---

## 구현 순서 및 의존성

### Phase 1 (우선순위: High) — 핵심 인증 인프라

**1-A: OAuth 콜백 Route Handler 생성**

파일: `src/app/auth/callback/route.ts`

구현 사항:
- `createClient`를 `@/shared/api/supabaseServer`에서 import
- `GET` named export 함수 구현
- `request.nextUrl.searchParams.get('code')` 로 code 파라미터 추출
- `supabase.auth.exchangeCodeForSession(code)` 호출
- 성공 시 `NextResponse.redirect(new URL('/', request.url))`
- 실패 시 `NextResponse.redirect(new URL('/login?error=auth_failed', request.url))`
- JSDoc 주석으로 Supabase Dashboard 설정 가이드 포함

의존성: 없음 (독립적으로 먼저 구현 가능)

**1-B: GitHubLoginButton 컴포넌트 생성**

파일: `src/features/auth/ui/GitHubLoginButton.tsx`

구현 사항:
- `"use client"` 지시어
- `createClient`를 `@/shared/api/supabaseClient`에서 import
- `Button` (shadcn), `Github` (lucide-react) import
- 클릭 핸들러: `supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: ... } })`
- `callbackUrl` = `${window.location.origin}/auth/callback`
- 렌더링: `<Button variant="outline" className="w-full">` + `<Github className="mr-2 h-4 w-4" />` + `"GitHub으로 계속하기"`

의존성: 1-A 완료 필요 없음 (독립적)

Phase 1 병렬 실행 가능: 1-A와 1-B는 서로 의존성 없음 → 동시 구현 가능.

---

### Phase 2 (우선순위: Medium) — UI 통합

Phase 1 완료 후 진행. 1-B의 `GitHubLoginButton` 컴포넌트가 존재해야 함.

**2-A: LoginForm 수정**

파일: `src/features/auth/ui/LoginForm.tsx`

변경 사항:
- `import { GitHubLoginButton } from "./GitHubLoginButton"` 추가
- submit 버튼 아래에 구분선 div 추가 (Tailwind 클래스 기반)
- 구분선 아래에 `<GitHubLoginButton />` 추가
- 기존 코드(signIn 액션, 폼 입력 필드, 기존 import) 변경 없음

**2-B: SignupForm 수정**

파일: `src/features/auth/ui/SignupForm.tsx`

변경 사항: LoginForm 수정과 동일한 패턴 적용
- `import { GitHubLoginButton } from "./GitHubLoginButton"` 추가
- submit 버튼 아래에 동일한 구분선 + `<GitHubLoginButton />` 추가
- 기존 코드(signUp 액션, 폼 입력 필드, 기존 import) 변경 없음

Phase 2 병렬 실행 가능: 2-A와 2-B는 서로 독립적 → 동시 구현 가능.

---

## 기술적 접근 방식

### 서버 클라이언트 vs 브라우저 클라이언트 구분

| 파일 | 클라이언트 | 이유 |
|------|-----------|------|
| `route.ts` | `supabaseServer` (`createClient` from `@/shared/api/supabaseServer`) | Route Handler는 서버 환경에서 실행. 쿠키 기반 세션 설정에 서버 클라이언트 필요 |
| `GitHubLoginButton.tsx` | `supabaseClient` (`createClient` from `@/shared/api/supabaseClient`) | Client Component. `window.location.origin` 접근 필요. OAuth 리다이렉트는 브라우저에서 시작 |

### `redirectTo` URL 구성

```typescript
// GitHubLoginButton.tsx 내부
const callbackUrl = `${window.location.origin}/auth/callback`
```

`window.location.origin`을 사용하여 로컬 개발(`http://localhost:3000`)과 프로덕션(`https://yourdomain.com`) 환경 모두 자동 대응.

### 세션 쿠키 자동 처리

`@supabase/ssr`의 `exchangeCodeForSession` 호출 시 세션 쿠키가 자동으로 설정됨.
`useAuthStore.setUser()`는 기존 대시보드 레이아웃의 세션 체크 로직에서 호출됨 — 별도 수정 불필요.

---

## 위험 요소 및 완화 방안

| 위험 | 가능성 | 영향 | 완화 방안 |
|------|--------|------|-----------|
| Supabase Dashboard GitHub 프로바이더 미설정 | 높음 | 전체 OAuth 흐름 실패 | route.ts JSDoc 주석에 설정 가이드 포함 |
| `window is not defined` (SSR 환경) | 낮음 | GitHubLoginButton 렌더 오류 | `"use client"` 지시어로 Client Component 보장. `window`는 클라이언트에서만 접근 |
| `exchangeCodeForSession` code 파라미터 누락 | 중간 | 콜백 처리 오류 | code가 없을 경우 `/login?error=auth_failed` 리다이렉트로 안전 처리 |
| TypeScript strict 모드 타입 오류 | 낮음 | 빌드 실패 | `signInWithOAuth` 반환 타입 명시적 처리. Supabase SDK 타입 활용 |
| FSD import 방향 위반 | 낮음 | 아키텍처 규칙 위반 | features에서 shared만 import. app에서 features import — 단방향 준수 |

---

## 구현 마일스톤

**Milestone 1 (Priority High)**
- `src/app/auth/callback/route.ts` 생성 완료
- `src/features/auth/ui/GitHubLoginButton.tsx` 생성 완료
- 두 파일 TypeScript strict 컴파일 통과

**Milestone 2 (Priority Medium)**
- `LoginForm.tsx` 수정 완료 (기존 기능 무결성 유지)
- `SignupForm.tsx` 수정 완료 (기존 기능 무결성 유지)
- 두 파일 TypeScript strict 컴파일 통과

**Milestone 3 (Priority Medium)**
- 브라우저에서 GitHub OAuth 플로우 E2E 동작 확인
- `/auth/callback` 성공 리다이렉트 확인
- `/login?error=auth_failed` 실패 리다이렉트 확인

---

## 구현 시 주의사항

- `authActions.ts`는 절대 수정하지 않는다 (Server Actions — signIn/signUp/signOut 담당)
- `useAuthStore.ts`는 수정하지 않는다
- 기존 `LoginForm`/`SignupForm`의 email/password 필드와 Server Action 연결은 그대로 유지한다
- lucide-react의 `Github` 아이콘은 `Github` (대문자 G)가 올바른 export 이름이다
- shadcn `Button`의 `variant="outline"` 이 DESIGN.md의 `button-secondary` 토큰에 매핑된다
