# Acceptance Test Scenarios: SPEC-CAL-002

## 시나리오

### TC-BAR-01: 단일 high 투두
Given: 2026-06-17에 high 투두 1개 (created_at = "2026-06-17")
When: CalendarSidebar 렌더링
Then: 6/17 셀 아래 #e5534b 100% 가로 바 표시

### TC-BAR-02: 복수 우선순위
Given: 2026-06-18에 high 1개, low 2개 (created_at 기준)
When: CalendarSidebar 렌더링
Then: 6/18 셀 아래 [#e5534b 33.3%][#27a644 33.3%][#27a644 33.3%] 좌→우 순서

### TC-BAR-03: 투두 없는 날짜
Given: 2026-06-19에 투두 없음
When: CalendarSidebar 렌더링
Then: 6/19 셀 아래 바 미표시 (DOM에 PriorityBar 엘리먼트 없음)

### TC-BAR-04: due_date 기준 반영
Given: 투두의 due_date = "2026-06-20", created_at = "2026-06-17"
When: CalendarSidebar 렌더링
Then: 6/17과 6/20 양쪽 셀에 해당 투두 우선순위 바 표시

### TC-BAR-05: created_at === due_date 중복 방지
Given: 투두의 created_at = due_date = "2026-06-17"
When: `getPriorityMapByDate` 호출
Then: 6/17 날짜에 해당 투두 우선순위 1회만 포함 (중복 없음)

### TC-BAR-06: 기존 dot 제거 확인
Given: 이전 구현의 dot 인디케이터 (span.w-1.h-1.rounded-full.bg-\[#5e6ad2\])
When: SPEC-CAL-002 구현 완료
Then: 달력 셀 DOM에 해당 dot 엘리먼트 없음

### TC-BAR-07: 날짜 클릭 동작 유지
Given: 바가 표시된 날짜 셀 클릭
When: 클릭 이벤트 발생
Then: `useCalendarStore.selectedDate` 업데이트, 투두 리스트 필터링 정상 동작

### TC-BAR-08: 다크모드 색상 불변
Given: 다크모드 활성화
When: CalendarSidebar 렌더링
Then: 바 색상 동일 (#e5534b / #d9922a / #27a644) — CSS 변수 영향 없음 (hex 고정)

### TC-BAR-09: 우선순위 정렬 순서
Given: 2026-06-21에 low 1개, high 1개, medium 1개
When: `getPriorityMapByDate` 호출
Then: 반환 배열 순서: ["high", "medium", "low"]

### TC-BAR-10: priorities 빈 배열 시 null 반환
Given: `<PriorityBar priorities={[]} />` 렌더링
When: 컴포넌트 렌더링
Then: null 반환, DOM에 div 엘리먼트 없음

## 합격 기준 체크리스트

- [ ] 투두가 있는 날짜 아래 우선순위 색상 바가 표시됨
- [ ] high(#e5534b) / medium(#d9922a) / low(#27a644) 색상 정확히 적용됨
- [ ] 여러 투두 → 균등 분할 가로 표시
- [ ] 우선순위 정렬: high → medium → low (왼쪽부터)
- [ ] 투두 없는 날짜 → 바 미표시
- [ ] 기존 dot(w-1 h-1 rounded-full bg-[#5e6ad2]) 완전히 제거됨
- [ ] 중복 투두(created_at === due_date) 한 번만 카운트
- [ ] created_at + due_date 양쪽 날짜에 바 표시
- [ ] 다크/라이트 모드 정상 (hex 고정으로 CSS 변수 영향 없음)
- [ ] 날짜 클릭 → 투두 필터링 정상 유지
- [ ] tsc --noEmit 에러 0

## Definition of Done

1. 모든 TC-BAR-01 ~ TC-BAR-10 시나리오 통과
2. 위 체크리스트 전 항목 체크
3. FSD import 방향 위반 없음 (shared ← entities ← widgets)
4. `DayContent` 미사용 확인 (DayButton만 사용)
5. TypeScript strict 모드 에러 0
