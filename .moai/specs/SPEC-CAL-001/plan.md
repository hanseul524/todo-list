# SPEC-CAL-001: Implementation Plan

## Overview

이 계획은 SPEC-CAL-001의 7가지 요구사항을 FSD 레이어 의존성 방향에 따라 단계별로 구현한다. 하위 레이어(shared → entities → features → widgets → pages) 순서로 진행하여 import 규칙 위반 없이 안전하게 완성한다.

---

## Implementation Milestones

### Milestone 1 — Prerequisite: shadcn Calendar 설치 (Priority: High)

**목표**: shadcn/ui `calendar` 컴포넌트를 프로젝트에 추가한다.

**작업**:
- `npx shadcn@latest add calendar` 실행
- 설치 후 생성 파일 확인: `src/components/ui/calendar.tsx`
- `date-fns` 또는 `react-day-picker` 의존성이 함께 설치됨을 확인

**완료 기준**: `import { Calendar } from "@/components/ui/calendar"` 가 오류 없이 컴파일됨.

---

### Milestone 2 — Shared Layer: useCalendarStore 생성 (Priority: High)

**목표**: REQ-03 요구사항 충족 — 날짜 상태 공유 스토어.

**작업**:
- `src/shared/model/useCalendarStore.ts` 신규 생성
- Zustand `create` 사용, `persist` 미들웨어 제외
- `selectedDate: Date` 초기값 `new Date()`
- `setSelectedDate: (date: Date) => void` 액션

**FSD 제약**: `shared` 레이어는 상위 레이어를 import하지 않는다.

**완료 기준**: TypeScript strict 컴파일 성공, 다른 레이어에서 import 가능.

---

### Milestone 3 — Entity Layer: CreateTodoInput 확장 + TodoItem 스타일 변경 (Priority: High)

**목표**: REQ-05, REQ-06-A 충족.

**작업 3-A: types.ts 수정**
- `src/entities/todo/model/types.ts` 의 `CreateTodoInput`에 `created_at?: string` 추가

**작업 3-B: TodoItem.tsx 스타일 리팩터**
- Card wrapper 제거: `rounded-md border border-border bg-card p-3` → `flex items-center gap-3 py-3 px-2`
- `opacity-50` 클래스 제거
- 완료 상태: `line-through dark:text-[#8a8f98] text-[#9ea3ae]` 적용 (기존 `line-through text-muted-foreground` 교체)
- 호버: `hover:bg-muted/30` 추가
- 드래그 중: `border border-[#5e6ad2] opacity-80` 유지 (기존 isDragging 로직 보존)
- 행 순서: `[DragHandle] [Checkbox] [title] [PriorityBadge] [CategoryBadge] [DueDate] [DropdownMenu]`
- `group-hover` DragHandle 가시성 보존

**완료 기준**: 기존 TodoItem 스냅샷 테스트(있다면) 업데이트, 시각적 회귀 없음.

---

### Milestone 4 — Feature Layer: createTodo Server Action 수정 (Priority: High)

**목표**: REQ-06-B, REQ-06-C 충족.

**작업**:
- `src/features/todo-create/api/createTodo.ts` 수정
- Supabase insert에 `created_at: input.created_at ?? undefined` 추가
- `CreateTodoInput` 타입 변경이 이미 Milestone 3에서 완료됨을 확인

**완료 기준**: `created_at`을 전달하면 해당 값으로 저장, 미전달 시 DB default(`now()`) 사용.

---

### Milestone 5 — Widget Layer: CalendarSidebar 생성 (Priority: High)

**목표**: REQ-02 전체 충족.

**작업**:
- `src/widgets/calendar-sidebar/` 디렉터리 구조 생성
- `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` 신규 생성
- shadcn `Calendar` 컴포넌트를 `mode="single"` 로 사용
- `selected` prop: `useCalendarStore.selectedDate`
- `onSelect` prop: `useCalendarStore.setSelectedDate`
- **dot 렌더링 로직**:
  - `useTodoStore` todos 읽기
  - `todos.reduce`로 `Set<string>` (YYYY-MM-DD strings) 계산
  - 날짜 변환: `new Date(todo.created_at).toLocaleDateString('en-CA')`
  - shadcn Calendar의 `components` prop 또는 `modifiers` + `modifiersStyles` 를 활용하여 dot 표시
  - dot 스타일: `width: 4px, height: 4px, background: #5e6ad2, border-radius: 50%`

**FSD 제약**: `entities`, `shared` 레이어만 import 가능.

**완료 기준**: 캘린더 렌더링, 날짜 클릭 시 store 업데이트, dot 표시 정상 동작.

---

### Milestone 6 — Widget Layer: TodoList 수정 (Priority: High)

**목표**: REQ-04 전체 충족.

**작업**:
- `src/widgets/todo-list/ui/TodoList.tsx` 수정
- `useCalendarStore` import 및 `selectedDate` 구독
- 날짜 필터 로직: `todos.filter(t => new Date(t.created_at).toLocaleDateString('en-CA') === selectedDate.toLocaleDateString('en-CA'))`
- 날짜 타이틀 렌더링: `selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })`
- `AddTodoForm` 을 list 위로 이동 (TodoListPage에서 제거됨 — Milestone 7에서 처리)
- 레이아웃 변경: `grid grid-cols-...` → `flex flex-col divide-y divide-border`
- 빈 상태 메시지: `"이 날에 등록된 투두가 없습니다. 새 투두를 추가해보세요!"`
- 기존 DnD, toggle, delete, edit 동작 보존

**완료 기준**: selectedDate 변경 시 즉시 재필터링, 모든 기존 기능 정상 동작.

---

### Milestone 7 — Feature Layer: AddTodoForm created_at 연동 (Priority: High)

**목표**: REQ-07 충족.

**작업**:
- `AddTodoForm` 컴포넌트에서 `useCalendarStore.selectedDate` 구독
- `createTodo` 호출 시 `created_at: selectedDate.toISOString()` 포함
- `features` 레이어에서 `shared` 레이어 스토어 import (FSD 허용)

**완료 기준**: 선택한 날짜에 투두 추가 시 해당 날짜의 목록에 즉시 표시.

---

### Milestone 8 — Page Layer: TodoListPage 2-column 레이아웃 (Priority: High)

**목표**: REQ-01 전체 충족.

**작업**:
- `src/pages/todo-list/ui/TodoListPage.tsx` 수정
- 기존 `space-y-6` 단일 컬럼 → 2-컬럼 flex 레이아웃
- 구조:
  ```
  <div className="flex flex-col md:flex-row h-[calc(100vh-56px)]">
    <aside className="w-full md:w-[280px] md:shrink-0 overflow-y-auto border-r border-border p-4">
      <CalendarSidebar />
    </aside>
    <main className="flex-1 overflow-y-auto px-6 py-6">
      <TodoFilter />   {/* 위치 결정: 구현자 재량 */}
      <TodoList />
    </main>
  </div>
  ```
- `AddTodoForm` 제거 (TodoList 내부로 이동됨)
- 모바일: `flex-col` (calendar top)

**완료 기준**: 데스크탑 2-컬럼, 모바일 스택, 각 컬럼 독립 스크롤.

---

## Technical Approach

### Date Comparison Strategy

```
// 항상 이 방식 사용 (로컬 타임존 기준)
const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-CA')   // "YYYY-MM-DD"

// 비교
const matches = toDateKey(todo.created_at) === toDateKey(selectedDate)
```

`en-CA` 로케일은 브라우저 시스템 로케일에 무관하게 `YYYY-MM-DD` 포맷을 보장한다.

### shadcn Calendar Dot Rendering

shadcn `Calendar`는 내부적으로 `react-day-picker`를 사용한다. dot 렌더링은 두 방법 중 하나를 선택한다:

**Option A (권장)**: `components` prop으로 `DayContent` 커스터마이징
```tsx
components={{
  DayContent: ({ date }) => (
    <div className="relative">
      <span>{date.getDate()}</span>
      {datesWithTodos.has(toDateKey(date)) && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5e6ad2]" />
      )}
    </div>
  )
}}
```

**Option B**: `modifiers` + `modifiersClassNames` (CSS 기반)

### State Flow

```
useCalendarStore.selectedDate
    ↑ setSelectedDate()          ↓ read selectedDate
CalendarSidebar              TodoList, AddTodoForm
```

### Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| shadcn Calendar API 변경 | Low | `npx shadcn@latest add calendar` 로 최신 버전 설치 후 API 확인 |
| DnD position 재계산 오류 | Medium | filteredTodos 기준 position 업데이트는 기존 로직 그대로 사용 |
| created_at timezone mismatch | Medium | `toLocaleDateString('en-CA')` 로 로컬 타임존 고정 |
| react-day-picker `DayContent` prop 이름 변경 | Low | v9 기준 확인 후 적용 |

---

## Implementation Order Summary

1. `npx shadcn@latest add calendar` (Prerequisite)
2. `useCalendarStore.ts` — shared layer (M2)
3. `types.ts` + `TodoItem.tsx` — entity layer (M3)
4. `createTodo.ts` — feature layer (M4)
5. `CalendarSidebar.tsx` — widget layer (M5)
6. `TodoList.tsx` — widget layer (M6)
7. `AddTodoForm` created_at 연동 — feature layer (M7)
8. `TodoListPage.tsx` — page layer (M8)
