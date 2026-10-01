import { describe, it, expect, beforeEach } from 'vitest';
import { COMPONENTS_KEY, loadComponents } from './componentStorage';
import { saveStored } from './storage';

const sample = { id: '1', prompt: '카드', code: 'render(<div/>)', createdAt: new Date('2026-01-02T03:04:05Z') };

describe('loadComponents', () => {
  beforeEach(() => localStorage.clear());

  it('저장된 컴포넌트를 읽고 createdAt을 Date로 복원한다', () => {
    saveStored(COMPONENTS_KEY, [sample]);
    const [c] = loadComponents();
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.getTime()).toBe(sample.createdAt.getTime());
    expect(c.prompt).toBe('카드');
  });

  it('저장된 값이 없으면 빈 배열이다', () => {
    expect(loadComponents()).toEqual([]);
  });

  it('형식이 올바르지 않은 항목은 버린다', () => {
    saveStored(COMPONENTS_KEY, [sample, { id: 2 }, 'x', { ...sample, id: '3', createdAt: 'not-a-date' }]);
    expect(loadComponents().map((c) => c.id)).toEqual(['1']);
  });
});
