---
version: 1.0
name: todo-app-design
description: "Linear 디자인 언어를 기반으로 한 투두 앱 전용 디자인 시스템. #010102 딥 다크 캔버스와 라벤더-블루 액센트(#5e6ad2)를 중심으로, 라이트/다크 모드를 완벽하게 지원한다. 카드 그리드 레이아웃으로 투두 아이템을 배치하며, 우선순위·카테고리·마감일 정보를 Badge로 표현한다. shadcn/ui + Tailwind CSS + next-themes 기반으로 구현한다."

colors:
  # 브랜드 액센트
  primary: "#5e6ad2"
  primary-hover: "#828fff"
  primary-focus: "#5e6ad2"
  on-primary: "#ffffff"

  # 다크모드 서피스
  dark-canvas: "#010102"
  dark-surface-1: "#0f1011"
  dark-surface-2: "#141516"
  dark-surface-3: "#18191a"
  dark-hairline: "#23252a"
  dark-hairline-strong: "#34343a"

  # 다크모드 텍스트
  dark-ink: "#f7f8f8"
  dark-ink-muted: "#d0d6e0"
  dark-ink-subtle: "#8a8f98"
  dark-ink-disabled: "#62666d"

  # 라이트모드 서피스
  light-canvas: "#ffffff"
  light-surface-1: "#f5f6f7"
  light-surface-2: "#edeef0"
  light-surface-3: "#e4e5e8"
  light-hairline: "#e2e4e8"
  light-hairline-strong: "#cacdd4"

  # 라이트모드 텍스트
  light-ink: "#0d0e10"
  light-ink-muted: "#3a3d45"
  light-ink-subtle: "#6b7080"
  light-ink-disabled: "#9ea3ae"

  # 시맨틱 — 우선순위
  priority-high: "#e5534b"
  priority-high-bg-dark: "#2d1412"
  priority-high-bg-light: "#fdf0ef"
  priority-medium: "#d9922a"
  priority-medium-bg-dark: "#2b1e0a"
  priority-medium-bg-light: "#fdf5eb"
  priority-low: "#27a644"
  priority-low-bg-dark: "#0d2414"
  priority-low-bg-light: "#edf8f0"

  # 시맨틱 — 상태
  done-text-dark: "#8a8f98"
  done-text-light: "#9ea3ae"
  overdue: "#e5534b"

typography:
  page-title:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.5px
  section-title:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.3px
  card-title:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.1px
  body:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  badge:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0.2px

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

components:
  todo-card:
    backgroundColor-dark: "{colors.dark-surface-1}"
    backgroundColor-light: "{colors.light-canvas}"
    border-dark: "1px solid {colors.dark-hairline}"
    border-light: "1px solid {colors.light-hairline}"
    rounded: "{rounded.lg}"
    padding: "16px"
  todo-card-done:
    opacity: 0.5
  todo-card-hover-dark:
    backgroundColor: "{colors.dark-surface-2}"
    border: "1px solid {colors.dark-hairline-strong}"
  todo-card-hover-light:
    backgroundColor: "{colors.light-surface-1}"
    border: "1px solid {colors.light-hairline-strong}"
  badge-high:
    backgroundColor-dark: "{colors.priority-high-bg-dark}"
    backgroundColor-light: "{colors.priority-high-bg-light}"
    textColor: "{colors.priority-high}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.badge}"
  badge-medium:
    backgroundColor-dark: "{colors.priority-medium-bg-dark}"
    backgroundColor-light: "{colors.priority-medium-bg-light}"
    textColor: "{colors.priority-medium}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.badge}"
  badge-low:
    backgroundColor-dark: "{colors.priority-low-bg-dark}"
    backgroundColor-light: "{colors.priority-low-bg-light}"
    textColor: "{colors.priority-low}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.badge}"
  category-badge:
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.badge}"
    note: "backgroundColor는 카테고리 color 필드값 + 20% opacity, textColor는 카테고리 color 필드값"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary-dark:
    backgroundColor: "{colors.dark-surface-1}"
    textColor: "{colors.dark-ink}"
    border: "1px solid {colors.dark-hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-secondary-light:
    backgroundColor: "{colors.light-surface-1}"
    textColor: "{colors.light-ink}"
    border: "1px solid {colors.light-hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-ghost:
    backgroundColor: "transparent"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  input-dark:
    backgroundColor: "{colors.dark-surface-1}"
    textColor: "{colors.dark-ink}"
    border: "1px solid {colors.dark-hairline}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    typography: "{typography.body}"
  input-light:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-ink}"
    border: "1px solid {colors.light-hairline}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    typography: "{typography.body}"
  input-focused:
    border: "1px solid {colors.primary}"
    outline: "2px solid {colors.primary-focus}"
    outlineOffset: "1px"
    outlineOpacity: "30%"
  checkbox-unchecked-dark:
    border: "1.5px solid {colors.dark-hairline-strong}"
    rounded: "{rounded.sm}"
    size: "16px"
  checkbox-unchecked-light:
    border: "1.5px solid {colors.light-hairline-strong}"
    rounded: "{rounded.sm}"
    size: "16px"
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    border: "1.5px solid {colors.primary}"
    rounded: "{rounded.sm}"
    size: "16px"
    checkColor: "{colors.on-primary}"
  header-dark:
    backgroundColor: "{colors.dark-canvas}"
    border-bottom: "1px solid {colors.dark-hairline}"
    height: "56px"
    padding: "0 24px"
  header-light:
    backgroundColor: "{colors.light-canvas}"
    border-bottom: "1px solid {colors.light-hairline}"
    height: "56px"
    padding: "0 24px"
  filter-tab-default-dark:
    backgroundColor: "transparent"
    textColor: "{colors.dark-ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  filter-tab-selected-dark:
    backgroundColor: "{colors.dark-surface-2}"
    textColor: "{colors.dark-ink}"
    border: "1px solid {colors.dark-hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  filter-tab-default-light:
    backgroundColor: "transparent"
    textColor: "{colors.light-ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  filter-tab-selected-light:
    backgroundColor: "{colors.light-surface-1}"
    textColor: "{colors.light-ink}"
    border: "1px solid {colors.light-hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  empty-state:
    textColor-dark: "{colors.dark-ink-subtle}"
    textColor-light: "{colors.light-ink-subtle}"
    typography: "{typography.body}"
    padding: "48px 0"
  due-date-normal:
    textColor-dark: "{colors.dark-ink-subtle}"
    textColor-light: "{colors.light-ink-subtle}"
    typography: "{typography.caption}"
  due-date-overdue:
    textColor: "{colors.overdue}"
    typography: "{typography.caption}"
  drag-handle:
    color-dark: "{colors.dark-ink-subtle}"
    color-light: "{colors.light-ink-subtle}"
    size: "14px"
    note: "투두 카드 왼쪽에 배치. 기본 hidden, 카드 hover 시 visible"
  toast-dark:
    backgroundColor: "{colors.dark-surface-2}"
    textColor: "{colors.dark-ink}"
    border: "1px solid {colors.dark-hairline-strong}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  toast-light:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-ink}"
    border: "1px solid {colors.light-hairline}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

## 개요

Linear 디자인 언어를 기반으로 한 Todo 앱 전용 디자인 시스템이다. Linear 마케팅 사이트의 토큰을 그대로 가져오는 대신, **앱 UI에 맞게 재해석**했다. 다크/라이트 모드를 완벽하게 지원하며, 카드 그리드 레이아웃으로 투두 아이템을 표시한다.

**핵심 원칙:**
- 라벤더-블루(`{colors.primary}` #5e6ad2)는 인터랙션 포인트에만 사용한다 — 체크박스 완료, 포커스 링, 주요 버튼
- 계층은 서피스 단계(canvas → surface-1 → surface-2)와 헤어라인 보더로만 표현한다. 그림자 없음
- 완료된 투두는 취소선 + opacity 50%로 처리한다
- 마감 초과 날짜는 `{colors.overdue}` 빨간색으로만 강조한다

---

## 색상

### 다크모드

- **캔버스** (`{colors.dark-canvas}` #010102): 페이지 기본 배경. 순수 검정에 미세한 블루 틴트
- **서피스-1** (`{colors.dark-surface-1}` #0f1011): 투두 카드 배경
- **서피스-2** (`{colors.dark-surface-2}` #141516): 호버 상태, 선택된 필터 탭
- **서피스-3** (`{colors.dark-surface-3}` #18191a): 드롭다운, 팝오버 배경
- **헤어라인** (`{colors.dark-hairline}` #23252a): 카드 테두리, 구분선
- **헤어라인-강조** (`{colors.dark-hairline-strong}` #34343a): 포커스 상태 테두리, 체크박스

### 라이트모드

- **캔버스** (`{colors.light-canvas}` #ffffff): 페이지 기본 배경
- **서피스-1** (`{colors.light-surface-1}` #f5f6f7): 호버 상태, 선택된 필터 탭
- **서피스-2** (`{colors.light-surface-2}` #edeef0): 깊은 계층
- **헤어라인** (`{colors.light-hairline}` #e2e4e8): 카드 테두리, 구분선
- **헤어라인-강조** (`{colors.light-hairline-strong}` #cacdd4): 포커스 상태 테두리

### 우선순위 색상

| 우선순위 | 텍스트 | 다크 배경 | 라이트 배경 |
|---------|--------|-----------|------------|
| 높음 | #e5534b | #2d1412 | #fdf0ef |
| 중간 | #d9922a | #2b1e0a | #fdf5eb |
| 낮음 | #27a644 | #0d2414 | #edf8f0 |

---

## 레이아웃

### 페이지 구조

```
┌─────────────────────────────────┐
│ Header (56px)                   │  로고 + 검색 + 다크모드 토글 + 유저
├─────────────────────────────────┤
│ Filter Bar                      │  필터 탭 + 정렬 Select + 카테고리
├─────────────────────────────────┤
│                                 │
│  Todo Card  Todo Card  Todo Card│  카드 그리드 (3-up → 2-up → 1-up)
│  Todo Card  Todo Card  Todo Card│
│                                 │
└─────────────────────────────────┘
```

### 카드 그리드

- **Desktop (1280px+)**: 3열 그리드, gap 16px
- **Tablet (768px~1279px)**: 2열 그리드, gap 12px
- **Mobile (~767px)**: 1열, gap 8px
- 최대 콘텐츠 너비: 1200px, 수평 패딩: 24px

### 투두 카드 내부 구조

```
┌──────────────────────────────┐
│ ☐  제목 텍스트          ⋮   │  ← 체크박스 + 제목 + 액션 메뉴
│                              │
│ 🔴 높음  📁 업무  📅 6/20   │  ← 우선순위 Badge + 카테고리 Badge + 마감일
└──────────────────────────────┘
```

- 드래그 핸들(`⠿`)은 카드 왼쪽에 배치, 기본 hidden → hover 시 visible
- 액션 메뉴(`⋮`)는 카드 오른쪽 상단, hover 시 visible

---

## 타이포그래피

폰트: **Inter** (Google Fonts). Linear의 커스텀 폰트 대체재로 가장 근접한 오픈소스.

| 토큰 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| `page-title` | 24px | 600 | 페이지 제목 ("My Tasks") |
| `section-title` | 18px | 600 | 섹션 제목 |
| `card-title` | 15px | 500 | 투두 제목 |
| `body` | 14px | 400 | 일반 본문, 입력값 |
| `body-sm` | 13px | 400 | 보조 정보 |
| `caption` | 12px | 400 | 마감일, 메타 정보 |
| `button` | 14px | 500 | 버튼 레이블 |
| `badge` | 11px | 500 | Badge 레이블 |

---

## 컴포넌트

### 투두 카드 (`todo-card`)

- 배경: 다크 `{colors.dark-surface-1}` / 라이트 `{colors.light-canvas}`
- 테두리: 1px `{colors.dark-hairline}` / `{colors.light-hairline}`
- 모서리: `{rounded.lg}` 12px
- 패딩: 16px
- 호버: 배경 서피스 한 단계 상승 + 테두리 강조
- 완료 상태: 제목에 취소선 + 카드 전체 opacity 50%
- 드래그 중: `{colors.primary}` 테두리 + 살짝 scale-up

### 우선순위 Badge

- pill shape, 패딩 2px 8px, 11px/500
- 높음: 빨강 텍스트 + 어두운 빨강 배경 (다크/라이트 별도)
- 중간: 주황 텍스트 + 어두운 주황 배경
- 낮음: 초록 텍스트 + 어두운 초록 배경

### 카테고리 Badge

- pill shape, 패딩 2px 8px, 11px/500
- 카테고리 `color` 필드값 사용, 배경은 동일 색상 20% opacity

### 체크박스

- 미완료: 1.5px 테두리, 6px 모서리, 16×16px
- 완료: `{colors.primary}` 배경 + 흰색 체크
- 호버: 테두리 `{colors.primary}` 로 변경

### 필터 탭

- 기본: 투명 배경 + subtle 텍스트
- 선택: 서피스 배경 + 헤어라인 테두리 + 일반 텍스트
- pill shape, 패딩 6px 12px

---

## 인터랙션

### 낙관적 업데이트

- 투두 추가: 카드가 목록 상단에 즉시 나타남 (fade-in)
- 완료 토글: 즉시 취소선 적용, 실패 시 되돌림
- 삭제: 카드 fade-out 후 제거, 실패 시 되돌림

### 드래그 앤 드롭

- 드래그 중인 카드: `{colors.primary}` 1px 테두리 + opacity 80%
- 드롭 가능 위치: `{colors.primary}` 2px 가로선 표시
- 정렬 기준이 "수동 정렬"일 때만 활성화

### 애니메이션

- 카드 진입/퇴장: `opacity` + `translateY(4px)` → `translateY(0)`, 150ms ease-out
- 체크박스 완료: `scale(1.2)` → `scale(1)`, 120ms ease-out
- 호버 전환: 80ms ease

---

## 다크/라이트 모드

`next-themes`의 `class` 전략 사용. `html` 태그에 `dark` 클래스 토글.

### shadcn/ui CSS 변수 매핑

```css
:root {
  --background: 0 0% 100%;           /* light-canvas */
  --card: 0 0% 100%;                 /* light-canvas */
  --border: 220 9% 89%;              /* light-hairline */
  --primary: 237 52% 59%;            /* primary #5e6ad2 */
  --muted: 220 9% 95%;               /* light-surface-1 */
  --muted-foreground: 220 9% 44%;    /* light-ink-subtle */
}

.dark {
  --background: 240 50% 1%;          /* dark-canvas */
  --card: 240 5% 6%;                 /* dark-surface-1 */
  --border: 225 7% 15%;              /* dark-hairline */
  --primary: 237 52% 59%;            /* primary (동일) */
  --muted: 240 5% 9%;                /* dark-surface-2 */
  --muted-foreground: 220 5% 57%;    /* dark-ink-subtle */
}
```

---

## Do's and Don'ts

### Do

- `{colors.primary}` 라벤더는 인터랙션 포인트에만 사용한다
- 계층은 서피스 단계와 헤어라인 테두리로만 표현한다
- 카드 hover 시 배경을 한 단계 올리고 테두리를 강조한다
- 완료 투두는 취소선 + opacity 50% 처리한다
- 마감 초과는 `{colors.overdue}` 빨간색으로만 표시한다
- Inter 폰트를 사용한다

### Don't

- 라벤더를 카드 배경이나 섹션 배경으로 쓰지 않는다
- 그림자(`box-shadow`)를 사용하지 않는다
- 그라디언트 배경을 사용하지 않는다
- `{rounded.xl}` 16px 이상의 모서리를 카드에 적용하지 않는다
- 폰트 굵기 700 이상을 사용하지 않는다

---

## 반응형

| 브레이크포인트 | 그리드 | 변경사항 |
|--------------|--------|---------|
| 1280px+ | 3열 | 기본 |
| 768px~1279px | 2열 | 헤더 검색창 축소 |
| ~767px | 1열 | 필터 탭 스크롤, 헤더 간소화 |

- 투두 카드 모바일 패딩: 12px
- 체크박스 탭 영역 최소 44px × 44px 유지
