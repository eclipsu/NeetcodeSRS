import { RATING_BUTTON_CONFIGS, THEME_COLORS } from './constants';
import { getRatingColor, isDarkMode } from './theme';
import { createButton } from './button';
import { getServiceTranslations } from '@/services/i18n';
import { CONTENT_UI_BASE, CONTENT_UI_BUTTON_RESET } from './content-ui-styles';

export type RatingCallback = (rating: number, label: string) => void;
type RatingMenuPosition = 'top' | 'bottom';
type RatingMenuOptions = {
  position?: RatingMenuPosition;
};

export class RatingMenu {
  private element: HTMLDivElement | null = null;
  private container: HTMLElement;
  private onRate: RatingCallback;
  private onAddWithoutRating: () => void;
  private position: RatingMenuPosition;

  constructor(
    container: HTMLElement,
    onRate: RatingCallback,
    onAddWithoutRating: () => void,
    options?: RatingMenuOptions
  ) {
    this.container = container;
    this.onRate = onRate;
    this.onAddWithoutRating = onAddWithoutRating;
    this.position = options?.position ?? 'bottom';
  }

  toggle(): void {
    if (this.element) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    if (this.element) return;

    const t = getServiceTranslations();
    this.element = document.createElement('div');
    const isDark = isDarkMode();
    const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

    const positionStyles =
      this.position === 'top' ? 'bottom: 100%; margin-bottom: 8px;' : 'top: 100%; margin-top: 8px;';

    this.element.style.cssText = `
      ${CONTENT_UI_BASE}
      position: absolute;
      right: 0;
      ${positionStyles}
      min-width: 188px;
      background-color: ${colors.bgSecondary};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
      border-radius: 10px;
      padding: 10px;
      box-shadow: ${
        isDark
          ? '0 8px 16px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)'
          : '0 8px 16px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.08)'
      };
      z-index: 2147483645;
    `;

    const ratingButtonsContainer = document.createElement('div');
    ratingButtonsContainer.style.cssText = `
      display: flex;
      gap: 5px;
      margin: 0 0 8px;
    `;

    RATING_BUTTON_CONFIGS.forEach(({ rating, labelKey, colorKey }) => {
      const { bg, hover } = getRatingColor(colorKey);
      const label = t.ratings[labelKey];

      const button = createButton({
        style: `
          ${CONTENT_UI_BUTTON_RESET}
          flex: 1;
          min-width: 0;
          padding: 0 4px;
          border-radius: 6px;
          background-color: ${bg};
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s;
          height: 30px;
        `,
        onClick: () => {
          this.onRate(rating, label);
          this.hide();
        },
      });

      button.textContent = label;

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = hover;
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = bg;
      });

      ratingButtonsContainer.appendChild(button);
    });

    this.element.appendChild(ratingButtonsContainer);
    this.element.appendChild(this.createAddWithoutRatingButton());

    this.container.style.position = 'relative';
    this.container.appendChild(this.element);

    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  private createAddWithoutRatingButton(): HTMLButtonElement {
    const t = getServiceTranslations();
    const isDark = isDarkMode();
    const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    const bgColor = colors.bgAddButton;
    const hoverBgColor = colors.bgAddButtonHover;
    const textColor = colors.textAddButton;

    const button = createButton({
      style: `
        ${CONTENT_UI_BUTTON_RESET}
        width: 100%;
        padding: 0 10px;
        border-radius: 6px;
        background-color: ${bgColor};
        color: ${textColor};
        font-size: 12px;
        font-weight: 500;
        border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        cursor: pointer;
        transition: background-color 0.15s;
        height: 30px;
      `,
      onClick: () => {
        this.onAddWithoutRating();
        this.hide();
      },
    });

    button.textContent = t.contentScript.addToSrsNoRating;

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hoverBgColor;
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = bgColor;
    });

    return button;
  }

  hide(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private handleOutsideClick = (e: MouseEvent): void => {
    if (!this.container.contains(e.target as Node)) {
      this.hide();
    }
  };
}
