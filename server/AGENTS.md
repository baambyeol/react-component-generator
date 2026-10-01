# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시. `index.ts`가 HTTP 라우팅과 프로바이더 호출을 담당하고, `generator.ts`/`fallback.ts`는 부수효과 없는 순수 함수다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). Node 전용 서버 프레임워크(express 등)를 추가하지 마라.
- HTTP 클라이언트는 전역 `fetch`만 사용한다 (`index.ts:69,101`). SDK/axios를 추가하지 마라.
- 테스트는 vitest이며 jsdom 환경에서 실행된다 (`vite.config.ts` test 설정). Bun 전용 API(`Bun.*`)를 테스트 대상 모듈에서 쓰지 마라.

## Implementation Patterns

- 새 순수 로직은 `generator.ts` 또는 신규 모듈로 분리하고 같은 이름의 `*.test.ts`를 둔다 (`generator.test.ts`, `fallback.test.ts`).
- 새 Gemini 모델은 `GOOGLE_MODELS` 배열 순서(우선순위)에 추가한다 (`index.ts:5`).
- 새 응답에는 반드시 `CORS_HEADERS`를 포함한다 (`index.ts:51-55`). 모든 `Response.json` 호출이 `{ headers: CORS_HEADERS }`를 전달하는 패턴이다.
- 프로바이더 에러는 `throw new Error('<Provider> API error: ${status}')` 형식을 유지한다. 상태 매핑이 이 문자열에 의존한다 (`index.ts:194,201`).

## Testing Strategy

- 전체: `bun run test`. 서버 한정: `bunx vitest run server`.
- `index.ts`는 import하면 포트 3002로 서버가 기동되므로 테스트에서 import하지 마라.
- 폴백 동작 변경 시 `fallback.test.ts`의 4개 케이스(첫 성공, 폴백, 전부 실패 시 마지막 에러, 빈 목록)를 유지/갱신하라.

## Local Golden Rules

- 클라이언트가 보낸 `apiKey`가 `.env` 키보다 우선한다 (`index.ts:64-66`). 이 우선순위를 뒤집지 마라.
- `withModelFallback`은 모든 에러(인증 실패 400/401 포함)에서 다음 모델로 넘어간다 (`fallback.ts:13-17`). 이는 현재 의도된 동작이므로 변경하려면 호출부 영향을 먼저 확인하라.
- Gemini `MAX_TOKENS` 에러는 사용자용 한국어 메시지다 (`index.ts:123-125`). 폴백 중 마지막 에러로 그대로 전달되므로 문구를 바꾸면 UI에 직접 반영된다.
