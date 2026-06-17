# SPEC-CAL-001: Acceptance Criteria

## Acceptance Test Scenarios

---

### SCEN-01: 2-컬럼 레이아웃 렌더링 (REQ-01)

**Given** 사용자가 TodoListPage에 접근하고 뷰포트 너비가 768px 이상인 경우

**When** 페이지가 렌더링될 때

**Then**
- 좌측에 `CalendarSidebar`가 고정 너비 280px로 표시된다
- 우측에 Todo 영역이 나머지 너비(`flex-1`)를 차지한다
- 두 컬럼은 나란히 배치된다 (`flex-row`)
- 각 컬럼은 독립적으로 스크롤 가능하다 (`overflow-y: auto`)

---

### SCEN-02: 모바일 레이아웃 스택 (REQ-01-B)

**Given** 사용자가 TodoListPage에 접근하고 뷰포트 너비가 767px 이하인 경우

**When** 페이지가 렌더링될 때

**Then**
- `CalendarSidebar`가 상단에 렌더링된다
- Todo 영역이 CalendarSidebar 아래에 렌더링된다
- 레이아웃이 수직 스택 (`flex-col`) 형태이다

---

### SCEN-03: 캘린더 날짜 선택 → Todo 목록 필터링 (REQ-02-B, REQ-04-A, REQ-04-B)

**Given** 투두 데이터가 다음과 같이 존재한다:
- 투두 A: `created_at = "2026-06-10T09:00:00+09:00"` (한국 표준시 기준 6월 10일)
- 투두 B: `created_at = "2026-06-11T00:00:00.000Z"` (UTC 기준 6월 11일 = KST 6월 11일 9시)
- `selectedDate` 초기값: 오늘 (`new Date()`)

**When** 사용자가 캘린더에서 2026년 6월 10일을 클릭할 때

**Then**
- `useCalendarStore.selectedDate`가 2026-06-10에 해당하는 `Date` 객체로 업데이트된다
- TodoList에는 투두 A만 표시된다
- 투두 B는 목록에 표시되지 않는다
- 날짜 타이틀이 `"2026년 6월 10일 수요일"` 형태로 표시된다

---

### SCEN-04: 캘린더 dot 표시 (REQ-02-C, REQ-02-D, REQ-02-E)

**Given** 다음 투두가 존재한다:
- 투두 A: `created_at = "2026-06-10T03:00:00.000Z"` (로컬 타임존 변환 후 6월 10일)
- 투두 B: `created_at = "2026-06-15T00:00:00.000Z"` (로컬 타임존 변환 후 6월 15일)

**When** 6월 캘린더가 렌더링될 때

**Then**
- 6월 10일 날짜 셀 아래에 색상 `#5e6ad2`의 dot이 표시된다
- 6월 15일 날짜 셀 아래에 색상 `#5e6ad2`의 dot이 표시된다
- 투두가 없는 날짜 셀에는 dot이 표시되지 않는다

---

### SCEN-05: 빈 날짜 선택 → 빈 상태 메시지 (REQ-04-F)

**Given** 2026년 6월 20일에 생성된 투두가 없다

**When** 사용자가 캘린더에서 2026년 6월 20일을 클릭할 때

**Then**
- TodoList에 `"이 날에 등록된 투두가 없습니다. 새 투두를 추가해보세요!"` 메시지가 표시된다
- AddTodoForm은 여전히 표시된다

---

### SCEN-06: 선택한 날짜에 투두 추가 (REQ-06, REQ-07)

**Given** 캘린더에서 2026년 6월 10일이 선택되어 있다

**When** 사용자가 AddTodoForm에 제목을 입력하고 제출할 때

**Then**
- `createTodo` 서버 액션이 `created_at: "2026-06-10T..."` (selectedDate ISO string)를 포함하여 호출된다
- 새 투두가 Supabase `todos` 테이블에 `created_at = 2026-06-10` 날짜로 저장된다
- 새 투두가 즉시 현재 날짜 목록(6월 10일)에 표시된다
- 6월 10일 캘린더 셀에 dot이 표시된다 (이미 다른 투두가 없었다면)

---

### SCEN-07: TodoItem 체크리스트 스타일 (REQ-05-A, REQ-05-B)

**Given** 투두 목록이 렌더링되어 있다

**When** TodoItem이 화면에 표시될 때

**Then**
- Card 스타일(`rounded-md border border-border bg-card p-3`)이 적용되지 않는다
- 행 스타일 `flex items-center gap-3 py-3 px-2`가 적용된다
- 요소 순서가 `[DragHandle?] [Checkbox] [title] [PriorityBadge] [CategoryBadge] [DueDate] [DropdownMenu]` 이다
- 행들 사이에 `divide-y divide-border` 구분선이 표시된다

---

### SCEN-08: 완료된 투두 스타일 (REQ-05-C, REQ-05-D)

**Given** `is_done: true`인 투두가 목록에 있다

**When** 해당 투두가 렌더링될 때

**Then**
- 투두 제목에 `line-through`가 적용된다
- 라이트 모드: 제목 색상이 `#9ea3ae`이다
- 다크 모드: 제목 색상이 `#8a8f98`이다
- `opacity-50`이 적용되지 않는다 (행 전체가 반투명하지 않다)

---

### SCEN-09: 투두 호버 및 드래그 스타일 (REQ-05-E, REQ-05-F, REQ-05-G)

**Given** 투두 목록이 렌더링되어 있다

**When** 사용자가 TodoItem 행 위에 마우스를 올릴 때

**Then**
- `hover:bg-muted/30` 배경색이 적용된다
- DragHandle이 표시된다

**When** 사용자가 TodoItem을 드래그할 때

**Then**
- `border border-[#5e6ad2]`가 적용된다
- `opacity-80`이 적용된다

---

### SCEN-10: 기존 DnD 기능 보존 (REQ-04-G)

**Given** `sortBy === 'position'`이고 2026년 6월 10일에 투두가 3개 있다

**When** 사용자가 첫 번째 투두를 세 번째 위치로 드래그-앤-드롭할 때

**Then**
- 투두 순서가 변경된다
- 변경된 순서가 Supabase에 저장된다
- 다른 날짜(예: 6월 11일)의 투두 순서는 영향받지 않는다

---

### SCEN-11: useCalendarStore 리셋 (REQ-03-B, REQ-03-C)

**Given** 사용자가 캘린더에서 2026년 6월 10일을 선택한 상태이다

**When** 사용자가 페이지를 새로고침할 때

**Then**
- `useCalendarStore.selectedDate`가 오늘 날짜(`new Date()`)로 초기화된다
- 오늘 날짜의 투두 목록이 표시된다

---

### SCEN-12: FSD Import 규칙 준수 (REQ-02-F, REQ-03-D, NFR-02)

**Given** 프로젝트 빌드를 실행할 때

**When** TypeScript 컴파일러 및 ESLint FSD 플러그인이 실행될 때

**Then**
- `src/shared/model/useCalendarStore.ts`가 `entities`, `features`, `widgets`, `pages`를 import하지 않는다
- `src/widgets/calendar-sidebar/ui/CalendarSidebar.tsx`가 `pages`, `features`를 import하지 않는다
- 빌드 오류가 발생하지 않는다

---

## Edge Cases

### EC-01: 자정 경계 투두

**시나리오**: `created_at = "2026-06-10T15:00:00.000Z"` (UTC 6월 10일 오후 3시 = KST 6월 11일 자정)

**기대값**: `toLocaleDateString('en-CA')` 변환 후 브라우저 로컬 타임존 기준으로 날짜 결정. 한국(KST)에서는 6월 11일로 분류된다.

**중요**: UTC 기준이 아닌 로컬 타임존 기준으로 날짜를 표시하는 것이 올바른 동작이다.

### EC-02: 투두 없는 날 캘린더 dot 없음

**시나리오**: 현재 월에 오늘 하루에만 투두가 존재

**기대값**: 오늘 날짜 셀에만 dot 표시, 다른 날짜에는 dot 없음

### EC-03: created_at 없는 레거시 투두

**시나리오**: DB에서 `created_at`이 `null`인 투두가 있을 때

**기대값**: `new Date(null).toLocaleDateString('en-CA')`는 `"1970-01-01"`을 반환. 이 투두는 1970년 1월 1일에만 보임. 현재 날짜 목록에는 표시되지 않음. (이는 허용 가능한 엣지케이스이다.)

### EC-04: 여러 투두가 같은 날짜에 있을 때 dot 중복

**시나리오**: 2026년 6월 10일에 투두 5개가 있음

**기대값**: 6월 10일 셀에 dot이 하나만 표시됨 (Set 사용으로 중복 제거)

---

## Quality Gate Criteria

### Definition of Done

- [ ] TypeScript strict 컴파일 오류 없음 (`tsc --noEmit`)
- [ ] ESLint 오류 없음 (`next lint`)
- [ ] shadcn `calendar` 컴포넌트 설치 완료
- [ ] SCEN-01 ~ SCEN-12 시나리오 수동 검증 완료
- [ ] FSD import 규칙 위반 없음 (SCEN-12)
- [ ] 모바일 뷰포트(375px, 768px) 레이아웃 확인
- [ ] 다크 모드/라이트 모드에서 완료 투두 색상 확인 (SCEN-08)
- [ ] 기존 DnD 기능 regression 없음 (SCEN-10)
- [ ] `created_at` 전달 시 Supabase 저장 값 확인 (SCEN-06)
- [ ] 빈 상태 메시지 표시 확인 (SCEN-05)
