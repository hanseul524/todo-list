# SPEC-CAL-001 Compact (Run Phase Reference)

**Status**: draft | **Priority**: high | **Date**: 2026-06-17

---

## 1. File Map

| Action | File | Notes |
|--------|------|-------|
| NEW | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` | shadcn Calendar + dot + store write |
| NEW | `src/shared/model/useCalendarStore.ts` | Zustand, no persist |
| MODIFY | `src/widgets/todo-list/ui/TodoList.tsx` | filter by selectedDate, new layout |
| MODIFY | `src/entities/todo/ui/TodoItem.tsx` | row style, no card, done colors |
| MODIFY | `src/pages/todo-list/ui/TodoListPage.tsx` | 2-col flex layout |
| MODIFY | `src/features/todo-create/api/createTodo.ts` | pass created_at |
| MODIFY | `src/entities/todo/model/types.ts` | CreateTodoInput += created_at? |

**FSD import rules**: shared ← entities ← features ← widgets ← pages (upper layers cannot import lower)

---

## 2. Implementation Order

1. `npx shadcn@latest add calendar` — prerequisite
2. `useCalendarStore.ts` (shared)
3. `types.ts` + `TodoItem.tsx` (entity)
4. `createTodo.ts` (feature)
5. `CalendarSidebar.tsx` (widget)
6. `TodoList.tsx` + `AddTodoForm` created_at wiring (widget + feature)
7. `TodoListPage.tsx` (page)

---

## 3. Critical Implementation Details

### Date Comparison (ALWAYS use this)
```typescript
const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-CA')  // → "YYYY-MM-DD", local timezone

// Filter
todos.filter(t => toDateKey(t.created_at) === toDateKey(selectedDate))
```
**DO NOT** use UTC `.toISOString().slice(0, 10)` — timezone mismatch.

### useCalendarStore.ts
```typescript
import { create } from 'zustand'

interface CalendarStore {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>()((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
```
No `persist`. Resets on refresh = intended.

### CalendarSidebar dot rendering
```typescript
// Inside CalendarSidebar
const todos = useTodoStore(s => s.todos)
const datesWithTodos = useMemo(() =>
  new Set(todos.map(t => toDateKey(t.created_at))), [todos])

// shadcn Calendar components prop
components={{
  DayContent: ({ date }) => (
    <div className="relative flex flex-col items-center">
      <span>{date.getDate()}</span>
      {datesWithTodos.has(toDateKey(date)) && (
        <span className="w-1 h-1 rounded-full bg-[#5e6ad2] mt-0.5" />
      )}
    </div>
  )
}}
```

### TodoItem style changes
```
REMOVE: rounded-md border border-border bg-card p-3
REMOVE: opacity-50 (from completed state)
ADD:    flex items-center gap-3 py-3 px-2
ADD:    hover:bg-muted/30

Completed title:
  REMOVE: text-muted-foreground
  ADD:    dark:text-[#8a8f98] text-[#9ea3ae] line-through

DragHandle: keep group-hover visibility
Dragging:   keep border-[#5e6ad2] opacity-80
Row order:  [DragHandle?] [Checkbox] [title flex-1] [PriorityBadge] [CategoryBadge] [DueDate] [DropdownMenu]
```

### TodoList key changes
```typescript
// 1. Import store
const selectedDate = useCalendarStore(s => s.selectedDate)

// 2. Filter
const filteredTodos = todos.filter(t =>
  toDateKey(t.created_at) === toDateKey(selectedDate))

// 3. Date title
selectedDate.toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
})
// → "2026년 6월 10일 수요일"

// 4. Layout: replace grid with
<div className="flex flex-col divide-y divide-border">

// 5. Empty state
"이 날에 등록된 투두가 없습니다. 새 투두를 추가해보세요!"

// 6. AddTodoForm moves HERE (above list, below date title)
```

### createTodo changes
```typescript
// types.ts — add to CreateTodoInput
created_at?: string

// createTodo.ts — add to insert
created_at: input.created_at ?? undefined

// AddTodoForm — call with
createTodo({ ...rest, created_at: selectedDate.toISOString() })
```

### TodoListPage 2-column layout
```tsx
<div className="min-h-screen bg-background">
  <Header />
  <div className="flex flex-col md:flex-row h-[calc(100vh-56px)]">
    <aside className="w-full md:w-[280px] md:shrink-0 overflow-y-auto border-r border-border p-4">
      <CalendarSidebar />
    </aside>
    <main className="flex-1 overflow-y-auto px-6 py-6">
      <TodoFilter />
      <TodoList />  {/* AddTodoForm is now inside TodoList */}
    </main>
  </div>
</div>
```

---

## 4. Quick Acceptance Checklist

- [ ] Desktop: 2-col (CalendarSidebar 280px left, TodoList flex-1 right)
- [ ] Mobile (≤767px): vertical stack (calendar top)
- [ ] Each column scrolls independently
- [ ] Click calendar date → TodoList filters to that date only
- [ ] Date title shows `"YYYY년 M월 D일 요일"` (Korean)
- [ ] AddTodoForm is inside TodoList (not in TodoListPage)
- [ ] New todo saved with `created_at = selectedDate.toISOString()` → appears in current day list
- [ ] Dots appear on calendar dates that have todos (color `#5e6ad2`)
- [ ] Empty date shows message `"이 날에 등록된 투두가 없습니다..."`
- [ ] TodoItem: NO card border/background/padding, YES row style
- [ ] Completed: `line-through` + done-text color, NO `opacity-50`
- [ ] Hover: `bg-muted/30`
- [ ] DnD reorder still works within same-day todos
- [ ] Page refresh resets selectedDate to today
- [ ] `tsc --noEmit` clean, `next lint` clean

---

## 5. Exclusions

- No DB schema changes / migrations
- No external calendar lib (shadcn only)
- No server-side date filtering
- No time-of-day display (day-level only)
- No multi-day or recurring todos
