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

---

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
- 마감일 초과: `#e5534b` 텍스트 적용
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

---

## Constraints

### 코드 컨벤션
- App Router만 사용 (Pages Router 금지)
- Server Component 기본, `'use client'`는 이벤트/훅 필요 시만 사용
- 데이터 변경은 Server Actions으로 처리 (`features/*/api/` 위치)
- 데이터 페칭에 `useEffect` 금지
- `any` 타입 금지, strict 모드 준수
- FSD 레이어 import 규칙 엄격 준수 (상위 → 하위만 가능)
- 같은 레이어 슬라이스 간 직접 import 금지
- Server Actions에 JSDoc 주석 작성
- `shared/ui`는 shadcn/ui 컴포넌트만, 커스텀 컴포넌트는 각 레이어 `ui/`에 위치

### 보안
- Supabase 인증 정보는 환경변수로 관리 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- RLS 정책 전 테이블 필수 적용
- 모든 DB 접근은 인증된 사용자로 제한

### 데이터베이스 스키마

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamptz default now() not null
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  is_done boolean default false not null,
  priority text check (priority in ('high','medium','low')) default 'medium' not null,
  due_date date,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table categories enable row level security;
alter table todos enable row level security;
create policy "본인 카테고리만 접근" on categories for all using (auth.uid() = user_id);
create policy "본인 투두만 접근" on todos for all using (auth.uid() = user_id);
```
