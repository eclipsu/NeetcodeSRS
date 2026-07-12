import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  hasLeetcodeAcceptedResult,
  isLeetcodeSubmitBlocked,
  isLeetcodeSubmitButton,
  isLeetcodeSubmitKeyboardShortcut,
  setupLeetcodeSubmitWatcher,
} from '../leetcode-submit-watcher';
import { hideSubmitRatingPrompt } from '../submit-rating-prompt';

// @vitest-environment happy-dom

describe('leetcode submit watcher', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.add('dark');
    Object.defineProperty(window, 'location', {
      value: { pathname: '/problems/two-sum/' },
      writable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    hideSubmitRatingPrompt();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('recognizes Ctrl+Enter as the LeetCode submit shortcut', () => {
    expect(isLeetcodeSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }))).toBe(true);
    expect(isLeetcodeSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }))).toBe(true);
    expect(isLeetcodeSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
    expect(
      isLeetcodeSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: ' ', code: 'Space', ctrlKey: true }))
    ).toBe(false);
  });

  it('detects the console submit button', () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-e2e-locator', 'console-submit-button');
    btn.textContent = 'Submit';
    document.body.appendChild(btn);
    expect(isLeetcodeSubmitButton(btn)).toBe(true);
  });

  it('detects Accepted via submission-result locator', () => {
    expect(hasLeetcodeAcceptedResult()).toBe(false);
    const el = document.createElement('div');
    el.setAttribute('data-e2e-locator', 'submission-result');
    el.textContent = 'Accepted';
    document.body.appendChild(el);
    expect(hasLeetcodeAcceptedResult()).toBe(true);
  });

  it('shows rating prompt after Submit click then Accepted', () => {
    setupLeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    const submit = document.createElement('button');
    submit.setAttribute('data-e2e-locator', 'console-submit-button');
    submit.textContent = 'Submit';
    document.body.appendChild(submit);
    submit.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    vi.advanceTimersByTime(300);

    const accepted = document.createElement('div');
    accepted.setAttribute('data-e2e-locator', 'submission-result');
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeTruthy();
  });

  it('shows rating prompt after Ctrl+Enter then Accepted', () => {
    setupLeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    vi.advanceTimersByTime(300);

    const accepted = document.createElement('span');
    accepted.className = 'text-green-s';
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeTruthy();
  });

  it('does not prompt when submit is disabled', () => {
    const submit = document.createElement('button');
    submit.setAttribute('data-e2e-locator', 'console-submit-button');
    submit.disabled = true;
    document.body.appendChild(submit);

    setupLeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    submit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    vi.advanceTimersByTime(300);

    const accepted = document.createElement('div');
    accepted.setAttribute('data-e2e-locator', 'submission-result');
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(isLeetcodeSubmitBlocked()).toBe(true);
    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeNull();
  });
});
