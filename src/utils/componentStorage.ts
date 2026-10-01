import type { GeneratedComponent } from '../types';
import { loadStored } from './storage';

export const COMPONENTS_KEY = 'rcg:components';

// JSON에는 Date가 없어 createdAt이 문자열로 저장된다. 읽을 때 Date로 복원하고 깨진 항목은 버린다.
export function loadComponents(): GeneratedComponent[] {
  const raw = loadStored<unknown[]>(COMPONENTS_KEY, [], Array.isArray);
  return raw.flatMap((item): GeneratedComponent[] => {
    if (typeof item !== 'object' || item === null) return [];
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') return [];
    if (typeof createdAt !== 'string') return [];
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return [];
    return [{ id, prompt, code, createdAt: date }];
  });
}
