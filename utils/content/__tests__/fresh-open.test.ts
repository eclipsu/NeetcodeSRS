import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearStoredEditorDrafts,
  getProblemSlugFromPath,
  hasFreshOpenFlag,
  shouldClearStorageKey,
  stripFreshOpenFlag,
} from '../fresh-open';

// @vitest-environment happy-dom

describe('fresh open helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/problems/two-sum');
  });

  it('detects the fresh-open query flag', () => {
    expect(hasFreshOpenFlag('')).toBe(false);
    expect(hasFreshOpenFlag('?neetcodesrs_fresh=1')).toBe(true);
    expect(hasFreshOpenFlag('?foo=1&neetcodesrs_fresh=1')).toBe(true);
    expect(hasFreshOpenFlag('?neetcodesrs_fresh=0')).toBe(false);
  });

  it('parses the problem slug from the path', () => {
    expect(getProblemSlugFromPath('/problems/two-sum/')).toBe('two-sum');
    expect(getProblemSlugFromPath('/problems/two-sum')).toBe('two-sum');
    expect(getProblemSlugFromPath('/problemset/')).toBeNull();
  });

  it('only clears storage keys scoped to the problem slug', () => {
    expect(shouldClearStorageKey('neetcode:two-sum:python', 'two-sum')).toBe(true);
    expect(shouldClearStorageKey('draft:TWO-SUM:code', 'two-sum')).toBe(true);
    expect(shouldClearStorageKey('1_python3_code', 'two-sum')).toBe(false);
    expect(shouldClearStorageKey('auth_token', 'two-sum')).toBe(false);
  });

  it('clears matching drafts from local and session storage', () => {
    localStorage.setItem('neetcode:two-sum:code', 'old');
    localStorage.setItem('auth_token', 'keep');
    sessionStorage.setItem('cache:two-sum', 'old');
    sessionStorage.setItem('unrelated', 'keep');

    const removed = clearStoredEditorDrafts('two-sum');

    expect(removed.sort()).toEqual(['cache:two-sum', 'neetcode:two-sum:code'].sort());
    expect(localStorage.getItem('neetcode:two-sum:code')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBe('keep');
    expect(sessionStorage.getItem('unrelated')).toBe('keep');
  });

  it('strips the fresh-open flag without reloading', () => {
    window.history.replaceState({}, '', '/problems/two-sum?neetcodesrs_fresh=1&x=1');
    stripFreshOpenFlag();
    expect(window.location.search).toBe('?x=1');
  });
});
