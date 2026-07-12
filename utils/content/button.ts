import { LEETSRS_BUTTON_COLOR } from './constants';
import { getServiceTranslations } from '@/services/i18n';

/** Filled rotate icon (matches NeetCode FA icon rendering: fill currentColor). */
const SRS_ICON_SVG = `
  <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" role="img" style="display:block;width:18px;height:18px;overflow:visible;">
    <path fill="currentColor" d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h111.5h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0zM369.1 369.1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4h-.4c-17.7 0-32 14.3-32 32V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.8l17.6 17.5c87.5 87.5 229.3 87.5 316.8 0z"/>
  </svg>
`;

/** Stroke icon for LeetCode toolbar (matches site icon style). */
const LEETCODE_SRS_ICON_SVG = `
  <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em]" role="img">
    <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5" />
    <path d="M5.63 7.16l0 .01" />
    <path d="M4.06 11l0 .01" />
    <path d="M4.63 15.1l0 .01" />
    <path d="M7.16 18.37l0 .01" />
    <path d="M11 19.94l0 .01" />
  </svg>
`;

export function createButton(options: {
  className?: string;
  style?: string;
  innerHTML?: string;
  onClick?: () => void;
}): HTMLButtonElement {
  const button = document.createElement('button');

  if (options.className) {
    button.className = options.className;
  }

  if (options.style) {
    button.style.cssText = options.style;
  }

  if (options.innerHTML) {
    button.innerHTML = options.innerHTML;
  }

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  }

  return button;
}

export function createLeetSrsButton(onClick: () => void): HTMLDivElement {
  const t = getServiceTranslations();
  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'relative flex';

  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'relative flex overflow-hidden rounded bg-fill-tertiary dark:bg-fill-tertiary';

  const groupWrapper = document.createElement('div');
  groupWrapper.className =
    'group flex flex-none items-center justify-center hover:bg-fill-quaternary dark:hover:bg-fill-quaternary';

  const clickableDiv = document.createElement('div');
  clickableDiv.className = 'flex cursor-pointer p-2';
  clickableDiv.setAttribute('data-state', 'closed');
  clickableDiv.setAttribute('title', t.app.name);
  clickableDiv.setAttribute('aria-label', t.app.name);
  clickableDiv.style.color = LEETSRS_BUTTON_COLOR;

  clickableDiv.innerHTML = `
    <div class="relative text-[16px] leading-[normal] before:block before:h-4 before:w-4">
      ${LEETCODE_SRS_ICON_SVG}
    </div>
  `;

  clickableDiv.addEventListener('click', onClick);

  groupWrapper.appendChild(clickableDiv);
  innerWrapper.appendChild(groupWrapper);
  buttonWrapper.appendChild(innerWrapper);

  return buttonWrapper;
}

/**
 * Button styled for NeetCode's Angular navbar (app-problem-navbar).
 */
export function createNeetcodeSrsButton(onClick: () => void): HTMLDivElement {
  const t = getServiceTranslations();
  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.cssText = 'display:inline-flex;align-items:center;margin:0 2px;position:relative;';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button navbar-btn has-tooltip-bottom is-rounded';
  button.setAttribute('data-tooltip', t.app.name);
  button.setAttribute('title', t.app.name);
  button.setAttribute('aria-label', t.app.name);
  button.style.cssText = `
    color: ${LEETSRS_BUTTON_COLOR} !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 36px !important;
    height: 36px !important;
    min-width: 36px;
    padding: 0 !important;
    margin: 0;
    cursor: pointer;
    line-height: 1;
    flex-shrink: 0;
  `;
  button.innerHTML = SRS_ICON_SVG;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  buttonWrapper.appendChild(button);
  return buttonWrapper;
}
