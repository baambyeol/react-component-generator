import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadStored, saveStored } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('저장한 값을 다시 읽어온다', () => {
    saveStored('k', { a: 1 });
    expect(loadStored('k', null)).toEqual({ a: 1 });
  });

  it('저장된 값이 없으면 fallback을 반환한다', () => {
    expect(loadStored('missing', 'fallback')).toBe('fallback');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(loadStored('k', [])).toEqual([]);
  });

  it('검증 함수를 통과하지 못하면 fallback을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify({ not: 'array' }));
    const isArray = (v: unknown): v is string[] => Array.isArray(v);
    expect(loadStored<string[]>('k', [], isArray)).toEqual([]);
  });

  it('localStorage 접근이 막혀 있어도 읽기가 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadStored('k', 'fallback')).toBe('fallback');
  });

  it('용량 초과 등으로 쓰기가 실패해도 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveStored('k', 1)).not.toThrow();
  });
});
