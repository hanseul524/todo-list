# SPEC-CAL-002 Compact (Run Phase Reference)

**Status**: draft | **Priority**: medium | **Date**: 2026-06-17

---

## 1. File Map

| Action | File | Notes |
|--------|------|-------|
| NEW | `src/shared/lib/calendarUtils.ts` | getPriorityMapByDate 유틸 |
| NEW | `src/entities/todo/ui/PriorityBar.tsx` | 우선순위 컬러 바 컴포넌트 |
| MODIFY | `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` | dot 제거 → PriorityBar 적용 |

**FSD import rules**: shared ← entities ← widgets (상위→하위만 가능)

---

## 2. Implementation Order

1. `calendarUtils.ts` (shared) — 날짜 맵 유틸
2. `PriorityBar.tsx` (entities) — 바 컴포넌트
3. `CalendarSidebar.tsx` (widgets) — 통합

---

## 3. Critical Implementation Details

### calendarUtils.ts

```typescript
import type { Todo, Priority } from "@/entities/todo/model/types"

const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA") // → "YYYY-MM-DD", local timezone

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"]

export function getPriorityMapByDate(todos: Todo[]): Record<string, Priority[]> {
  const map: Record<string, Set<string>> = {} // dateKey → Set<todoId> 중복 방지용
  const priorityMap: Record<string, Priority[]> = {}

  for (const todo of todos) {
    const dates = new Set<string>()
    dates.add(toDateKey(todo.created_at))
    if (todo.due_date) dates.add(toDateKey(todo.due_date))

    for (const dateKey of dates) {
      if (!map[dateKey]) {
        map[dateKey] = new Set()
        priorityMap[dateKey] = []
      }
      if (!map[dateKey].has(todo.id)) {
        map[dateKey].add(todo.id)
        priorityMap[dateKey].push(todo.priority)
      }
    }
  }

  // 각 날짜의 priority 배열을 high → medium → low 순 정렬
  for (const dateKey of Object.keys(priorityMap)) {
    priorityMap[dateKey].sort(
      (a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b)
    )
  }

  return priorityMap
}
```

### PriorityBar.tsx

```typescript
import type { Priority } from "@/entities/todo/model/types"

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#e5534b",
  medium: "#d9922a",
  low: "#27a644",
}

interface Props {
  priorities: Priority[]
}

export function PriorityBar({ priorities }: Props) {
  if (priorities.length === 0) return null

  const width = `${(100 / priorities.length).toFixed(4)}%`

  return (
    <div className="flex w-full overflow-hidden" style={{ height: "3px", borderRadius: "2px" }}>
      {priorities.map((p, i) => (
        <div
          key={i}
          style={{
            width,
            backgroundColor: PRIORITY_COLORS[p],
            borderRadius:
              i === 0 && priorities.length === 1
                ? "2px"
                : i === 0
                ? "2px 0 0 2px"
                : i === priorities.length - 1
                ? "0 2px 2px 0"
                : "0",
          }}
        />
      ))}
    </div>
  )
}
```

### CalendarSidebar.tsx (수정 부분)

CRITICAL: 실제 API는 `DayButton`이다 (`DayContent` 아님 — react-day-picker v9).

```tsx
// 기존 import에 추가
import { getPriorityMapByDate } from "@/shared/lib/calendarUtils"
import { PriorityBar } from "@/entities/todo/ui/PriorityBar"

// 기존 datesWithTodos useMemo 제거, 아래로 교체:
const priorityMap = useMemo(
  () => getPriorityMapByDate(todos),
  [todos]
)

// Calendar components prop:
components={{
  DayButton: (props: React.ComponentProps<typeof DayButton>) => {
    const dateKey = toDateKey(props.day.date)
    const priorities = priorityMap[dateKey] ?? []
    return (
      <CalendarDayButton {...props}>
        <span>{props.day.date.getDate()}</span>
        <PriorityBar priorities={priorities} />
      </CalendarDayButton>
    )
  },
}}
```

주의: `cn` import는 PriorityBar 이동 후 CalendarSidebar에서 더 이상 필요 없을 수 있음 → 사용 여부 확인 후 제거.

---

## 4. Quick Acceptance Checklist

- [ ] 투두 있는 날짜 → 우선순위 컬러 바 표시 (3px 높이)
- [ ] 바 색상: high=#e5534b / medium=#d9922a / low=#27a644
- [ ] 균등 분할 (3개 투두 → 각 33.3333%)
- [ ] 정렬: high → medium → low
- [ ] 투두 없는 날짜 → 바 없음
- [ ] 기존 dot(w-1 h-1 rounded-full bg-[#5e6ad2]) 완전 제거
- [ ] created_at + due_date 양쪽 날짜에 바 표시
- [ ] 중복 방지 (created_at === due_date → 1회만)
- [ ] 날짜 클릭 필터링 정상
- [ ] tsc --noEmit 에러 0 (src/ 기준)

---

## 5. Exclusions

- DB 스키마 변경 없음
- 외부 라이브러리 추가 없음
- shadcn Calendar 교체 없음
- DayContent 사용 금지 (DayButton 사용)
- 바 높이 3px 초과 없음
