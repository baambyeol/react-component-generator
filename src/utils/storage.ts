// localStorage 접근은 사생활 보호 모드/용량 초과/차단 시 예외를 던질 수 있어 항상 감싼다.
export function loadStored<T>(key: string, fallback: T, isValid?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function saveStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 앱 동작에 영향을 주지 않는다.
  }
}
