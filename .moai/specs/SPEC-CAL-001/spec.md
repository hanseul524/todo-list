---
id: SPEC-CAL-001
version: "1.0.0"
status: draft
created: "2026-06-17"
updated: "2026-06-17"
author: manager-spec
priority: high
issue_number: 0
---

## HISTORY

| Date       | Version | Change                          | Author       |
|------------|---------|--------------------------------|--------------|
| 2026-06-17 | 1.0.0   | Initial draft — Calendar Sidebar + Todo 2-column layout | manager-spec |

---

# SPEC-CAL-001: Calendar Sidebar + Todo List 2-Column Layout

## Overview

기존 단일 컬럼 TodoListPage를 **캘린더 사이드바(좌) + 날짜별 투두 목록(우)** 2-컬럼 레이아웃으로 재편한다. 사용자는 캘린더에서 날짜를 선택하면 해당 날짜에 생성된 투두만 우측에 표시된다. 투두 아이템 UI는 카드 스타일에서 체크리스트 행 스타일로 변경된다.

## Scope

**변경 대상 파일 (FSD 레이어별)**

| Action | File | FSD Layer |
|--------|------|-----------|
| NEW    | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` | Widget |
| NEW    | `src/shared/model/useCalendarStore.ts` | Shared Store |
| MODIFY | `src/widgets/todo-list/ui/TodoList.tsx` | Widget |
| MODIFY | `src/entities/todo/ui/TodoItem.tsx` | Entity UI |
| MODIFY | `src/pages/todo-list/ui/TodoListPage.tsx` | Page |
| MODIFY | `src/features/todo-create/api/createTodo.ts` | Feature API |
| MODIFY | `src/entities/todo/model/types.ts` | Entity Model |

## Requirements

### REQ-01: 2-Column Layout (TodoListPage)

**REQ-01-A** (Ubiquitous)
The TodoListPage **shall** render a flex-row container with `CalendarSidebar` (left, fixed 280px) and a todo area (right, `flex-1`) when the viewport width is 768px or greater.

**REQ-01-B** (State-Driven)
**While** the viewport width is 767px or less, the TodoListPage **shall** render a flex-col container with `CalendarSidebar` on top and the todo area below.

**REQ-01-C** (Ubiquitous)
The CalendarSidebar column and the todo area column **shall** each scroll independently (each column overflow-y: auto).

**REQ-01-D** (Ubiquitous)
The overall page layout **shall** use `min-h-screen` and the existing `Header` component at 56px height.

---

### REQ-02: CalendarSidebar Widget (NEW)

**REQ-02-A** (Ubiquitous)
The system **shall** provide a new file `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` that wraps the shadcn/ui `Calendar` component in single-date selection mode.

**REQ-02-B** (Event-Driven)
**When** a user clicks a date in `CalendarSidebar`, the component **shall** call `useCalendarStore.setSelectedDate(date)` with the clicked `Date` object.

**REQ-02-C** (Ubiquitous)
The `CalendarSidebar` **shall** display a dot indicator below each date cell that has one or more todos whose `created_at` date (YYYY-MM-DD, local timezone) matches that calendar date.

**REQ-02-D** (Ubiquitous)
The dot indicator **shall** use color `#5e6ad2` (primary token).

**REQ-02-E** (Ubiquitous)
The dot logic **shall** derive the set of dates-with-todos from `useTodoStore` todos by comparing `created_at` as `new Date(todo.created_at).toLocaleDateString('en-CA')` (YYYY-MM-DD) strings only — full ISO timestamp comparison is prohibited.

**REQ-02-F** (Ubiquitous)
The `CalendarSidebar` widget **shall** import from `entities` and `shared` layers only (FSD constraint).

**REQ-02-G** (Unwanted Behavior)
**If** the shadcn `calendar` component is not installed, **then** the system **shall** fail with a clear import error rather than silently rendering nothing.

---

### REQ-03: useCalendarStore (NEW)

**REQ-03-A** (Ubiquitous)
The system **shall** provide `src/shared/model/useCalendarStore.ts` exporting a Zustand store with the following interface:

```typescript
interface CalendarStore {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}
```

**REQ-03-B** (Ubiquitous)
The `selectedDate` initial value **shall** be `new Date()` (today at the time of store creation).

**REQ-03-C** (Ubiquitous)
The store **shall NOT** use Zustand `persist` middleware — a page refresh resetting `selectedDate` to today is acceptable behavior.

**REQ-03-D** (Ubiquitous)
The `shared` layer store **shall** import nothing from `widgets`, `features`, `entities`, or `pages` layers (FSD constraint).

---

### REQ-04: TodoList Widget Changes (MODIFY)

**REQ-04-A** (Ubiquitous)
`TodoList.tsx` **shall** subscribe to `useCalendarStore.selectedDate` and filter the displayed todos to only those whose `created_at` local date (YYYY-MM-DD) matches `selectedDate`'s local date.

**REQ-04-B** (Ubiquitous)
The date comparison **shall** use `new Date(todo.created_at).toLocaleDateString('en-CA') === selectedDate.toLocaleDateString('en-CA')` — UTC-based comparison is prohibited.

**REQ-04-C** (Ubiquitous)
`TodoList.tsx` **shall** display a date title above the list in the format `"YYYY년 M월 D일 요일"` using Korean locale (`selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })`).

**REQ-04-D** (Ubiquitous)
`TodoList.tsx` **shall** render `AddTodoForm` below the date title and above the filtered todo list, replacing its previous position in `TodoListPage`.

**REQ-04-E** (Ubiquitous)
The todo list layout **shall** change from the existing CSS grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`) to a vertical flex list (`flex flex-col divide-y divide-border`).

**REQ-04-F** (State-Driven)
**While** the filtered todo list is empty, `TodoList.tsx` **shall** display the message: `"이 날에 등록된 투두가 없습니다. 새 투두를 추가해보세요!"`.

**REQ-04-G** (Ubiquitous)
All existing functionality — DnD reorder (dnd-kit), toggle complete, delete, edit — **shall** be preserved. DnD scope is limited to todos within the currently selected calendar date (`filteredTodos` is already scoped).

**REQ-04-H** (Ubiquitous)
`TodoFilter` **shall** remain accessible; its placement (inside `TodoListPage` header area or moved to `CalendarSidebar` header) is left to implementer discretion, provided it remains visible.

---

### REQ-05: TodoItem Entity UI Changes (MODIFY)

**REQ-05-A** (Ubiquitous)
`TodoItem.tsx` **shall** remove the Card wrapper styles (`rounded-md border border-border bg-card p-3`) and replace with a row style: `flex items-center gap-3 py-3 px-2`.

**REQ-05-B** (Ubiquitous)
The row layout order **shall** be: `[DragHandle?] [Checkbox] [title flex-1] [PriorityBadge] [CategoryBadge] [DueDate] [DropdownMenu]`.

**REQ-05-C** (State-Driven)
**While** a todo's `is_done` is `true`, the title **shall** apply `line-through` and use the done-text color tokens: `dark:text-[#8a8f98] text-[#9ea3ae]`.

**REQ-05-D** (Ubiquitous)
The completed todo **shall NOT** apply `opacity-50` — the `opacity-50` class must be removed.

**REQ-05-E** (Ubiquitous)
`TodoItem.tsx` **shall** apply `hover:bg-muted/30` on row hover.

**REQ-05-F** (State-Driven)
**While** a todo is being dragged (`isDragging` is true), the row **shall** apply `border border-[#5e6ad2] opacity-80`.

**REQ-05-G** (Ubiquitous)
The `DragHandle` **shall** remain visible on `group-hover` (existing behavior preserved).

---

### REQ-06: createTodo Server Action Changes (MODIFY)

**REQ-06-A** (Ubiquitous)
`CreateTodoInput` in `src/entities/todo/model/types.ts` **shall** be extended with an optional field: `created_at?: string` (ISO string).

**REQ-06-B** (Ubiquitous)
The `createTodo` server action **shall** pass `created_at: input.created_at ?? undefined` to the Supabase insert, allowing the DB default (`now()`) when the field is absent.

**REQ-06-C** (Ubiquitous)
No new DB columns or schema migrations **shall** be introduced — `created_at` already exists in the `todos` table with a DB-level default.

---

### REQ-07: AddTodoForm Changes (MODIFY)

**REQ-07-A** (Ubiquitous)
`AddTodoForm` **shall** subscribe to `useCalendarStore.selectedDate` and pass `created_at: selectedDate.toISOString()` as part of the `CreateTodoInput` when calling `createTodo`.

**REQ-07-B** (Ubiquitous)
`AddTodoForm` **shall** be rendered inside `TodoList.tsx`, not in `TodoListPage.tsx`.

---

## Non-Functional Requirements

**NFR-01** (Ubiquitous)
The system **shall** maintain TypeScript strict mode compliance — no `any` types introduced.

**NFR-02** (Ubiquitous)
The system **shall** maintain FSD import rules: widgets may import from entities, features, shared; features from entities, shared; entities from shared; shared imports nothing from upper layers.

**NFR-03** (Ubiquitous)
The system **shall** install the shadcn `calendar` component via `npx shadcn@latest add calendar` before referencing it in code.

**NFR-04** (Ubiquitous)
The system **shall** use only `tailwindcss` utility classes and existing design tokens — no inline style attributes on JSX elements (except where Tailwind arbitrary values `text-[#hex]` are used for color tokens).

---

## Exclusions (What NOT to Build)

- **No new DB columns or schema changes** — `created_at` column already exists; no migrations required.
- **No external calendar library** — only shadcn/ui `Calendar` component is permitted.
- **No new date field on Todo type** beyond extending `CreateTodoInput.created_at` (existing DB column).
- **No server-side date filtering** — all filtering stays client-side in Zustand stores.
- **No recurring events or multi-day todos** — single `created_at` date assignment only.
- **No time-of-day display** — dates are compared at the day level (YYYY-MM-DD) only.
- **No migration files** — Supabase schema is unchanged.
- **No new authentication or authorization changes**.
