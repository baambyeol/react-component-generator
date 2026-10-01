# AGENTS.md

## Operational Commands

- 패키지 매니저는 bun 고정. npm/yarn/pnpm 사용 금지 (`bun.lock`, `package.json` scripts가 `bun run` 전제).
- 개발 서버(API + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (`bun --watch run server/index.ts`)
- 테스트: `bun run test` (vitest run). `bun test`는 Bun 내장 러너를 호출하므로 사용 금지.
- 단일 테스트: `bunx vitest run server/fallback.test.ts`
- 타입 체크 + 빌드: `bun run build` (`tsc -b && vite build`)
- 린트: `bun run lint`
- 변경 후 완료 보고 전에 `bun run test`, `bun run lint`, `bun run build`를 실행한다.

## Golden Rules

### Immutable

- API 키(`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)를 클라이언트 번들, 응답 본문, 로그, 에러 메시지에 노출하지 마라.
  - 근거: `server/index.ts:147-157`의 `/api/config`는 키 값이 아니라 boolean만 반환한다. 이 경계를 유지하라.
  - 근거: `.gitignore`가 `.env`를 제외한다. `.env`를 커밋하거나 내용을 출력하지 마라.
- Gemini 호출 URL에는 키가 쿼리스트링으로 들어간다 (`server/index.ts:99`). 이 URL이나 fetch 에러 객체 전체를 로그/응답에 그대로 넣지 마라.

### Hard Constraints

- 생성 코드는 react-live `noInline` 모드에서 실행된다 (`src/components/LivePreview.tsx:11`). 코드 끝에 `render(<Component />)` 호출이 없으면 미리보기가 비어 있다.
- 시스템 프롬프트의 "import 금지, 인라인 스타일만, TypeScript 문법 금지, 코드펜스 금지" 규칙 (`server/index.ts:9-20`)은 react-live 런타임 제약에서 온 것이다. 프롬프트를 수정할 때 이 제약을 약화하지 마라.
- Vite 프록시 대상 포트와 API 서버 포트는 같아야 한다: `vite.config.ts:9`(3002) == `server/index.ts:139`(3002). 한쪽만 바꾸지 마라.
- 에러 상태 매핑은 에러 메시지 문자열에 `503`/`429`가 포함되는지로 판별한다 (`server/index.ts:194,201`). 프로바이더 에러 메시지 형식(`... API error: ${status}`)을 바꾸면 매핑이 조용히 깨진다.

### Double Defense (한쪽만 제거 금지)

- `render()` 호출: 프롬프트가 요구하고 (`server/index.ts:12`), `ensureRenderCall`이 누락 시 주입한다 (`server/generator.ts:16-24`).
- 코드펜스: 프롬프트가 금지하고 (`server/index.ts:16`), `stripCodeFences`가 제거한다 (`server/generator.ts:5-10`).
- 모델이 프롬프트를 따른다고 가정하고 후처리 함수를 삭제하지 마라.

### Asymmetry

- Google 경로에만 모델 폴백(`withModelFallback`, `server/index.ts:134-136`)과 `MAX_TOKENS` 절단 감지(`server/index.ts:123-125`)가 있다. Anthropic 경로(`server/index.ts:68-96`)에는 없다. 프로바이더 동작을 수정할 때 두 경로를 각각 확인하고, 의도적 차이인지 판단하라.

### Test Boundary

- 테스트가 있는 곳: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`.
- 테스트가 없는 곳: `server/index.ts`(`Bun.serve`를 import 시점에 실행하는 부수효과 파일), `src/hooks/useComponentGenerator.ts`, `LivePreview`, `CodeView`, `ComponentCard`.
- 순수 로직은 `server/index.ts`가 아니라 `generator.ts`/`fallback.ts`처럼 부수효과 없는 모듈로 분리해 테스트하라 (`server/generator.ts:1-2`가 이 패턴의 근거). `server/index.ts`를 테스트에서 import하면 서버가 기동된다.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 react-live로 즉시 미리보기하는 도구.
- Stack: React 19, TypeScript, Vite 8, Bun(API 프록시), react-live, Vitest + Testing Library(jsdom).

## Standards & References

- 프로젝트 소개와 실행 방법은 `README.md` 참조.
- 소스 주석과 UI 문자열은 한국어로 작성한다 (기존 코드 관례).
- 커밋 메시지: 한국어, `feat|fix|refactor|chore: 요약` 형식.
- Maintenance Policy: 이 파일의 규칙과 코드가 어긋나면(포트, 에러 매핑, 파일 경로 등) 작업을 마치기 전에 업데이트를 제안하라.

## Nested Rules

- 서버 코드(`server/`) 수정 시 `server/AGENTS.md`를 따른다.
