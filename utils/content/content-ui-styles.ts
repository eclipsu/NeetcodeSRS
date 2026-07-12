/** Shared typography for injected LeetCode UI (isolates from host page CSS). */
export const CONTENT_UI_FONT = "Inter, 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif";

export const CONTENT_UI_BASE = `
  box-sizing: border-box;
  font-family: ${CONTENT_UI_FONT};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
`;

export const CONTENT_UI_BUTTON_RESET = `
  ${CONTENT_UI_BASE}
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
`;
