import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  hasAcceptedSubmissionResult,
  isSubmitBlocked,
  isSubmitKeyboardShortcut,
  setupNeetcodeSubmitWatcher,
} from '../neetcode-submit-watcher';
import { hideSubmitRatingPrompt } from '../submit-rating-prompt';

// @vitest-environment happy-dom

describe('neetcode submit watcher', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.add('dark-theme');
    Object.defineProperty(window, 'location', {
      value: { pathname: '/problems/two-integer-sum/question' },
      writable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    hideSubmitRatingPrompt();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('detects accepted submission result nodes', () => {
    expect(hasAcceptedSubmissionResult()).toBe(false);
    const el = document.createElement('div');
    el.className = 'submission-result-accepted';
    el.textContent = 'Accepted';
    document.body.appendChild(el);
    expect(hasAcceptedSubmissionResult()).toBe(true);
  });

  it('recognizes Ctrl+Enter and Ctrl+Space as submit shortcuts', () => {
    expect(isSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }))).toBe(true);
    expect(isSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: ' ', code: 'Space', metaKey: true }))).toBe(
      true
    );
    expect(isSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
    expect(isSubmitKeyboardShortcut(new KeyboardEvent('keydown', { key: "'", ctrlKey: true }))).toBe(false);
  });

  it('shows rating prompt only after Submit then Accepted', () => {
    const handlers = {
      onRate: vi.fn(),
      onAddWithoutRating: vi.fn(),
    };

    setupNeetcodeSubmitWatcher({ handlers });

    const accepted = document.createElement('div');
    accepted.className = 'submission-result-accepted';
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeNull();

    accepted.remove();

    const submit = document.createElement('button');
    submit.className = 'button is-success submit-btn';
    submit.textContent = 'Submit';
    document.body.appendChild(submit);
    submit.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    vi.advanceTimersByTime(300);

    const acceptedAfterSubmit = document.createElement('div');
    acceptedAfterSubmit.className = 'submission-result-accepted';
    acceptedAfterSubmit.textContent = 'Accepted';
    document.body.appendChild(acceptedAfterSubmit);

    vi.runAllTimers();

    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeTruthy();
    expect(document.getElementById('neetcodesrs-submit-rating-prompt')?.textContent).toContain('How hard was this?');
  });

  it('shows rating prompt after Ctrl+Space then Accepted', () => {
    setupNeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    document.body.appendChild(
      Object.assign(document.createElement('button'), {
        className: 'submit-btn',
      })
    );

    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', ctrlKey: true, bubbles: true }));
    vi.advanceTimersByTime(300);

    const accepted = document.createElement('div');
    accepted.className = 'submission-result-accepted';
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeTruthy();
  });

  it('shows rating prompt after Ctrl+Enter then Accepted', () => {
    setupNeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    document.body.appendChild(
      Object.assign(document.createElement('button'), {
        className: 'submit-btn',
      })
    );

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    vi.advanceTimersByTime(300);

    const accepted = document.createElement('div');
    accepted.className = 'submission-result-accepted';
    accepted.textContent = 'Accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeTruthy();
  });

  it('does not prompt when Submit is disabled', () => {
    setupNeetcodeSubmitWatcher({
      handlers: { onRate: vi.fn(), onAddWithoutRating: vi.fn() },
    });

    const submit = document.createElement('button');
    submit.className = 'submit-btn';
    submit.disabled = true;
    document.body.appendChild(submit);
    submit.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    vi.advanceTimersByTime(300);
    const accepted = document.createElement('div');
    accepted.className = 'submission-result-accepted';
    document.body.appendChild(accepted);
    vi.runAllTimers();

    expect(isSubmitBlocked()).toBe(true);
    expect(document.getElementById('neetcodesrs-submit-rating-prompt')).toBeNull();
  });
});
