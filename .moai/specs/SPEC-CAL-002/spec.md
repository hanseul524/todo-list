---
id: SPEC-CAL-002
version: "1.0.0"
status: draft
created: "2026-06-17"
updated: "2026-06-17"
author: manager-spec
priority: medium
issue_number: 0
---

## HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-17 | Initial SPEC created |

## Description

달력 날짜 셀에 기존 dot 인디케이터를 제거하고, 해당 날짜 투두의 우선순위(priority) 분포를 3px 가로 컬러 바로 시각화한다. high(빨강)/medium(주황)/low(초록) 색상을 균등 분할해서 날짜 숫자 바로 아래 표시한다.

## Requirements

### REQ-01: 날짜별 우선순위 맵 유틸

**SPEC-CAL-002-REQ-01**: The system SHALL provide a `getPriorityMapByDate(todos)` utility that returns a map from date string ("YYYY-MM-DD") to sorted priority array.

Acceptance Criteria:
- 날짜 기준: `created_at` OR `due_date` (둘 중 하나라도 해당 날이면 포함)
- 중복 투두(created_at과 due_date가 같은 날인 경우) 한 번만 포함
- 반환 배열 정렬 순서: high → medium → low
- 투두 없는 날짜는 맵에 포함되지 않음 (빈 배열 반환 금지)

### REQ-02: PriorityBar 컴포넌트

**SPEC-CAL-002-REQ-02**: The system SHALL render a `PriorityBar` component that divides its full width equally among the given priority colors.

Acceptance Criteria:
- props: `priorities: Priority[]`
- priorities가 빈 배열이면 null 반환 (DOM에 렌더링 안 됨)
- 전체 너비를 priorities.length로 균등 분할 (각 세그먼트 `width: \`${100/n}%\``)
- 높이: 3px (절대값, className으로 고정)
- 양 끝만 border-radius: 2px (첫 번째 세그먼트 left radius, 마지막 세그먼트 right radius)
- high → `#e5534b` (빨강)
- medium → `#d9922a` (주황)
- low → `#27a644` (초록)
- 다크/라이트 모드 무관 (CSS 변수 아닌 hex 고정 — 브랜드 우선순위 색상)

### REQ-03: CalendarSidebar 수정

**SPEC-CAL-002-REQ-03**: WHEN the CalendarSidebar renders, it SHALL replace the existing dot indicator with a PriorityBar per date.

Acceptance Criteria:
- 기존 `datesWithTodos` 로직 제거
- `getPriorityMapByDate(todos)`로 날짜별 우선순위 맵 계산 (useMemo)
- `DayButton` 커스텀 렌더러에서 날짜 숫자 + `PriorityBar` 조합
- PriorityBar가 날짜 숫자 바로 아래에 위치 (날짜 셀 높이 초과 금지)
- 날짜 클릭 → useCalendarStore.setSelectedDate 동작 유지

## Exclusions (What NOT to Build)

- DB 스키마 변경 없음
- 외부 차트/캘린더 라이브러리 추가 없음
- shadcn Calendar 컴포넌트 교체 없음
- 바 높이 3px 초과 없음
- FSD import 규칙 위반 없음
- `DayContent` API 사용 금지 (react-day-picker v9는 `DayButton` 사용)
