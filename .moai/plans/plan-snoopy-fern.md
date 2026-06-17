# Plan: SPEC-TODO-001 생성 (Todo List 웹 애플리케이션)

## Context

사용자가 Todo List 웹 애플리케이션 전체를 구현하기 위한 MoAI SPEC 문서를 요청했다.
프로젝트는 Next.js 14 App Router + TypeScript + Supabase + shadcn/ui + dnd-kit + Zustand + FSD 아키텍처로 구성된다.
`docs/DESIGN.md`에 Linear 기반 디자인 시스템이 정의되어 있으며, DB 스키마와 FSD 디렉터리 구조가 완전히 설계된 상태다.
SPEC 문서가 없으면 `/moai run`을 실행할 수 없으므로 이 SPEC이 구현의 기준 문서가 된다.

**목표**: 구현 에이전트(manager-tdd/manager-ddd)가 의존할 수 있는 완전한 SPEC-TODO-001을 생성한다.

---

## 생성할 파일 구조

```
.moai/specs/SPEC-TODO-001/
├── spec.md           ← 요구사항 (EARS 형식)
├── plan.md           ← 구현 계획
├── acceptance.md     ← 인수 테스트 시나리오
└── spec-compact.md   ← 압축본 (run 페이즈용)
```

---

## SPEC-TODO-001 전체 내용 (검토용 미리보기)

---

### spec.md 내용

```markdown
---
id: SPEC-TODO-001
version: "1.0.0"
status: draft
created: "2026-06-17"
updated: "2026-06-17"
author: manager-spec
priority: high
issue_number: 0
---

## HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-17 | Initial SPEC created |

## Description

인증된 사용자가 투두 아이템을 생성·관리·정렬할 수 있는 풀스택 웹 애플리케이션.
Next.js 14 App Router + Supabase + shadcn/ui + FSD 아키텍처를 기반으로 하며,
드래그 앤 드롭 재정렬, 카테고리 관리, 우선순위/마감일 필터링, 다크/라이트 모드를 지원한다.

**핵심 사용자 가치**: 개인 할 일을 카드 형식으로 시각적으로 정리하고, 우선순위·카테고리·마감일로 체계적으로 관리할 수 있다.

## Requirements

### REQ-01: 사용자 인증 (Authentication)

**Pattern**: Ubiquitous + Event-driven

**SPEC-TODO-001-REQ-01**: The system SHALL provide email/password authentication via Supabase Auth.

Acceptance Criteria:
- 이메일 형식 검증 (RFC 5322)
- 비밀번호 최소 8자 이상
- 회원가입 시 중복 이메일 거부 + Toast 에러 표시
- 로그인 성공 시 `/` (dashboard)로 리다이렉트
- 로그인 실패 시 Toast로 에러 메시지 표시

**SPEC-TODO-001-REQ-02**: WHEN an unauthenticated user accesses any protected route, the system SHALL redirect to `/login`.

Acceptance Criteria:
- `(dashboard)/layout.tsx`에서 `auth.getUser()` 검증
- 세션 없으면 `redirect('/login')` 실행
- 미들웨어 수준 체크 없이 서버 컴포넌트에서만 처리

**SPEC-TODO-001-REQ-03**: WHEN a user requests sign-out, the system SHALL invalidate the Supabase session and redirect to `/login`.

Acceptance Criteria:
- `signOut` Server Action 실행
- 세션 쿠키 삭제
- `/login`으로 리다이렉트

---

### REQ-02: 투두 생성 (Create Todo)

**Pattern**: Event-driven

**SPEC-TODO-001-REQ-04**: WHEN a user submits the add-todo form, the system SHALL create a new todo with title, priority, category, and due_date fields.

Acceptance Criteria:
- 필수 필드: `title` (비어있으면 제출 차단)
- 선택 필드: `priority` (기본값 `medium`), `category_id`, `due_date`
- 낙관적 업데이트: 폼 제출 즉시 로컬 스토어에 추가
- Server Action `createTodo` 실패 시 롤백 + Toast 에러
- 새 투두의 `position`은 기존 목록 중 최댓값 + 1
- 성공 후 폼 초기화

---

### REQ-03: 투두 목록 조회 (Read Todos)

**Pattern**: Ubiquitous + State-driven

**SPEC-TODO-001-REQ-05**: The system SHALL load all todos belonging to the authenticated user on initial page load.

Acceptance Criteria:
- 서버 컴포넌트에서 Supabase Server Client로 데이터 페칭
- `useEffect` 금지 — Server Component에서 직접 fetch
- RLS 정책으로 타 사용자 데이터 격리 보장
- `useTodoStore.setTodos()`로 클라이언트 스토어 초기화

**SPEC-TODO-001-REQ-06**: WHILE a sort/filter/search value is active, the system SHALL display only matching todos in real-time without server requests.

Acceptance Criteria:
- `useFilterStore`의 `searchQuery`, `filterBy`, `sortBy`, `selectedCategory` 기반 클라이언트 필터링
- 검색: 제목 대소문자 무관 포함 여부
- 필터: `all` / `done` / `undone` / 카테고리 ID
- 정렬: `created_at` (최신순) / `due_date` (빠른 순, null 마지막) / `priority` (high > medium > low) / `position` (오름차순)

---

### REQ-04: 투두 완료 토글 (Toggle Todo)

**Pattern**: Event-driven

**SPEC-TODO-001-REQ-07**: WHEN a user clicks the checkbox on a todo, the system SHALL toggle `is_done` with optimistic update.

Acceptance Criteria:
- 낙관적: `updateTodo(id, { is_done: !current })` 즉시 적용
- Server Action `toggleTodo` 실행
- 실패 시 이전 상태로 롤백 + Toast 에러
- 완료 상태: 제목 취소선 + 카드 opacity 50%

---

### REQ-05: 투두 편집 (Edit Todo)

**Pattern**: Event-driven

**SPEC-TODO-001-REQ-08**: WHEN a user opens the edit dialog and submits changes, the system SHALL update the todo with optimistic update.

Acceptance Criteria:
- Dialog 열림: 기존 값 프리필 (title, priority, category_id, due_date)
- 필수: title 비어있으면 저장 차단
- 낙관적: Dialog 닫힘과 동시에 스토어 업데이트
- Server Action `updateTodo` 실패 시 롤백 + Toast 에러
- DatePicker: shadcn Popover + Calendar 사용

---

### REQ-06: 투두 삭제 (Delete Todo)

**Pattern**: Event-driven

**SPEC-TODO-001-REQ-09**: WHEN a user confirms todo deletion, the system SHALL remove the todo with optimistic update.

Acceptance Criteria:
- 낙관적: `deleteTodo(id)` 즉시 스토어에서 제거 + card fade-out 애니메이션
- Server Action `deleteTodo` 실패 시 복원 + Toast 에러
- 삭제 확인은 별도 Dialog 없이 바로 실행 (메뉴에서 삭제 클릭)

---

### REQ-07: 카테고리 관리 (Category CRUD)

**Pattern**: Event-driven + Ubiquitous

**SPEC-TODO-001-REQ-10**: The system SHALL allow users to create categories with a name and color.

Acceptance Criteria:
- 필수: name (비어있으면 차단), color (hex color picker 또는 preset)
- 낙관적 추가, 실패 시 롤백 + Toast

**SPEC-TODO-001-REQ-11**: WHEN a user deletes a category, the system SHALL set `category_id = null` on affected todos without deleting them.

Acceptance Criteria:
- DB ON DELETE SET NULL 정책 활용 (스키마 레벨)
- 클라이언트: `useTodoStore`에서 해당 `category_id` → null 업데이트
- 낙관적 처리: 카테고리 삭제 즉시 적용, 실패 시 롤백 + Toast

---

### REQ-08: 우선순위 Badge

**Pattern**: Ubiquitous

**SPEC-TODO-001-REQ-12**: The system SHALL display priority badges with distinct colors: high(red), medium(yellow/orange), low(green).

Acceptance Criteria:
- 높음(high): 텍스트 `#e5534b`, 다크 배경 `#2d1412`, 라이트 배경 `#fdf0ef`
- 중간(medium): 텍스트 `#d9922a`, 다크 배경 `#2b1e0a`, 라이트 배경 `#fdf5eb`
- 낮음(low): 텍스트 `#27a644`, 다크 배경 `#0d2414`, 라이트 배경 `#edf8f0`
- pill shape, `2px 8px` 패딩, `11px/500` 타이포그래피

---

### REQ-09: 마감일 표시

**Pattern**: State-driven

**SPEC-TODO-001-REQ-13**: WHILE a todo's `due_date` is in the past, the system SHALL display the date in red (`#e5534b`).

Acceptance Criteria:
- 현재 날짜와 비교 (클라이언트 사이드)
- 마감일 초과: `{colors.overdue}` `#e5534b` 텍스트 적용
- 정상 마감일: muted 텍스트 (`dark-ink-subtle` / `light-ink-subtle`)
- DatePicker: shadcn Popover + Calendar 컴포넌트 사용

---

### REQ-10: 검색 (Search)

**Pattern**: State-driven

**SPEC-TODO-001-REQ-14**: WHILE a search query is active, the system SHALL filter todos by title in real-time on the client.

Acceptance Criteria:
- `useFilterStore.searchQuery` 상태 기반
- 대소문자 무관 (`title.toLowerCase().includes(query.toLowerCase())`)
- 서버 요청 없음 (클라이언트 사이드 필터)
- 검색창: Header 내 배치, placeholder "투두 검색..."

---

### REQ-11: 정렬 및 필터 (Sort & Filter)

**Pattern**: State-driven + Ubiquitous

**SPEC-TODO-001-REQ-15**: The system SHALL persist sort and filter preferences across page refreshes using Zustand persist middleware.

Acceptance Criteria:
- `useFilterStore`에 `persist` 미들웨어 적용 (localStorage)
- 정렬 옵션: `created_at` / `due_date` / `priority` / `position`
- 필터 옵션: `all` / `done` / `undone` + 카테고리별
- 새로고침 후에도 마지막 선택 유지

---

### REQ-12: 드래그 앤 드롭 (Drag & Drop)

**Pattern**: State-driven + Event-driven

**SPEC-TODO-001-REQ-16**: WHILE the sort option is `position`, the system SHALL enable dnd-kit drag-and-drop for todo reordering.

Acceptance Criteria:
- `sortBy === 'position'`일 때만 dnd-kit `DndContext` + `SortableContext` 활성화
- 다른 정렬 기준에서는 드래그 핸들 비노출
- 드래그 중 카드: `#5e6ad2` 테두리 + opacity 80%
- 드롭 가능 위치: `#5e6ad2` 2px 가로선 표시

**SPEC-TODO-001-REQ-17**: WHEN a user drops a todo in a new position, the system SHALL update `position` values in the database.

Acceptance Criteria:
- `arrayMove`로 로컬 순서 즉시 업데이트 (낙관적)
- Server Action `reorderTodos`로 batch position 업데이트
- 실패 시 이전 순서로 롤백 + Toast 에러

---

### REQ-13: 다크/라이트 모드 (Theme)

**Pattern**: Ubiquitous + Event-driven

**SPEC-TODO-001-REQ-18**: The system SHALL support light, dark, and system theme via next-themes.

Acceptance Criteria:
- `ThemeProvider`를 `app/layout.tsx`에서 래핑
- `attribute="class"` 전략 사용 (html에 `dark` 클래스 토글)
- 헤더에 테마 토글 버튼 배치 (Sun/Moon 아이콘)
- 시스템 선호도 (`system`) 지원

**SPEC-TODO-001-REQ-19**: The system SHALL apply the design system color tokens from `docs/DESIGN.md` via Tailwind CSS variables.

Acceptance Criteria:
- `globals.css`에 CSS 변수 정의 (`--background`, `--card`, `--border`, `--primary` 등)
- shadcn/ui 컴포넌트가 CSS 변수를 통해 자동으로 다크/라이트 모드 전환
- Inter 폰트 적용

---

### REQ-14: 디자인 시스템 (Design System)

**Pattern**: Ubiquitous

**SPEC-TODO-001-REQ-20**: The system SHALL implement the visual design from `docs/DESIGN.md` with Linear-inspired card grid layout.

Acceptance Criteria:
- 카드 그리드: Desktop 3열 / Tablet 2열 / Mobile 1열 (gap 16px/12px/8px)
- 최대 콘텐츠 너비: 1200px, 수평 패딩 24px
- 투두 카드 내부: 체크박스 + 제목 + 액션 메뉴 / 우선순위 Badge + 카테고리 Badge + 마감일
- 드래그 핸들: 카드 왼쪽, 기본 hidden → hover 시 visible
- 그림자 금지, 서피스 단계와 헤어라인 테두리로만 계층 표현
- 카드 hover: 배경 한 단계 상승 + 테두리 강조

---

### REQ-15: 낙관적 업데이트 및 에러 처리

**Pattern**: Ubiquitous

**SPEC-TODO-001-REQ-21**: The system SHALL apply optimistic updates for all mutations and roll back with toast notification on failure.

Acceptance Criteria:
- 모든 CUD 작업에 낙관적 업데이트 적용
- 실패 시: 이전 상태 복원 + `useToast`로 에러 메시지 표시
- Toast 컴포넌트: shadcn/ui Toaster 사용 (`app/layout.tsx`에 등록)

---

## Exclusions (What NOT to Build)

- 소셜 로그인 (OAuth2 - Google, GitHub 등) — 이메일/비밀번호만 지원
- 투두 공유 또는 협업 기능 — 개인 사용만 지원
- 파일/이미지 첨부 — 텍스트 기반 투두만 지원
- 이메일 알림 또는 푸시 알림 — UI 내 표시만 지원
- 투두 하위 작업(sub-task) — 단일 레벨 투두만 지원
- 반복 투두(recurring todo) — 일회성 투두만 지원
- 투두 간 의존성(dependency) 관리
- 다국어(i18n) 지원 — 한국어 UI 고정
- 오프라인 모드 — 인터넷 연결 필수
- Pages Router 사용 — App Router만 허용
```

---

### plan.md 내용

```markdown
# Implementation Plan: SPEC-TODO-001

## Technology Stack

| 영역 | 선택 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 14+ (App Router) |
| 언어 | TypeScript | 5.x (strict mode) |
| DB/Auth | Supabase | latest stable |
| UI | shadcn/ui + Tailwind CSS | latest stable |
| 상태관리 | Zustand | 4.x |
| DnD | dnd-kit (@dnd-kit/core, @dnd-kit/sortable) | 6.x |
| 테마 | next-themes | 0.3.x |
| 아키텍처 | Feature-Sliced Design (FSD) | — |
| 배포 | Vercel | — |

## Phase Structure

### Phase 1: 프로젝트 초기화 (Priority: Critical)
- Next.js 14 프로젝트 생성 (TypeScript strict)
- Supabase 프로젝트 설정 및 환경변수 구성
- shadcn/ui + Tailwind 설치 및 DESIGN.md 기반 CSS 변수 설정
- Zustand, dnd-kit, next-themes 설치
- FSD 디렉터리 구조 생성

### Phase 2: 기반 레이어 (Priority: Critical)
- `shared/api/`: Supabase 클라이언트 (브라우저/서버 분리)
- `shared/types/supabase.ts`: Supabase CLI 자동 생성 타입
- `shared/ui/`: shadcn/ui 컴포넌트 설치 (button, input, card, badge, dialog, checkbox, popover, calendar, select, toast)
- `shared/lib/utils.ts`: `cn()` 유틸
- `shared/model/useFilterStore.ts`: persist 미들웨어 포함

### Phase 3: 엔티티 레이어 (Priority: High)
- `entities/todo/model/types.ts`: Todo 타입
- `entities/todo/model/useTodoStore.ts`: Zustand 스토어
- `entities/category/model/types.ts`: Category 타입
- `entities/user/model/useAuthStore.ts`: 인증 스토어
- `entities/todo/ui/TodoItem.tsx`: 카드 UI
- `entities/todo/ui/TodoPriorityBadge.tsx`
- `entities/category/ui/CategoryBadge.tsx`

### Phase 4: 인증 (Priority: Critical)
- `features/auth/api/authActions.ts`: signIn, signUp, signOut Server Actions
- `features/auth/ui/LoginForm.tsx`, `SignupForm.tsx`
- `app/(auth)/login/page.tsx`, `signup/page.tsx`
- `app/(dashboard)/layout.tsx`: 인증 가드

### Phase 5: 투두 CRUD (Priority: Critical)
- `features/todo-create/api/createTodo.ts`
- `features/todo-create/ui/AddTodoForm.tsx`
- `features/todo-edit/api/updateTodo.ts`
- `features/todo-edit/ui/TodoEditDialog.tsx`
- `features/todo-delete/api/deleteTodo.ts`
- `features/todo-toggle/api/toggleTodo.ts`

### Phase 6: 카테고리 및 필터 (Priority: High)
- `features/category-create/api/createCategory.ts`
- `features/category-create/ui/CreateCategoryForm.tsx`
- `features/category-delete/api/deleteCategory.ts`
- `features/todo-filter/ui/TodoFilter.tsx`

### Phase 7: 드래그 앤 드롭 (Priority: Medium)
- `features/todo-reorder/api/reorderTodos.ts`
- `widgets/todo-list/ui/TodoList.tsx`: dnd-kit SortableContext 통합

### Phase 8: 위젯 및 페이지 조합 (Priority: High)
- `widgets/header/ui/Header.tsx`: 검색 + 다크모드 + 유저 메뉴
- `pages/todo-list/ui/TodoListPage.tsx`
- `pages/category-manager/ui/CategoryManagerPage.tsx`
- `app/(dashboard)/page.tsx`, `categories/page.tsx`

### Phase 9: 디자인 및 반응형 (Priority: High)
- CSS 변수 → DESIGN.md 토큰 매핑
- 반응형 카드 그리드 (3/2/1열)
- 다크/라이트 모드 전환
- 애니메이션 (fade-in/out, scale)

## Key Constraints

- `useEffect` 데이터 페칭 금지 → Server Component 또는 Server Action
- `any` 타입 금지
- FSD import 규칙: 상위 → 하위만
- 같은 레이어 슬라이스 간 직접 import 금지
- `shared/ui`: shadcn/ui 컴포넌트만
- 모든 에러: `useToast`

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database Setup (Supabase Dashboard)

SQL 실행:
```sql
create table categories (...)
create table todos (...)
-- RLS policies
```
```

---

### acceptance.md 내용

```markdown
# Acceptance Test Scenarios: SPEC-TODO-001

## 인증 시나리오

### TC-AUTH-01: 정상 로그인
Given: 이메일 "user@test.com", 비밀번호 "Password1!"로 가입된 사용자
When: 로그인 폼에 정확한 정보 입력 후 제출
Then: `/` (dashboard) 로 리다이렉트, 투두 목록 표시

### TC-AUTH-02: 비인증 접근 차단
Given: 로그인하지 않은 상태
When: `/` 접근 시도
Then: `/login` 으로 자동 리다이렉트

### TC-AUTH-03: 로그인 실패 처리
Given: 잘못된 비밀번호로 로그인 시도
When: 폼 제출
Then: Toast 에러 메시지 표시, 페이지 유지

---

## 투두 CRUD 시나리오

### TC-TODO-01: 투두 생성 (낙관적 업데이트)
Given: 로그인된 사용자, 빈 투두 목록
When: "프로젝트 완료" 제목, 높음 우선순위, 마감일 설정 후 제출
Then: 서버 응답 전에 카드가 목록에 즉시 나타남 (fade-in)

### TC-TODO-02: 투두 완료 토글
Given: 미완료 투두 존재
When: 체크박스 클릭
Then: 즉시 취소선 + opacity 50% 적용, 서버 동기화

### TC-TODO-03: 투두 삭제 롤백
Given: 네트워크 오류 시뮬레이션, 투두 카드 존재
When: 삭제 실행
Then: 카드 잠시 사라졌다가 복원, Toast 에러 "삭제에 실패했습니다"

### TC-TODO-04: 마감일 초과 표시
Given: 어제 날짜로 due_date 설정된 투두
When: 목록 조회
Then: 마감일 텍스트가 빨간색(#e5534b)으로 표시

---

## 필터/정렬 시나리오

### TC-FILTER-01: 검색 실시간 필터링
Given: "프로젝트", "미팅", "운동" 3개 투두 존재
When: 검색창에 "프로" 입력
Then: "프로젝트" 투두만 표시, 나머지 숨김

### TC-FILTER-02: 필터 새로고침 후 유지
Given: 필터 "미완료" 선택, 정렬 "마감일순" 선택
When: 페이지 새로고침
Then: 동일한 필터/정렬 상태 유지 (localStorage persist)

---

## 드래그 앤 드롭 시나리오

### TC-DND-01: 수동 정렬 활성화
Given: 정렬 기준 "생성일순" 선택 상태
When: 정렬 기준을 "수동 정렬"로 변경
Then: 투두 카드에 드래그 핸들 표시, DnD 활성화

### TC-DND-02: 순서 변경 DB 반영
Given: 정렬 기준 "수동 정렬", 투두 A(1위) B(2위) C(3위)
When: C를 A 위로 드래그
Then: 즉시 C-A-B 순서 표시, DB position 업데이트 성공

---

## 카테고리 시나리오

### TC-CAT-01: 카테고리 삭제 시 투두 유지
Given: "업무" 카테고리에 연결된 투두 3개 존재
When: "업무" 카테고리 삭제
Then: 투두 3개 유지, category Badge만 제거 (category_id = null)

---

## 디자인/테마 시나리오

### TC-THEME-01: 다크/라이트 모드 전환
Given: 다크모드 상태
When: 헤더 테마 토글 클릭
Then: 즉시 라이트모드로 전환, 모든 색상 토큰 전환

### TC-DESIGN-01: 반응형 카드 그리드
Given: 데스크탑(1280px+)에서 3열 그리드
When: 뷰포트 768px로 축소
Then: 2열 그리드로 자동 전환

---

## 테스트 시나리오 테이블

| ID | 카테고리 | 시나리오 | 입력 | 기댓값 | 상태 |
|----|---------|---------|------|--------|------|
| TC-AUTH-01 | 인증 | 정상 로그인 | 유효한 이메일/비밀번호 | dashboard 리다이렉트 | Pending |
| TC-AUTH-02 | 인증 | 비인증 접근 | 미로그인 상태에서 / 접근 | /login 리다이렉트 | Pending |
| TC-AUTH-03 | 인증 | 로그인 실패 | 잘못된 비밀번호 | Toast 에러 | Pending |
| TC-TODO-01 | CRUD | 낙관적 생성 | 투두 제목 입력 후 제출 | 즉시 카드 표시 | Pending |
| TC-TODO-02 | CRUD | 완료 토글 | 체크박스 클릭 | 즉시 취소선 + 50% opacity | Pending |
| TC-TODO-03 | CRUD | 삭제 롤백 | 네트워크 오류 중 삭제 | 카드 복원 + Toast | Pending |
| TC-TODO-04 | UI | 마감일 초과 | 어제 날짜 투두 | 빨간색 날짜 표시 | Pending |
| TC-FILTER-01 | 필터 | 실시간 검색 | 검색어 입력 | 매칭 투두만 표시 | Pending |
| TC-FILTER-02 | 필터 | 필터 유지 | 새로고침 | 동일 필터 상태 | Pending |
| TC-DND-01 | DnD | 수동 정렬 활성화 | 정렬 "수동 정렬" 선택 | 드래그 핸들 표시 | Pending |
| TC-DND-02 | DnD | 순서 변경 | 카드 드래그앤드롭 | DB position 업데이트 | Pending |
| TC-CAT-01 | 카테고리 | 카테고리 삭제 | 연결된 카테고리 삭제 | 투두 유지, badge 제거 | Pending |
| TC-THEME-01 | 테마 | 다크/라이트 전환 | 테마 토글 클릭 | 즉시 테마 전환 | Pending |
| TC-DESIGN-01 | 반응형 | 그리드 전환 | 뷰포트 축소 | 3열→2열 전환 | Pending |
```

---

### spec-compact.md 내용 (압축본)

```markdown
# SPEC-TODO-001 Compact

## Requirements

- REQ-01: The system SHALL provide email/password auth via Supabase Auth
- REQ-02: WHEN unauthenticated user accesses protected route → redirect /login
- REQ-03: WHEN user requests sign-out → invalidate session + redirect /login
- REQ-04: WHEN user submits add-todo form → create todo (optimistic) + rollback on fail
- REQ-05: The system SHALL load user todos on initial page load (Server Component)
- REQ-06: WHILE filter/sort/search active → client-side filtering without server requests
- REQ-07: WHEN checkbox clicked → toggle is_done (optimistic) + rollback on fail
- REQ-08: WHEN edit dialog submitted → update todo (optimistic) + rollback on fail
- REQ-09: WHEN deletion confirmed → remove todo (optimistic) + rollback on fail
- REQ-10: The system SHALL allow category creation (name + color)
- REQ-11: WHEN category deleted → set category_id = null on todos (RLS ON DELETE SET NULL)
- REQ-12: The system SHALL display priority badges (high=red, medium=orange, low=green)
- REQ-13: WHILE due_date is past → display date in red (#e5534b)
- REQ-14: WHILE searchQuery active → filter todos by title (client-side)
- REQ-15: The system SHALL persist sort/filter preferences via Zustand persist middleware
- REQ-16: WHILE sortBy === 'position' → enable dnd-kit drag-and-drop
- REQ-17: WHEN todo dropped in new position → update position in DB (optimistic)
- REQ-18: The system SHALL support light/dark/system theme via next-themes
- REQ-19: The system SHALL apply DESIGN.md color tokens via Tailwind CSS variables
- REQ-20: The system SHALL implement Linear-inspired card grid (3/2/1 cols responsive)
- REQ-21: The system SHALL apply optimistic updates for all mutations + toast on failure

## Exclusions

- OAuth 소셜 로그인 없음
- 파일 첨부 없음
- 협업/공유 기능 없음
- 하위 작업/반복 투두 없음
- Pages Router 없음 (App Router만)

## Files to Create

### app/
- `app/layout.tsx` — ThemeProvider, Toaster
- `app/globals.css` — CSS 변수 (DESIGN.md 토큰)
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(dashboard)/layout.tsx` — 인증 가드
- `app/(dashboard)/page.tsx`
- `app/(dashboard)/categories/page.tsx`

### shared/
- `shared/api/supabaseClient.ts`
- `shared/api/supabaseServer.ts`
- `shared/types/supabase.ts`
- `shared/model/useFilterStore.ts`
- `shared/lib/utils.ts`

### entities/
- `entities/todo/model/types.ts`
- `entities/todo/model/useTodoStore.ts`
- `entities/todo/ui/TodoItem.tsx`
- `entities/todo/ui/TodoPriorityBadge.tsx`
- `entities/category/model/types.ts`
- `entities/category/ui/CategoryBadge.tsx`
- `entities/user/model/useAuthStore.ts`

### features/
- `features/auth/api/authActions.ts`
- `features/auth/ui/LoginForm.tsx`
- `features/auth/ui/SignupForm.tsx`
- `features/todo-create/api/createTodo.ts`
- `features/todo-create/ui/AddTodoForm.tsx`
- `features/todo-edit/api/updateTodo.ts`
- `features/todo-edit/ui/TodoEditDialog.tsx`
- `features/todo-delete/api/deleteTodo.ts`
- `features/todo-toggle/api/toggleTodo.ts`
- `features/todo-reorder/api/reorderTodos.ts`
- `features/todo-filter/ui/TodoFilter.tsx`
- `features/category-create/api/createCategory.ts`
- `features/category-create/ui/CreateCategoryForm.tsx`
- `features/category-delete/api/deleteCategory.ts`

### widgets/
- `widgets/header/ui/Header.tsx`
- `widgets/todo-list/ui/TodoList.tsx`

### pages/
- `pages/todo-list/ui/TodoListPage.tsx`
- `pages/category-manager/ui/CategoryManagerPage.tsx`
```

---

## 실행 계획

승인 후 `manager-spec` 에이전트를 통해 다음 4개 파일을 생성한다:

1. `.moai/specs/SPEC-TODO-001/spec.md`
2. `.moai/specs/SPEC-TODO-001/plan.md`
3. `.moai/specs/SPEC-TODO-001/acceptance.md`
4. `.moai/specs/SPEC-TODO-001/spec-compact.md`

## 검증 방법

SPEC 생성 후 다음을 확인한다:
- `ls .moai/specs/SPEC-TODO-001/` — 4개 파일 존재 확인
- spec.md YAML frontmatter 8개 필드 존재 확인
- Exclusions 섹션 존재 확인
- `/moai run SPEC-TODO-001` 명령으로 구현 시작 가능 상태 확인
