# SPEC-TODO-001 Compact

> 이 파일은 `/moai run SPEC-TODO-001` 실행 시 로드되는 압축본입니다.
> 전체 내용은 `spec.md`를 참조하세요.

---

## Requirements

- **REQ-01**: The system SHALL provide email/password authentication via Supabase Auth
- **REQ-02**: WHEN unauthenticated user accesses protected route → redirect to `/login`
- **REQ-03**: WHEN user requests sign-out → invalidate Supabase session + redirect to `/login`
- **REQ-04**: WHEN user submits add-todo form → create todo with optimistic update, rollback on failure
- **REQ-05**: The system SHALL load user todos on initial page load via Server Component (no `useEffect`)
- **REQ-06**: WHILE sort/filter/search active → client-side filtering without server requests
- **REQ-07**: WHEN checkbox clicked → toggle `is_done` with optimistic update, rollback on failure
- **REQ-08**: WHEN edit dialog submitted → update todo with optimistic update, rollback on failure
- **REQ-09**: WHEN deletion confirmed → remove todo with optimistic update, rollback on failure
- **REQ-10**: The system SHALL allow category creation (name + color), optimistic update
- **REQ-11**: WHEN category deleted → set `category_id = null` on affected todos (ON DELETE SET NULL)
- **REQ-12**: The system SHALL display priority badges: high=`#e5534b`, medium=`#d9922a`, low=`#27a644`
- **REQ-13**: WHILE `due_date` is in the past → display date in red `#e5534b`
- **REQ-14**: WHILE `searchQuery` active → filter todos by title (client-side, case-insensitive)
- **REQ-15**: The system SHALL persist sort/filter preferences via Zustand persist middleware (localStorage)
- **REQ-16**: WHILE `sortBy === 'position'` → enable dnd-kit `DndContext` + `SortableContext`
- **REQ-17**: WHEN todo dropped in new position → batch update `position` in DB via Server Action, optimistic
- **REQ-18**: The system SHALL support light/dark/system theme via next-themes (`attribute="class"`)
- **REQ-19**: The system SHALL apply `docs/DESIGN.md` color tokens via Tailwind CSS variables in `globals.css`
- **REQ-20**: The system SHALL implement Linear-inspired card grid: Desktop 3col / Tablet 2col / Mobile 1col
- **REQ-21**: The system SHALL apply optimistic updates for all CUD mutations + `useToast` on failure

---

## Exclusions

- OAuth 소셜 로그인 없음 (이메일/비밀번호만)
- 파일/이미지 첨부 없음
- 투두 공유/협업 기능 없음
- 하위 작업(sub-task) / 반복 투두 없음
- 다국어(i18n) 없음 (한국어 고정)
- Pages Router 없음 (App Router만)
- `useEffect` 데이터 페칭 없음

---

## Files to Create

### app/ (FSD app 레이어)
- `src/app/layout.tsx` — ThemeProvider, Toaster 래핑
- `src/app/globals.css` — CSS 변수 (DESIGN.md 토큰 매핑)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(dashboard)/layout.tsx` — 인증 가드
- `src/app/(dashboard)/page.tsx` — 초기 데이터 fetch
- `src/app/(dashboard)/categories/page.tsx`

### shared/ (FSD shared 레이어)
- `src/shared/api/supabaseClient.ts` — `createBrowserClient`
- `src/shared/api/supabaseServer.ts` — `createServerClient`
- `src/shared/types/supabase.ts` — Supabase CLI 생성 타입
- `src/shared/model/useFilterStore.ts` — persist 미들웨어 포함
- `src/shared/lib/utils.ts` — `cn()` 유틸

### entities/ (FSD entities 레이어)
- `src/entities/todo/model/types.ts` — `Todo`, `Priority` 타입
- `src/entities/todo/model/useTodoStore.ts` — Zustand 스토어
- `src/entities/todo/ui/TodoItem.tsx` — 카드 UI (드래그 핸들 + 액션 메뉴)
- `src/entities/todo/ui/TodoPriorityBadge.tsx` — 우선순위 Badge
- `src/entities/category/model/types.ts` — `Category` 타입
- `src/entities/category/ui/CategoryBadge.tsx` — 카테고리 Badge
- `src/entities/user/model/useAuthStore.ts` — 인증 스토어

### features/ (FSD features 레이어)
- `src/features/auth/api/authActions.ts` — signIn, signUp, signOut (JSDoc)
- `src/features/auth/ui/LoginForm.tsx`
- `src/features/auth/ui/SignupForm.tsx`
- `src/features/todo-create/api/createTodo.ts` — Server Action (JSDoc)
- `src/features/todo-create/ui/AddTodoForm.tsx`
- `src/features/todo-edit/api/updateTodo.ts` — Server Action (JSDoc)
- `src/features/todo-edit/ui/TodoEditDialog.tsx`
- `src/features/todo-delete/api/deleteTodo.ts` — Server Action (JSDoc)
- `src/features/todo-toggle/api/toggleTodo.ts` — Server Action (JSDoc)
- `src/features/todo-reorder/api/reorderTodos.ts` — Server Action (JSDoc)
- `src/features/todo-filter/ui/TodoFilter.tsx`
- `src/features/category-create/api/createCategory.ts` — Server Action (JSDoc)
- `src/features/category-create/ui/CreateCategoryForm.tsx`
- `src/features/category-delete/api/deleteCategory.ts` — Server Action (JSDoc)

### widgets/ (FSD widgets 레이어)
- `src/widgets/header/ui/Header.tsx` — 검색 + 다크모드 토글 + 유저 메뉴
- `src/widgets/todo-list/ui/TodoList.tsx` — dnd-kit SortableContext + TodoItem 목록

### pages/ (FSD pages 레이어)
- `src/pages/todo-list/ui/TodoListPage.tsx`
- `src/pages/category-manager/ui/CategoryManagerPage.tsx`

---

## Key Constraints

| 제약 | 규칙 |
|------|------|
| 데이터 페칭 | Server Component만, `useEffect` 금지 |
| `'use client'` | 이벤트 핸들러/훅 필요 시만 사용 |
| 데이터 변경 | Server Actions (`features/*/api/`) |
| TypeScript | `any` 타입 금지, strict 모드 |
| FSD import | 상위 레이어 → 하위 레이어만 |
| 같은 레이어 | 슬라이스 간 직접 import 금지 |
| `shared/ui` | shadcn/ui 컴포넌트만 위치 |
| 에러 처리 | 모든 에러는 `useToast` |
| 디자인 | 그림자(box-shadow) 금지, 폰트 굵기 700+ 금지 |

---

## Design Tokens (docs/DESIGN.md)

```css
/* globals.css — DESIGN.md 토큰 매핑 */
:root {
  --background: 0 0% 100%;       /* light-canvas #ffffff */
  --card: 0 0% 100%;             /* light-canvas */
  --border: 220 9% 89%;          /* light-hairline #e2e4e8 */
  --primary: 237 52% 59%;        /* primary #5e6ad2 */
  --muted: 220 9% 95%;           /* light-surface-1 #f5f6f7 */
  --muted-foreground: 220 9% 44%; /* light-ink-subtle #6b7080 */
}
.dark {
  --background: 240 50% 1%;      /* dark-canvas #010102 */
  --card: 240 5% 6%;             /* dark-surface-1 #0f1011 */
  --border: 225 7% 15%;          /* dark-hairline #23252a */
  --primary: 237 52% 59%;        /* primary (동일) */
  --muted: 240 5% 9%;            /* dark-surface-2 #141516 */
  --muted-foreground: 220 5% 57%; /* dark-ink-subtle #8a8f98 */
}
```
