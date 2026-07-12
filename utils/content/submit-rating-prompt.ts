import { RATING_BUTTON_CONFIGS, THEME_COLORS, LEETSRS_BUTTON_COLOR } from './constants';
import { getRatingColor, isDarkMode } from './theme';
import { createButton } from './button';
import { getServiceTranslations } from '@/services/i18n';
import { CONTENT_UI_BASE, CONTENT_UI_BUTTON_RESET } from './content-ui-styles';

export type SubmitRatingHandlers = {
  onRate: (rating: number, label: string) => void | Promise<void>;
  onAddWithoutRating: () => void | Promise<void>;
};

export type SubmitRatingPromptOptions = {
  /** Anchor the prompt below this element (e.g. LeetCode Submit button). */
  anchor?: Element | null;
  /** Preferred placement relative to the anchor. Defaults to below. */
  placement?: 'below' | 'above';
};

const PROMPT_ID = 'neetcodesrs-submit-rating-prompt';
const PROMPT_WIDTH = 300;
const VIEWPORT_GAP = 12;

export function hideSubmitRatingPrompt(): void {
  document.getElementById(PROMPT_ID)?.remove();
  window.removeEventListener('resize', repositionActivePrompt);
  window.removeEventListener('scroll', repositionActivePrompt, true);
}

let activeAnchor: Element | null = null;
let activePlacement: 'below' | 'above' = 'below';

function repositionActivePrompt(): void {
  const prompt = document.getElementById(PROMPT_ID);
  if (!prompt || !activeAnchor || !document.contains(activeAnchor)) {
    return;
  }
  positionPromptNearAnchor(prompt, activeAnchor, activePlacement);
}

/**
 * Floating prompt shown after an Accepted submission.
 */
export function showSubmitRatingPrompt(handlers: SubmitRatingHandlers, options: SubmitRatingPromptOptions = {}): void {
  hideSubmitRatingPrompt();

  const t = getServiceTranslations();
  const isDark = isDarkMode();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  activeAnchor = options.anchor ?? null;
  activePlacement = options.placement ?? 'below';

  const prompt = document.createElement('div');
  prompt.id = PROMPT_ID;
  prompt.setAttribute('role', 'dialog');
  prompt.setAttribute('aria-label', t.contentScript.rateAfterSubmit);
  prompt.style.cssText = `
    ${CONTENT_UI_BASE}
    position: fixed;
    z-index: 2147483646;
    width: ${PROMPT_WIDTH}px;
    max-width: calc(100vw - 24px);
    background-color: ${colors.bgSecondary};
    color: ${colors.textPrimary};
    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
    border-radius: 12px;
    padding: 14px;
    box-shadow: ${
      isDark
        ? '0 12px 28px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3)'
        : '0 12px 28px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.08)'
    };
  `;

  // Fallback corner placement when no Submit button anchor is available
  if (!activeAnchor) {
    prompt.style.right = '20px';
    prompt.style.bottom = '84px';
  }

  const header = document.createElement('div');
  header.style.cssText =
    'display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin: 0 0 10px;';

  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'min-width: 0; flex: 1;';

  const title = document.createElement('div');
  title.textContent = t.contentScript.rateAfterSubmit;
  title.style.cssText = `
    ${CONTENT_UI_BASE}
    font-size: 14px;
    font-weight: 650;
    line-height: 1.3;
    color: ${colors.textPrimary};
    margin: 0;
  `;

  const hint = document.createElement('div');
  hint.textContent = t.contentScript.rateAfterSubmitHint;
  hint.style.cssText = `
    ${CONTENT_UI_BASE}
    font-size: 12px;
    line-height: 1.35;
    margin-top: 4px;
    color: ${colors.textSecondary};
  `;
  titleWrap.append(title, hint);

  const closeBtn = createButton({
    style: `
      ${CONTENT_UI_BUTTON_RESET}
      border: none;
      background: transparent;
      color: ${colors.textSecondary};
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 2px 4px;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      flex-shrink: 0;
    `,
    onClick: () => hideSubmitRatingPrompt(),
  });
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  header.append(titleWrap, closeBtn);

  const accent = document.createElement('div');
  accent.style.cssText = `
    height: 3px;
    width: 36px;
    border-radius: 999px;
    background: ${LEETSRS_BUTTON_COLOR};
    margin: 0 0 12px;
  `;

  const ratings = document.createElement('div');
  ratings.style.cssText = 'display: flex; gap: 6px; margin: 0 0 8px;';

  RATING_BUTTON_CONFIGS.forEach(({ rating, labelKey, colorKey }) => {
    const { bg, hover } = getRatingColor(colorKey);
    const label = t.ratings[labelKey];
    const button = createButton({
      style: `
        ${CONTENT_UI_BUTTON_RESET}
        flex: 1;
        min-width: 0;
        padding: 0 4px;
        border-radius: 7px;
        background-color: ${bg};
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: background-color 0.15s;
        height: 32px;
      `,
      onClick: () => {
        void handlers.onRate(rating, label);
        hideSubmitRatingPrompt();
      },
    });
    button.textContent = label;
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hover;
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = bg;
    });
    ratings.appendChild(button);
  });

  const addButton = createButton({
    style: `
      ${CONTENT_UI_BUTTON_RESET}
      width: 100%;
      padding: 0 12px;
      border-radius: 7px;
      background-color: ${colors.bgAddButton};
      color: ${colors.textAddButton};
      font-size: 12px;
      font-weight: 500;
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      cursor: pointer;
      height: 32px;
    `,
    onClick: () => {
      void handlers.onAddWithoutRating();
      hideSubmitRatingPrompt();
    },
  });
  addButton.textContent = t.contentScript.addToSrsNoRating;

  prompt.append(header, accent, ratings, addButton);
  document.body.appendChild(prompt);

  if (activeAnchor) {
    positionPromptNearAnchor(prompt, activeAnchor, activePlacement);
    window.addEventListener('resize', repositionActivePrompt);
    window.addEventListener('scroll', repositionActivePrompt, true);
  }

  const onOutside = (event: MouseEvent) => {
    if (!prompt.contains(event.target as Node)) {
      hideSubmitRatingPrompt();
      document.removeEventListener('click', onOutside);
    }
  };
  setTimeout(() => document.addEventListener('click', onOutside), 0);
}

export function positionPromptNearAnchor(
  prompt: HTMLElement,
  anchor: Element,
  placement: 'below' | 'above' = 'below'
): void {
  const rect = anchor.getBoundingClientRect();
  const promptWidth = Math.min(PROMPT_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
  const promptHeight = prompt.offsetHeight || 160;

  // Align the prompt's right edge with the submit button's right edge
  let left = rect.right - promptWidth;
  left = Math.max(VIEWPORT_GAP, Math.min(left, window.innerWidth - promptWidth - VIEWPORT_GAP));

  let top: number;
  if (placement === 'below') {
    top = rect.bottom + 8;
    // If it would go off-screen, flip above the button
    if (top + promptHeight > window.innerHeight - VIEWPORT_GAP) {
      top = rect.top - promptHeight - 8;
    }
  } else {
    top = rect.top - promptHeight - 8;
    if (top < VIEWPORT_GAP) {
      top = rect.bottom + 8;
    }
  }

  top = Math.max(VIEWPORT_GAP, Math.min(top, window.innerHeight - promptHeight - VIEWPORT_GAP));

  prompt.style.left = `${Math.round(left)}px`;
  prompt.style.top = `${Math.round(top)}px`;
  prompt.style.right = 'auto';
  prompt.style.bottom = 'auto';
  prompt.style.width = `${promptWidth}px`;
}
