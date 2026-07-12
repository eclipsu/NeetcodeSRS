import { RATING_BUTTON_CONFIGS, THEME_COLORS, LEETSRS_BUTTON_COLOR } from './constants';
import { getRatingColor, isDarkMode } from './theme';
import { createButton } from './button';
import { getServiceTranslations } from '@/services/i18n';
import { CONTENT_UI_BASE, CONTENT_UI_BUTTON_RESET } from './content-ui-styles';

export type SubmitRatingHandlers = {
  onRate: (rating: number, label: string) => void | Promise<void>;
  onAddWithoutRating: () => void | Promise<void>;
};

const PROMPT_ID = 'neetcodesrs-submit-rating-prompt';

export function hideSubmitRatingPrompt(): void {
  document.getElementById(PROMPT_ID)?.remove();
}

/**
 * Floating prompt shown after an Accepted submission.
 */
export function showSubmitRatingPrompt(handlers: SubmitRatingHandlers): void {
  hideSubmitRatingPrompt();

  const t = getServiceTranslations();
  const isDark = isDarkMode();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const prompt = document.createElement('div');
  prompt.id = PROMPT_ID;
  prompt.setAttribute('role', 'dialog');
  prompt.setAttribute('aria-label', t.contentScript.rateAfterSubmit);
  prompt.style.cssText = `
    ${CONTENT_UI_BASE}
    position: fixed;
    right: 20px;
    bottom: 84px;
    z-index: 2147483646;
    width: 300px;
    max-width: calc(100vw - 32px);
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

  const onOutside = (event: MouseEvent) => {
    if (!prompt.contains(event.target as Node)) {
      hideSubmitRatingPrompt();
      document.removeEventListener('click', onOutside);
    }
  };
  setTimeout(() => document.addEventListener('click', onOutside), 0);
}
