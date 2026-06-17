# Implementation Plan: SPEC-CAL-002

## Overview

CalendarSidebar의 dot 인디케이터를 우선순위 컬러 바로 교체하는 3단계 구현 계획.
FSD(Feature-Sliced Design) 레이어 규칙을 준수하여 shared → entities → widgets 순서로 구현한다.

## Phase Structure

### Phase 1 (Priority: High): 유틸 레이어 — shared

**파일**: `src/shared/lib/calendarUtils.ts` (신규 생성)

구현 내용:
- `getPriorityMapByDate(todos: Todo[])` 함수
- 날짜 기준: `created_at` OR `due_date` — `toLocaleDateString('en-CA')` 사용 (UTC slice 금지, 로컬 타임존 기준)
- 중복 방지: `Set<string>`으로 todoId 추적 (created_at === due_date인 경우 1회만 포함)
- 반환 타입: `Record<string, Priority[]>` — 각 날짜의 배열은 high → medium → low 정렬
- 빈 배열 날짜는 맵에서 제외

의존성: `@/entities/todo/model/types` (Priority, Todo 타입 import)

### Phase 2 (Priority: High): 엔티티 레이어 — entities

**파일**: `src/entities/todo/ui/PriorityBar.tsx` (신규 생성)

구현 내용:
- props: `{ priorities: Priority[] }`
- `priorities.length === 0` → `null` 반환
- 균등 분할: `width: ${(100 / n).toFixed(4)}%`
- 높이: `3px` (inline style 또는 className 고정)
- border-radius: 2px — 첫 번째 세그먼트 left, 마지막 세그먼트 right만 적용
- 색상 맵: `{ high: "#e5534b", medium: "#d9922a", low: "#27a644" }` (hex 고정, CSS 변수 사용 금지)

### Phase 3 (Priority: High): 위젯 레이어 — widgets

**파일**: `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` (수정)

변경 내용:
- `datesWithTodos` useMemo 제거
- `priorityMap` useMemo 추가 (`getPriorityMapByDate(todos)`)
- import 추가: `getPriorityMapByDate`, `PriorityBar`
- `DayButton` 커스텀 렌더러에서 dot span 제거 → `<PriorityBar priorities={priorityMap[dateKey] ?? []} />` 삽입
- `cn` import 불필요 시 제거 (사용 여부 확인 후 판단)

## Key Constraints

- `DayContent` 사용 금지 — react-day-picker v9 API는 `DayButton`
- 날짜 변환: `toLocaleDateString('en-CA')` 사용 (`.slice(0, 10)` 패턴 금지)
- TypeScript `any` 타입 금지
- FSD import 방향: shared ← entities ← widgets (하위 레이어에서 상위 레이어 import 금지)
- tsc --noEmit 에러 0 통과 필수

## Risks

| 리스크 | 대응 |
|--------|------|
| DayButton props 타입 변경 (react-day-picker 버전업) | `React.ComponentProps<typeof DayButton>` 사용으로 런타임 안전 |
| 날짜 타임존 불일치 | `toLocaleDateString('en-CA')` 일관 적용으로 방지 |
| 기존 dot DOM이 남는 경우 | grep으로 `w-1 h-1 rounded-full bg-\[#5e6ad2\]` 확인 후 제거 |
| cn import 누락/잉여 | 수정 후 tsc로 확인 |

## Implementation Order

1. `src/shared/lib/calendarUtils.ts` — 독립 유틸, 먼저 구현
2. `src/entities/todo/ui/PriorityBar.tsx` — calendarUtils 불필요, 독립 컴포넌트
3. `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx` — 위 두 파일 완성 후 통합
