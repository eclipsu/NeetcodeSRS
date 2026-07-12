import { hideSubmitRatingPrompt, showSubmitRatingPrompt, type SubmitRatingHandlers } from './submit-rating-prompt';

const ACCEPTED_SELECTOR = '.submission-result-accepted';
const SUBMIT_BUTTON_SELECTOR = 'button.submit-btn';
const RESULT_WAIT_MS = 60_000;
const POLL_INTERVAL_MS = 250;

export type NeetcodeSubmitWatcherOptions = {
  handlers: SubmitRatingHandlers;
};

/**
 * After the user submits (button click or keyboard shortcut), wait for an
 * Accepted result and open the rating prompt.
 *
 * NeetCode's native shortcut is Ctrl/Cmd+Enter. We also arm on Ctrl/Cmd+Space.
 * Run-only results are ignored (not armed by Run / Ctrl+').
 */
export function setupNeetcodeSubmitWatcher(options: NeetcodeSubmitWatcherOptions): void {
  let awaitingSubmitResult = false;
  let armedAt = 0;
  let lastPromptAt = 0;
  let timeoutId: number | null = null;
  let pollId: number | null = null;

  const clearArm = () => {
    awaitingSubmitResult = false;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (pollId !== null) {
      window.clearInterval(pollId);
      pollId = null;
    }
  };

  const maybePrompt = () => {
    if (!awaitingSubmitResult) {
      return;
    }
    if (!hasAcceptedSubmissionResult()) {
      return;
    }
    // Ignore results that were already on the page before this submit settled
    if (Date.now() - armedAt < 250) {
      return;
    }
    if (Date.now() - lastPromptAt < 1500) {
      return;
    }

    clearArm();
    lastPromptAt = Date.now();
    showSubmitRatingPrompt(options.handlers);
  };

  const armForSubmit = () => {
    awaitingSubmitResult = true;
    armedAt = Date.now();
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    if (pollId !== null) {
      window.clearInterval(pollId);
    }
    timeoutId = window.setTimeout(() => {
      clearArm();
    }, RESULT_WAIT_MS);
    // Poll as a fallback when MutationObserver delivery is delayed
    pollId = window.setInterval(maybePrompt, POLL_INTERVAL_MS);
  };

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      if (!target) return;
      const submitBtn = target.closest(SUBMIT_BUTTON_SELECTOR);
      if (submitBtn && !(submitBtn as HTMLButtonElement).disabled) {
        hideSubmitRatingPrompt();
        armForSubmit();
      }
    },
    true
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (!isSubmitKeyboardShortcut(event)) {
        return;
      }
      if (isSubmitBlocked()) {
        return;
      }
      hideSubmitRatingPrompt();
      armForSubmit();
    },
    true
  );

  const observer = new MutationObserver(() => {
    maybePrompt();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function isSubmitKeyboardShortcut(event: KeyboardEvent): boolean {
  if (!(event.ctrlKey || event.metaKey)) {
    return false;
  }
  if (event.altKey) {
    return false;
  }
  // NeetCode native: Ctrl/Cmd+Enter. Also support Ctrl/Cmd+Space.
  return event.key === 'Enter' || event.code === 'Space' || event.key === ' ';
}

export function isSubmitBlocked(): boolean {
  if (!window.location.pathname.includes('/problems/')) {
    return true;
  }
  const submitBtn = document.querySelector<HTMLButtonElement>(SUBMIT_BUTTON_SELECTOR);
  if (submitBtn?.disabled) {
    return true;
  }
  return false;
}

export function hasAcceptedSubmissionResult(): boolean {
  return Boolean(document.querySelector(ACCEPTED_SELECTOR));
}
