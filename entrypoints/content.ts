import {
  createLeetSrsButton,
  createNeetcodeSrsButton,
  extractProblemData,
  getCurrentDomain,
  isNeetcodeDomain,
  RatingMenu,
  setupLeetcodeAutoReset,
  setupNeetcodeSubmitWatcher,
  Tooltip,
} from '@/utils/content';
import { getServiceTranslations } from '@/services/i18n';
import { sendMessage, MessageType } from '@/shared/messages';
import type { Grade } from 'ts-fsrs';

export default defineContentScript({
  matches: ['*://*.leetcode.com/*', '*://*.leetcode.cn/*', '*://neetcode.io/*', '*://*.neetcode.io/*'],
  runAt: 'document_idle',
  async main() {
    try {
      await sendMessage({ type: MessageType.PING });
    } catch (error) {
      console.error('Failed to ping service worker:', error);
    }

    if (isNeetcodeDomain()) {
      setupNeetcodeSrsButton();
      setupNeetcodeSubmitWatcher({
        handlers: createCardActionHandlers(),
      });
      return;
    }

    setupLeetSrsButton();
    setupLeetcodeAutoReset();
  },
});

async function withProblemData<T>(
  action: (problemData: NonNullable<Awaited<ReturnType<typeof extractProblemData>>>) => Promise<T>
): Promise<T | undefined> {
  const problemData = await extractProblemData();
  if (!problemData) {
    console.error('Could not extract problem data');
    return undefined;
  }

  try {
    return await action(problemData);
  } catch (error) {
    console.error('Error processing action:', error);
    return undefined;
  }
}

function createCardActionHandlers() {
  return {
    onRate: async (rating: number, label: string) => {
      await withProblemData(async (problemData) => {
        const result = await sendMessage({
          type: MessageType.RATE_CARD,
          slug: problemData.titleSlug,
          name: problemData.title,
          rating: rating as Grade,
          leetcodeId: problemData.questionFrontendId,
          difficulty: problemData.difficulty,
          domain: getCurrentDomain(),
        });
        console.log(`${label} - Card rated:`, result);
        return result;
      });
    },
    onAddWithoutRating: async () => {
      await withProblemData(async (problemData) => {
        const result = await sendMessage({
          type: MessageType.ADD_CARD,
          slug: problemData.titleSlug,
          name: problemData.title,
          leetcodeId: problemData.questionFrontendId,
          difficulty: problemData.difficulty,
          domain: getCurrentDomain(),
        });
        console.log('Add without rating - Card added:', result);
        return result;
      });
    },
  };
}

function createRatingHandlers(buttonWrapper: HTMLElement, menuPosition: 'top' | 'bottom') {
  const handlers = createCardActionHandlers();
  return new RatingMenu(buttonWrapper, handlers.onRate, handlers.onAddWithoutRating, { position: menuPosition });
}

function setupLeetSrsButton() {
  const BUTTON_ID = 'neetcodesrs-button-wrapper';
  const tooltip = new Tooltip();

  function insertButton(buttonsContainer: Element) {
    if (buttonsContainer.querySelector(`#${BUTTON_ID}`)) {
      return;
    }

    let ratingMenu: RatingMenu | null = null;
    const buttonWrapper = createLeetSrsButton(() => {
      ratingMenu?.toggle();
    });
    buttonWrapper.id = BUTTON_ID;
    ratingMenu = createRatingHandlers(buttonWrapper, 'bottom');

    const t = getServiceTranslations();
    const clickableDiv = buttonWrapper.querySelector('[data-state="closed"]') as HTMLElement;
    if (clickableDiv) {
      clickableDiv.addEventListener('mouseenter', () => {
        tooltip.show(clickableDiv, t.app.name);
      });

      clickableDiv.addEventListener('mouseleave', () => {
        tooltip.hide();
      });
    }

    const lastButtonGroup = buttonsContainer.lastElementChild;

    try {
      buttonsContainer.insertBefore(buttonWrapper, lastButtonGroup);
    } catch (error) {
      console.error('Error adding NeetcodeSRS button:', error);
    }
  }

  const tryInsertButton = () => {
    const buttonsContainer = document.querySelector('#ide-top-btns');
    if (buttonsContainer) {
      insertButton(buttonsContainer);
    }
  };
  tryInsertButton();

  const observer = new MutationObserver(tryInsertButton);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function setupNeetcodeSrsButton() {
  const BUTTON_ID = 'neetcodesrs-button-wrapper';

  function insertButton(navbarRight: Element) {
    if (document.querySelector(`#${BUTTON_ID}`)) {
      return;
    }

    // Only inject on problem pages
    if (!window.location.pathname.includes('/problems/')) {
      return;
    }

    let ratingMenu: RatingMenu | null = null;
    const buttonWrapper = createNeetcodeSrsButton(() => {
      ratingMenu?.toggle();
    });
    buttonWrapper.id = BUTTON_ID;
    ratingMenu = createRatingHandlers(buttonWrapper, 'bottom');

    const themeBtn = navbarRight.querySelector('app-theme-btn') ?? navbarRight.querySelector('#theme-btn');
    try {
      if (themeBtn) {
        navbarRight.insertBefore(buttonWrapper, themeBtn);
      } else {
        navbarRight.prepend(buttonWrapper);
      }
    } catch (error) {
      console.error('Error adding NeetcodeSRS button:', error);
    }
  }

  const tryInsertButton = () => {
    const navbar = document.querySelector('.social-navbar.my-navbar');
    const rightSide = navbar?.children[1];
    if (rightSide) {
      insertButton(rightSide);
    }
  };

  tryInsertButton();

  const observer = new MutationObserver(tryInsertButton);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
