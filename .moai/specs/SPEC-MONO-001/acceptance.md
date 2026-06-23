# Acceptance Test Scenarios: SPEC-MONO-001

## 모노레포 구조

### TC-MONO-01: 웹 앱 정상 동작 확인

**Given**: 모노레포 전환 완료 후
**When**: `pnpm --filter @todo/web dev` 실행
**Then**: Next.js 개발 서버 정상 시작, 기존 모든 기능 정상 동작

### TC-MONO-02: 모노레포 루트 빌드 명령

**Given**: 루트에서
**When**: `pnpm build` 실행
**Then**: Turborepo가 apps/web 빌드 성공

### TC-MONO-03: 공유 패키지 타입 사용

**Given**: packages/types 설치 후
**When**: apps/mobile에서 `import type { Todo } from '@todo/types'`
**Then**: TypeScript 에러 없음

### TC-MONO-04: Turborepo 태스크 캐싱

**Given**: 첫 번째 빌드 완료 후
**When**: 코드 변경 없이 `pnpm build` 재실행
**Then**: Turborepo 캐시 히트, 재빌드 없이 완료

---

## 모바일 앱 — 인증

### TC-MOB-01: 이메일 로그인

**Given**: Expo 앱 실행
**When**: 이메일/비밀번호 입력 후 로그인
**Then**: 메인 투두 화면으로 이동, 투두 목록 표시

### TC-MOB-02: GitHub OAuth 로그인

**Given**: iOS/Android 에뮬레이터에서 Expo 앱
**When**: "GitHub으로 계속하기" 탭
**Then**: 브라우저 OAuth 페이지 → 앱 복귀 → 로그인 완료

### TC-MOB-03: 오프라인 세션 유지

**Given**: 앱 종료 후 재시작
**When**: 앱 열기
**Then**: 재로그인 없이 메인 화면 표시 (SecureStore 세션 유지)

### TC-MOB-04: 로그아웃

**Given**: 로그인 완료 상태
**When**: 로그아웃 버튼 탭
**Then**: 세션 삭제, /(auth)/login 화면으로 리다이렉트

---

## 모바일 앱 — 투두 CRUD

### TC-MOB-05: 투두 생성

**Given**: 로그인 완료 상태
**When**: 투두 추가 폼에 제목 입력 후 제출
**Then**: 즉시 목록에 표시 (낙관적 업데이트), 서버 동기화 완료

### TC-MOB-06: 투두 완료 토글

**Given**: 투두 목록에 미완료 투두 존재
**When**: 투두 체크박스 탭
**Then**: is_done 상태 토글, UI 즉시 반영

### TC-MOB-07: 투두 수정

**Given**: 기존 투두 존재
**When**: 투두 탭 → 편집 모달 → 제목 변경 후 저장
**Then**: 목록에서 변경된 제목 표시

### TC-MOB-08: 투두 삭제

**Given**: 기존 투두 존재
**When**: 투두 삭제 버튼 탭 → 확인
**Then**: 목록에서 제거, Supabase DB에서 삭제

### TC-MOB-09: 낙관적 업데이트 실패 롤백

**Given**: 네트워크 오류 상태
**When**: 투두 생성 시도
**Then**: 낙관적으로 표시된 항목 제거, Toast 에러 메시지 표시

---

## 모바일 앱 — 캘린더

### TC-MOB-10: 달력 날짜 선택

**Given**: 메인 화면의 달력
**When**: 특정 날짜 탭
**Then**: 해당 날짜에 생성된 투두만 하단에 표시

### TC-MOB-11: 우선순위 컬러 바

**Given**: 투두가 있는 날짜
**When**: 달력 렌더링
**Then**: 날짜 아래 high(빨강)/medium(주황)/low(초록) 색상 바 표시

### TC-MOB-12: 빈 날짜 안내

**Given**: 투두가 없는 날짜 선택
**When**: 달력에서 빈 날짜 탭
**Then**: "이 날짜에 투두가 없습니다" 안내 메시지 표시

---

## 모바일 앱 — 카테고리

### TC-MOB-13: 카테고리 생성

**Given**: 카테고리 화면
**When**: 이름과 색상 입력 후 생성
**Then**: 카테고리 목록에 즉시 표시

### TC-MOB-14: 카테고리 삭제

**Given**: 기존 카테고리 존재
**When**: 카테고리 삭제 버튼 탭
**Then**: 카테고리 삭제, 해당 카테고리의 투두 category_id NULL 처리

---

## 웹-모바일 데이터 동기화

### TC-SYNC-01: 웹→모바일 동기화

**Given**: 웹 앱에서 투두 생성
**When**: 모바일 앱에서 새로고침
**Then**: 동일한 투두 표시 (같은 Supabase DB)

### TC-SYNC-02: 모바일→웹 동기화

**Given**: 모바일 앱에서 투두 완료 처리
**When**: 웹 앱에서 새로고침
**Then**: 해당 투두 완료 상태 반영

---

## 합격 기준 체크리스트

### 모노레포 구조
- [ ] `pnpm-workspace.yaml` 존재
- [ ] `turbo.json` 존재
- [ ] `apps/web/`, `apps/mobile/`, `packages/types/`, `packages/utils/` 존재
- [ ] `pnpm --filter @todo/web dev` → Next.js 정상 실행
- [ ] `pnpm --filter @todo/mobile start` → Expo 정상 실행
- [ ] `@todo/types` import → TypeScript 에러 없음
- [ ] `@todo/utils` import → TypeScript 에러 없음

### 웹 앱 (기존 기능 유지)
- [ ] 기존 모든 기능 정상 동작
- [ ] TypeScript strict 에러 0 (src/ 기준)
- [ ] `@/*` 경로 alias 정상 작동

### 모바일 앱
- [ ] 이메일/비밀번호 로그인 동작
- [ ] GitHub OAuth 동작
- [ ] 투두 CRUD 정상 (create/read/update/delete)
- [ ] 캘린더 날짜 선택 → 투두 필터링
- [ ] 우선순위 컬러 바 표시
- [ ] 카테고리 생성/삭제
- [ ] 세션 유지 (앱 재시작 후 로그인 유지)
- [ ] TypeScript strict 에러 0
- [ ] Supabase Dashboard: `todo-app://auth/callback` 추가됨

### Definition of Done
- 위 체크리스트 전 항목 통과
- `pnpm build` 루트에서 에러 없이 완료
- 모바일 iOS 시뮬레이터 또는 Android 에뮬레이터에서 전체 플로우 수동 검증 완료
