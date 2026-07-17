/**
 * Runs as early as possible so draft code in localStorage/sessionStorage is
 * removed before NeetCode/LeetCode hydrate the editor.
 */
import { clearStoredEditorDrafts, getProblemSlugFromPath, hasFreshOpenFlag } from '@/utils/content/fresh-open';

export default defineContentScript({
  matches: ['*://*.leetcode.com/*', '*://*.leetcode.cn/*', '*://neetcode.io/*', '*://*.neetcode.io/*'],
  runAt: 'document_start',
  main() {
    if (!hasFreshOpenFlag()) {
      return;
    }
    const slug = getProblemSlugFromPath();
    if (!slug) {
      return;
    }
    clearStoredEditorDrafts(slug);
  },
});
