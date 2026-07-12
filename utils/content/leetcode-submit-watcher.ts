import { hideSubmitRatingPrompt, showSubmitRatingPrompt, type SubmitRatingHandlers } from './submit-rating-prompt';

const RESULT_WAIT_MS = 60_000;
const POLL_INTERVAL_MS = 250;

const SUBMIT_BUTTON_SELECTORS = [
  'button[data-e2e-locator="console-submit-button"]',
  'button[data-e2e-locator="contest-problem-submit-button"]',
  '[data-e2e-locator="console-submit-button"]',
];

export type LeetcodeSubmitWatcherOptions = {
  handlers: SubmitRatingHandlers;
};

/**
 * After Submit (button or Ctrl/Cmd+Enter), wait for Accepted and open the rating prompt.
 * Run-only results are ignored.
 */
export function setupLeetcodeSubmitWatcher(options: LeetcodeSubmitWatcherOptions): void {
  let awaitingSubmitResult = false;
  let armedAt = 0;
  let lastPromptAt = 0;
  let timeoutId: number | null = null;
  let pollId: number | null = null;
  /** Captured at submit time — more reliable than re-querying after Accepted. */
  let submitAnchor: Element | null = null;

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
    if (!hasLeetcodeAcceptedResult()) {
      return;
    }
    if (Date.now() - armedAt < 250) {
      return;
    }
    if (Date.now() - lastPromptAt < 1500) {
      return;
    }

    clearArm();
    lastPromptAt = Date.now();

    const anchor =
      (submitAnchor && document.contains(submitAnchor) ? submitAnchor : null) ??
      findLeetcodeSubmitButton() ??
      findLeetcodeSubmitToolbar();

    showSubmitRatingPrompt(options.handlers, {
      anchor,
      // Submit sits at the bottom of the editor — prefer opening just above it
      // so the popup stays attached to the button instead of the screen corner.
      placement: 'above',
    });
  };

  const armForSubmit = (anchor?: Element | null) => {
    awaitingSubmitResult = true;
    armedAt = Date.now();
    submitAnchor = anchor ?? findLeetcodeSubmitButton();
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    if (pollId !== null) {
      window.clearInterval(pollId);
    }
    timeoutId = window.setTimeout(() => {
      clearArm();
    }, RESULT_WAIT_MS);
    pollId = window.setInterval(maybePrompt, POLL_INTERVAL_MS);
  };

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (isLeetcodeSubmitButton(target) && !isLeetcodeSubmitBlocked()) {
        const button = target.closest('button') ?? target;
        hideSubmitRatingPrompt();
        armForSubmit(button);
      }
    },
    true
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (!isLeetcodeSubmitKeyboardShortcut(event)) {
        return;
      }
      if (isLeetcodeSubmitBlocked()) {
        return;
      }
      hideSubmitRatingPrompt();
      armForSubmit(findLeetcodeSubmitButton());
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

export function findLeetcodeSubmitButton(): HTMLButtonElement | null {
  for (const selector of SUBMIT_BUTTON_SELECTORS) {
    const el = document.querySelector(selector);
    if (!el) continue;
    const btn = el instanceof HTMLButtonElement ? el : el.closest('button');
    if (btn) return btn;
  }

  const buttons = document.querySelectorAll('button');
  for (const button of buttons) {
    if (!isVisible(button)) continue;
    const text = normalizeLabel(button.textContent || '');
    if (text !== 'Submit' && text !== '提交') {
      continue;
    }
    // Prefer the bottom editor action bar submit
    if (
      button.closest('[class*="console"]') ||
      button.closest('#qd-content') ||
      button.getAttribute('data-e2e-locator')?.includes('submit') ||
      isLikelyEditorActionBarButton(button)
    ) {
      return button;
    }
  }

  // Last resort: any visible Submit button in the lower half of the viewport
  for (const button of buttons) {
    if (!isVisible(button)) continue;
    const text = normalizeLabel(button.textContent || '');
    if (text !== 'Submit' && text !== '提交') continue;
    const rect = button.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.45) {
      return button;
    }
  }

  return null;
}

/** Fallback anchor: the toolbar that contains Run + Submit. */
export function findLeetcodeSubmitToolbar(): Element | null {
  const submit = findLeetcodeSubmitButton();
  if (!submit) return null;
  return submit.closest('[class*="flex"][class*="gap"]') ?? submit.parentElement ?? submit;
}

function isLikelyEditorActionBarButton(button: HTMLButtonElement): boolean {
  const rect = button.getBoundingClientRect();
  if (rect.width < 40 || rect.height < 20) return false;
  // Editor action bar is typically near the bottom of the viewport
  return rect.bottom > window.innerHeight * 0.55 && rect.right > window.innerWidth * 0.4;
}

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function isLeetcodeSubmitKeyboardShortcut(event: KeyboardEvent): boolean {
  if (!(event.ctrlKey || event.metaKey)) {
    return false;
  }
  if (event.altKey || event.shiftKey) {
    return false;
  }
  return event.key === 'Enter';
}

export function isLeetcodeSubmitButton(target: Element): boolean {
  for (const selector of SUBMIT_BUTTON_SELECTORS) {
    if (target.closest(selector)) {
      return true;
    }
  }

  const button = target.closest('button');
  if (!button) {
    return false;
  }
  const text = normalizeLabel(button.textContent || '');
  if (text !== 'Submit' && text !== '提交') {
    return false;
  }
  return Boolean(
    button.closest('[class*="console"]') ||
    button.closest('#qd-content') ||
    button.getAttribute('data-e2e-locator')?.includes('submit') ||
    isLikelyEditorActionBarButton(button)
  );
}

export function isLeetcodeSubmitBlocked(): boolean {
  if (!window.location.pathname.includes('/problems/')) {
    return true;
  }

  for (const selector of SUBMIT_BUTTON_SELECTORS) {
    const el = document.querySelector(selector);
    const btn = el instanceof HTMLButtonElement ? el : el?.closest('button');
    if (btn?.disabled) {
      return true;
    }
  }
  return false;
}

export function hasLeetcodeAcceptedResult(): boolean {
  const resultLocator = document.querySelector('[data-e2e-locator="submission-result"]');
  if (resultLocator) {
    const text = (resultLocator.textContent || '').trim();
    if (/^accepted$/i.test(text) || /\baccepted\b/i.test(text)) {
      return true;
    }
  }

  const successCandidates = document.querySelectorAll(
    '[class*="text-success"], [class*="text-green"], [class*="text-olive"], .text-green-s, .text-olive'
  );
  for (const el of successCandidates) {
    const text = (el.textContent || '').trim();
    if (text === 'Accepted') {
      if (/acceptance|rate|submissions/i.test(el.className?.toString?.() || '')) {
        continue;
      }
      return true;
    }
  }

  return false;
}
