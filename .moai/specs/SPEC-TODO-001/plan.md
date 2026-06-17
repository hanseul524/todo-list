# Implementation Plan: SPEC-TODO-001

## Technology Stack

| 영역 | 선택 | 버전 |
|------|------|------|
| 프레임워크 | Next.js | 14+ (App Router) |
| 언어 | TypeScript | 5.x (strict mode) |
| DB/Auth | Supabase | latest stable |
| UI | shadcn/ui + Tailwind CSS | latest stable |
| 상태관리 | Zustand | 4.x |
| DnD | @dnd-kit/core, @dnd-kit/sortable | 6.x |
| 테마 | next-themes | 0.3.x |
| 아키텍처 | Feature-Sliced Design (FSD) | — |
| 배포 | Vercel | — |

---

## Phase Structure

### Phase 1: 프로젝트 초기화 (Priority: Critical)

- Next.js 14 프로젝트 생성 (`create-next-app@latest --typescript`)
- TypeScript strict 모드 활성화 (`tsconfig.json`)
- Supabase 프로젝트 설정 및 환경변수 구성
- Tailwind CSS 설치 및 `tailwind.config.ts` 설정
- shadcn/ui 초기화 (`npx shadcn@latest init`)
- DESIGN.md 기반 CSS 변수 → `globals.css` 작성
- Inter 폰트 설정 (`next/font/google`)
- Zustand, @dnd-kit/core, @dnd-kit/sortable, next-themes 설치
- FSD 디렉터리 구조 생성 (`src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`)

### Phase 2: shared 레이어 (Priority: Critical)

- `shared/api/supabaseClient.ts`: `createBrowserClient` (클라이언트용)
- `shared/api/supabaseServer.ts`: `createServerClient` (서버 컴포넌트/Server Action용)
- `shared/types/supabase.ts`: Supabase CLI 타입 (`npx supabase gen types typescript`)
- `shared/lib/utils.ts`: `cn()` (clsx + tailwind-merge)
- `shared/model/useFilterStore.ts`: Zustand + persist 미들웨어
- `shared/ui/`: shadcn/ui 컴포넌트 설치
  - button, input, card, badge, dialog, checkbox
  - popover, calendar, select, dropdown-menu, toast, sonner

### Phase 3: entities 레이어 (Priority: High)

- `entities/todo/model/types.ts`: `Todo`, `Priority`, `CreateTodoInput`, `UpdateTodoInput` 타입
- `entities/todo/model/useTodoStore.ts`: Zustand 스토어 (`todos`, `setTodos`, `addTodo`, `updateTodo`, `deleteTodo`, `reorderTodos`)
- `entities/category/model/types.ts`: `Category`, `CreateCategoryInput` 타입
- `entities/category/model/useCategoryStore.ts`: Zustand 스토어 (필요시)
- `entities/user/model/useAuthStore.ts`: `user`, `setUser`
- `entities/todo/ui/TodoItem.tsx`: 카드 UI (체크박스 + 제목 + Badge + 드래그 핸들 + 액션 메뉴)
- `entities/todo/ui/TodoPriorityBadge.tsx`: 우선순위 Badge (DESIGN.md 색상)
- `entities/category/ui/CategoryBadge.tsx`: 카테고리 Badge (color 필드 기반)

### Phase 4: 인증 (Priority: Critical)

- `features/auth/api/authActions.ts`: `signIn`, `signUp`, `signOut` Server Actions (JSDoc 주석 포함)
- `features/auth/ui/LoginForm.tsx`: 이메일/비밀번호 폼 (`'use client'`)
- `features/auth/ui/SignupForm.tsx`: 회원가입 폼 (`'use client'`)
- `app/(auth)/login/page.tsx`: LoginForm 렌더링
- `app/(auth)/signup/page.tsx`: SignupForm 렌더링
- `app/(dashboard)/layout.tsx`: `auth.getUser()` 검증, 미인증 시 `/login` 리다이렉트

### Phase 5: 투두 CRUD (Priority: Critical)

- `features/todo-create/api/createTodo.ts`: Server Action (JSDoc 포함)
- `features/todo-create/ui/AddTodoForm.tsx`: 제목 + 우선순위 + 카테고리 + DatePicker 폼
- `features/todo-edit/api/updateTodo.ts`: Server Action (JSDoc 포함)
- `features/todo-edit/ui/TodoEditDialog.tsx`: shadcn Dialog + 편집 폼
- `features/todo-delete/api/deleteTodo.ts`: Server Action (JSDoc 포함)
- `features/todo-toggle/api/toggleTodo.ts`: Server Action (JSDoc 포함)

낙관적 업데이트 패턴 (모든 CUD):
```
1. 즉시 useTodoStore 업데이트
2. Server Action 호출
3. 실패 시 이전 상태로 복원 + useToast 에러
```

### Phase 6: 카테고리 및 필터 (Priority: High)

- `features/category-create/api/createCategory.ts`: Server Action (JSDoc 포함)
- `features/category-create/ui/CreateCategoryForm.tsx`: 이름 + 색상 선택 폼
- `features/category-delete/api/deleteCategory.ts`: Server Action (JSDoc 포함)
- `features/todo-filter/ui/TodoFilter.tsx`: 검색 + 정렬 Select + 필터 탭 + 카테고리 필터

### Phase 7: 드래그 앤 드롭 (Priority: Medium)

- `features/todo-reorder/api/reorderTodos.ts`: batch position 업데이트 Server Action
- `widgets/todo-list/ui/TodoList.tsx`: `DndContext` + `SortableContext` 통합
  - `sortBy !== 'position'`이면 dnd-kit 비활성화 (일반 목록으로 렌더링)
  - `sortBy === 'position'`이면 `useSortable` 훅 활성화

### Phase 8: 위젯 및 페이지 조합 (Priority: High)

- `widgets/header/ui/Header.tsx`: 로고 + 검색창 + 다크모드 토글 + 유저 메뉴 (드롭다운)
- `pages/todo-list/ui/TodoListPage.tsx`: Header + TodoFilter + AddTodoForm + TodoList 조합
- `pages/category-manager/ui/CategoryManagerPage.tsx`: 카테고리 목록 + 생성 폼
- `app/(dashboard)/page.tsx`: `TodoListPage` 렌더링 (Server Component, 초기 데이터 fetch)
- `app/(dashboard)/categories/page.tsx`: `CategoryManagerPage` 렌더링
- `app/layout.tsx`: `ThemeProvider` + `Toaster` 래핑

### Phase 9: 디자인 완성 및 반응형 (Priority: High)

- `app/globals.css`: DESIGN.md CSS 변수 완전 매핑
  ```css
  :root { --background: 0 0% 100%; --card: 0 0% 100%; ... }
  .dark { --background: 240 50% 1%; --card: 240 5% 6%; ... }
  ```
- 카드 그리드: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 lg:gap-4`
- 최대 너비: `max-w-[1200px] mx-auto px-6`
- 카드 애니메이션: `animate-in fade-in slide-in-from-bottom-1 duration-150`
- 드래그 핸들: hover 시 visible (`group-hover:visible invisible`)

---

## Key Constraints

| 제약 | 내용 |
|------|------|
| `useEffect` 금지 | 데이터 페칭은 Server Component 또는 Server Action |
| `any` 타입 금지 | TypeScript strict 모드 준수 |
| FSD import | 상위 → 하위만 허용 |
| 같은 레이어 | 슬라이스 간 직접 import 금지 |
| `shared/ui` | shadcn/ui 컴포넌트만 위치 |
| 에러 처리 | 모든 에러는 `useToast` |
| 그림자 | `box-shadow` 사용 금지 |
| 폰트 굵기 | 700 이상 금지 |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## Zustand 스토어 인터페이스

```typescript
// entities/todo/model/useTodoStore.ts
interface TodoStore {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  reorderTodos: (todos: Todo[]) => void
}

// entities/user/model/useAuthStore.ts
interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

// shared/model/useFilterStore.ts (persist 적용)
interface FilterStore {
  searchQuery: string
  selectedCategory: string | null
  sortBy: 'created_at' | 'due_date' | 'priority' | 'position'
  filterBy: 'all' | 'done' | 'undone'
  setSearchQuery: (q: string) => void
  setSelectedCategory: (id: string | null) => void
  setSortBy: (sort: FilterStore['sortBy']) => void
  setFilterBy: (filter: FilterStore['filterBy']) => void
}
```

---

## Database Setup (Supabase Dashboard에서 실행)

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
