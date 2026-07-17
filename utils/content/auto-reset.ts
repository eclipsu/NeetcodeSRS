import { MessageType, sendMessage } from '@/shared/messages';
import { clearStoredEditorDrafts, getProblemSlugFromPath, hasFreshOpenFlag, stripFreshOpenFlag } from './fresh-open';

const RESET_CONFIRM_TIMEOUT_MS = 2000;
const RESET_CONFIRM_POLL_MS = 50;
const RESET_TOAST_DURATION_MS = 2500;
const SLUG_CHECK_INTERVAL_MS = 1000;
const RESET_BUTTON_WAIT_MS = 15_000;

export function setupLeetcodeAutoReset(): void {
  let lastSlug: string | null = null;
  let lastResetSlug: string | null = null;
  let isResetting = false;
  let lastAttemptedSlug: string | null = null;
  let lastAttemptAt = 0;

  const checkForNavigation = () => {
    const slug = getProblemSlugFromPath();
    if (!slug) {
      lastSlug = null;
      return;
    }

    const now = Date.now();
    if (slug !== lastSlug) {
      lastSlug = slug;
      lastAttemptedSlug = null;
      lastAttemptAt = 0;
    }

    if (slug !== lastResetSlug) {
      if (lastAttemptedSlug === slug && now - lastAttemptAt < SLUG_CHECK_INTERVAL_MS) {
        return;
      }

      lastAttemptedSlug = slug;
      lastAttemptAt = now;
      void tryAutoReset(slug);
    }
  };

  const tryAutoReset = async (slug: string) => {
    if (isResetting || slug === lastResetSlug) {
      return;
    }

    const freshOpen = hasFreshOpenFlag();
    isResetting = true;
    try {
      if (!freshOpen) {
        const autoClearEnabled = await sendMessage({ type: MessageType.GET_AUTO_CLEAR_LEETCODE });
        if (!autoClearEnabled) {
          return;
        }
      }

      if (freshOpen) {
        clearStoredEditorDrafts(slug);
      }

      const resetButton = await waitForResetButton();
      if (!resetButton) {
        if (freshOpen) {
          stripFreshOpenFlag();
        }
        return;
      }

      resetButton.click();
      const confirmed = await waitForConfirmClick();
      if (confirmed) {
        showToast(freshOpen ? 'Starting with a clean editor' : 'Code reset to default');
      }
      lastResetSlug = slug;
      if (freshOpen) {
        stripFreshOpenFlag();
      }
    } catch (error) {
      console.error('Failed to auto reset LeetCode editor:', error);
    } finally {
      isResetting = false;
    }
  };

  // Fresh links should clear drafts ASAP even before the Reset button exists
  if (hasFreshOpenFlag()) {
    const slug = getProblemSlugFromPath();
    if (slug) {
      clearStoredEditorDrafts(slug);
    }
  }

  checkForNavigation();

  const observer = new MutationObserver(() => {
    checkForNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', checkForNavigation);
  window.setInterval(checkForNavigation, SLUG_CHECK_INTERVAL_MS);
}

export function setupNeetcodeAutoReset(): void {
  let lastSlug: string | null = null;
  let lastResetSlug: string | null = null;
  let isResetting = false;
  let lastAttemptedSlug: string | null = null;
  let lastAttemptAt = 0;

  const checkForNavigation = () => {
    if (!hasFreshOpenFlag()) {
      return;
    }

    const slug = getProblemSlugFromPath();
    if (!slug) {
      lastSlug = null;
      return;
    }

    const now = Date.now();
    if (slug !== lastSlug) {
      lastSlug = slug;
      lastAttemptedSlug = null;
      lastAttemptAt = 0;
    }

    if (slug !== lastResetSlug) {
      if (lastAttemptedSlug === slug && now - lastAttemptAt < SLUG_CHECK_INTERVAL_MS) {
        return;
      }

      lastAttemptedSlug = slug;
      lastAttemptAt = now;
      void tryFreshReset(slug);
    }
  };

  const tryFreshReset = async (slug: string) => {
    if (isResetting || slug === lastResetSlug) {
      return;
    }

    isResetting = true;
    try {
      clearStoredEditorDrafts(slug);

      const resetButton = await waitForNeetcodeResetButton();
      if (resetButton) {
        resetButton.click();
        // NeetCode may show a confirm dialog
        await waitForConfirmClick();
        showToast('Starting with a clean editor');
      }

      lastResetSlug = slug;
      stripFreshOpenFlag();
    } catch (error) {
      console.error('Failed to auto reset NeetCode editor:', error);
    } finally {
      isResetting = false;
    }
  };

  if (hasFreshOpenFlag()) {
    const slug = getProblemSlugFromPath();
    if (slug) {
      clearStoredEditorDrafts(slug);
    }
  }

  checkForNavigation();

  const observer = new MutationObserver(() => {
    checkForNavigation();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', checkForNavigation);
  window.setInterval(checkForNavigation, SLUG_CHECK_INTERVAL_MS);
}

function waitForResetButton(): Promise<HTMLButtonElement | null> {
  return waitForElement(findLeetcodeResetButton, RESET_BUTTON_WAIT_MS);
}

function waitForNeetcodeResetButton(): Promise<HTMLButtonElement | null> {
  return waitForElement(findNeetcodeResetButton, RESET_BUTTON_WAIT_MS);
}

function waitForElement(find: () => HTMLButtonElement | null, timeoutMs: number): Promise<HTMLButtonElement | null> {
  return new Promise((resolve) => {
    const existing = find();
    if (existing) {
      resolve(existing);
      return;
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
      const button = find();
      if (button) {
        window.clearInterval(interval);
        resolve(button);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        window.clearInterval(interval);
        resolve(null);
      }
    }, RESET_CONFIRM_POLL_MS);
  });
}

function waitForConfirmClick(): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = findConfirmButton();
    if (existing) {
      existing.click();
      resolve(true);
      return;
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
      const button = findConfirmButton();
      if (button) {
        button.click();
        window.clearInterval(interval);
        resolve(true);
        return;
      }

      if (Date.now() - start >= RESET_CONFIRM_TIMEOUT_MS) {
        window.clearInterval(interval);
        resolve(false);
      }
    }, RESET_CONFIRM_POLL_MS);
  });
}

export function findLeetcodeResetButton(): HTMLButtonElement | null {
  const icon = document.querySelector("svg[data-icon='arrow-rotate-left']");
  const button = icon?.closest('button');
  return button instanceof HTMLButtonElement ? button : null;
}

export function findNeetcodeResetButton(): HTMLButtonElement | null {
  // Prefer accessible name / title
  const candidates = document.querySelectorAll('button, [role="button"]');
  for (const el of candidates) {
    const label = [el.getAttribute('aria-label'), el.getAttribute('title'), el.textContent]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!/(reset|restore|default)/i.test(label)) {
      continue;
    }
    if (el instanceof HTMLButtonElement) {
      return el;
    }
    const nested = el.querySelector('button');
    if (nested instanceof HTMLButtonElement) {
      return nested;
    }
  }

  // Font Awesome / similar rotate icons near the editor toolbar
  const icon = document.querySelector(
    'svg[data-icon="arrow-rotate-left"], svg[data-icon="rotate-left"], i.fa-rotate-left, i.fa-undo'
  );
  const fromIcon = icon?.closest('button');
  return fromIcon instanceof HTMLButtonElement ? fromIcon : null;
}

function findConfirmButton(): HTMLButtonElement | null {
  const buttons = document.querySelectorAll('button');
  for (const button of buttons) {
    const text = button.textContent?.trim();
    if (text === 'Confirm' || text === 'Reset' || text === 'OK' || text === 'Yes') {
      return button instanceof HTMLButtonElement ? button : null;
    }
  }
  return null;
}

function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#323232',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out',
  } as Partial<CSSStyleDeclaration>);

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  window.setTimeout(() => {
    toast.style.opacity = '0';
    window.setTimeout(() => toast.remove(), 300);
  }, RESET_TOAST_DURATION_MS);
}
