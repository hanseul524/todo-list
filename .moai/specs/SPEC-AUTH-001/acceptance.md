# SPEC-AUTH-001 인수 테스트 시나리오

## Overview

본 문서는 SPEC-AUTH-001(GitHub OAuth 소셜 로그인)의 인수 기준을 정의한다.
모든 시나리오는 Given-When-Then 형식으로 작성되며, 관찰 가능한 결과를 기준으로 판단한다.

---

## 인수 기준: REQ-01 — OAuth 콜백 Route Handler

### AC-01-1: 유효한 code로 콜백 성공

**Given** Supabase Dashboard에서 GitHub 프로바이더가 활성화되어 있고,
유효한 GitHub OAuth authorization code가 생성된 상태

**When** GET `/auth/callback?code=VALID_CODE` 요청이 서버에 도달했을 때

**Then**
- `supabase.auth.exchangeCodeForSession(VALID_CODE)` 가 호출된다
- 응답이 `302 Redirect` 이며 Location 헤더가 `/` 를 가리킨다
- 응답 쿠키에 Supabase 세션 쿠키(`sb-*-auth-token`)가 설정된다

---

### AC-01-2: code 파라미터 누락 시 실패 처리

**Given** 유효하지 않은 또는 만료된 code, 혹은 code 파라미터가 없는 요청

**When** GET `/auth/callback` (code 없음) 또는 GET `/auth/callback?code=INVALID_CODE` 요청이 도달했을 때

**Then**
- 응답이 `302 Redirect` 이며 Location 헤더가 `/login?error=auth_failed` 를 가리킨다
- 사용자에게 500 에러 페이지가 노출되지 않는다

---

### AC-01-3: Route Handler 파일 구조 검증

**Given** `src/app/auth/callback/route.ts` 파일이 존재한다

**When** 파일 내용을 검사했을 때

**Then**
- `GET` named export 함수가 존재한다
- `@/shared/api/supabaseServer` 에서 `createClient` 를 import 한다
- `@/shared/api/supabaseClient` import 가 없다 (서버 클라이언트만 사용)
- 파일 최상단(import 아래)에 JSDoc 주석이 존재하며 Supabase Dashboard 설정 안내를 포함한다
- TypeScript strict 모드 컴파일 에러가 없다

---

## 인수 기준: REQ-02 — GitHubLoginButton 컴포넌트

### AC-02-1: 버튼 렌더링 검증

**Given** `GitHubLoginButton` 컴포넌트가 DOM에 마운트된 상태

**When** 컴포넌트를 렌더링했을 때

**Then**
- `role="button"` 요소가 존재한다
- 버튼 텍스트에 `"GitHub으로 계속하기"` 가 포함된다
- 버튼이 `w-full` 너비 (100%)로 렌더링된다
- lucide-react `Github` 아이콘 SVG가 버튼 텍스트 왼쪽에 위치한다
- shadcn `Button variant="outline"` 스타일이 적용된다 (border가 존재, background 투명)

---

### AC-02-2: 클릭 시 OAuth 플로우 시작

**Given** Supabase 브라우저 클라이언트가 초기화된 상태이며 사용자가 로그인되어 있지 않다

**When** 사용자가 `GitHubLoginButton` 을 클릭했을 때

**Then**
- `supabase.auth.signInWithOAuth` 가 `provider: 'github'` 옵션과 함께 호출된다
- `options.redirectTo` 가 `${window.location.origin}/auth/callback` 형태이다
- 브라우저가 GitHub OAuth 인증 페이지로 리다이렉트된다

---

### AC-02-3: 컴포넌트 파일 구조 검증

**Given** `src/features/auth/ui/GitHubLoginButton.tsx` 파일이 존재한다

**When** 파일 내용을 검사했을 때

**Then**
- 파일 최상단에 `"use client"` 지시어가 존재한다
- `@/shared/api/supabaseClient` 에서 `createClient` 를 import 한다
- `@/shared/api/supabaseServer` import 가 없다 (브라우저 클라이언트만 사용)
- `lucide-react` 에서 `Github` 를 import 한다
- `@/components/ui/button` 에서 `Button` 을 import 한다 (shadcn 경로)
- `any` 타입이 사용되지 않는다
- TypeScript strict 모드 컴파일 에러가 없다

---

## 인수 기준: REQ-03 — LoginForm 수정

### AC-03-1: LoginForm 에 구분선 및 버튼 존재

**Given** `/login` 페이지가 렌더링된 상태

**When** 페이지 내용을 검사했을 때

**Then**
- submit 버튼(`"로그인"` 또는 유사 텍스트) 이 존재한다
- submit 버튼 아래에 `"또는"` 텍스트를 포함한 구분선 div가 존재한다
- 구분선 아래에 `"GitHub으로 계속하기"` 버튼이 존재한다

---

### AC-03-2: LoginForm 기존 기능 무결성

**Given** `LoginForm` 이 수정된 상태

**When** 파일 내용을 검사했을 때

**Then**
- `signIn` Server Action import 가 유지된다
- email input 필드가 존재한다
- password input 필드가 존재한다
- `signIn` 액션 연결이 유지된다
- 기존 import 문이 제거되거나 변경되지 않았다
- TypeScript strict 모드 컴파일 에러가 없다

---

## 인수 기준: REQ-04 — SignupForm 수정

### AC-04-1: SignupForm 에 구분선 및 버튼 존재

**Given** `/signup` 페이지가 렌더링된 상태

**When** 페이지 내용을 검사했을 때

**Then**
- submit 버튼(`"회원가입"` 또는 유사 텍스트) 이 존재한다
- submit 버튼 아래에 `"또는"` 텍스트를 포함한 구분선 div가 존재한다
- 구분선 아래에 `"GitHub으로 계속하기"` 버튼이 존재한다

---

### AC-04-2: SignupForm 기존 기능 무결성

**Given** `SignupForm` 이 수정된 상태

**When** 파일 내용을 검사했을 때

**Then**
- `signUp` Server Action import 가 유지된다
- email input 필드가 존재한다
- password input 필드가 존재한다
- `signUp` 액션 연결이 유지된다
- 기존 import 문이 제거되거나 변경되지 않았다
- TypeScript strict 모드 컴파일 에러가 없다

---

## Edge Case 시나리오

### EC-01: 팝업 차단 환경

**Given** 브라우저 팝업 차단이 활성화된 상태

**When** 사용자가 `GitHubLoginButton` 을 클릭했을 때

**Then**
- `signInWithOAuth` 는 팝업이 아닌 리다이렉트 방식으로 동작하므로 팝업 차단에 영향받지 않는다
- (Supabase OAuth 기본 동작: 현재 탭에서 리다이렉트)

---

### EC-02: OAuth 완료 후 이미 로그인된 상태에서 콜백 재접근

**Given** 사용자가 이미 로그인된 상태에서 `/auth/callback?code=OLD_CODE` 에 접근

**When** Route Handler가 `exchangeCodeForSession(OLD_CODE)` 를 호출했을 때

**Then**
- 만료된 code이므로 Supabase가 에러를 반환한다
- Route Handler가 `/login?error=auth_failed` 로 리다이렉트한다
- 기존 세션은 영향받지 않는다

---

### EC-03: 로컬 개발 환경과 프로덕션 환경의 redirectTo 차이

**Given** 로컬 환경(`http://localhost:3000`)과 프로덕션 환경(`https://yourdomain.com`) 각각

**When** `GitHubLoginButton` 클릭 시 `callbackUrl` 이 생성될 때

**Then**
- 로컬: `redirectTo = "http://localhost:3000/auth/callback"`
- 프로덕션: `redirectTo = "https://yourdomain.com/auth/callback"`
- `window.location.origin` 사용으로 환경별 자동 적용 확인

---

## Definition of Done (완료 기준)

SPEC-AUTH-001 구현이 완료되었다고 판단하려면 아래 모든 항목이 충족되어야 한다.

**파일 존재 확인**
- [ ] `src/app/auth/callback/route.ts` 파일이 존재한다
- [ ] `src/features/auth/ui/GitHubLoginButton.tsx` 파일이 존재한다
- [ ] `src/features/auth/ui/LoginForm.tsx` 파일이 수정되었다
- [ ] `src/features/auth/ui/SignupForm.tsx` 파일이 수정되었다

**TypeScript 컴파일**
- [ ] `tsc --noEmit` 또는 `next build` 가 에러 없이 통과한다
- [ ] 신규/수정 파일에 `any` 타입이 없다

**기능 검증 (브라우저)**
- [ ] `/login` 페이지에서 `"GitHub으로 계속하기"` 버튼이 렌더링된다
- [ ] `/signup` 페이지에서 `"GitHub으로 계속하기"` 버튼이 렌더링된다
- [ ] 버튼 클릭 시 GitHub OAuth 인증 페이지로 이동한다
- [ ] GitHub 인증 완료 후 `/` 로 리다이렉트된다
- [ ] 실패 시 `/login?error=auth_failed` 로 리다이렉트된다

**기존 기능 무결성**
- [ ] `/login` 의 email/password 로그인이 정상 동작한다
- [ ] `/signup` 의 email/password 회원가입이 정상 동작한다

**아키텍처 규칙**
- [ ] FSD import 방향(`app → features → shared`)이 준수된다
- [ ] `authActions.ts` 가 수정되지 않았다
- [ ] `useAuthStore.ts` 가 수정되지 않았다
- [ ] 신규 Zustand 스토어가 생성되지 않았다

**품질 게이트**
- [ ] ESLint 오류가 없다
- [ ] `route.ts` 에 Supabase Dashboard 설정 가이드 JSDoc 주석이 포함된다
