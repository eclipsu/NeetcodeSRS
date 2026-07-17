import type { Card as FsrsCard } from 'ts-fsrs';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type CardDomain = 'leetcode.com' | 'leetcode.cn' | 'neetcode.io';
/** @deprecated Use CardDomain */
export type LeetcodeDomain = CardDomain;

/** Query flag appended to problem links from the extension to open a clean editor. */
export const FRESH_OPEN_QUERY_PARAM = 'neetcodesrs_fresh';

export interface Card {
  id: string;
  slug: string;
  name: string;
  leetcodeId: string;
  difficulty: Difficulty;
  domain: CardDomain;
  createdAt: Date;
  fsrs: FsrsCard;
  paused: boolean;
}

/**
 * Problem URL opened from the extension. Includes a fresh-open flag so the
 * content script can clear saved editor drafts and reset to the starter code.
 */
export function getCardProblemUrl(card: Pick<Card, 'slug'>): string {
  const url = new URL(`https://neetcode.io/problems/${card.slug}`);
  url.searchParams.set(FRESH_OPEN_QUERY_PARAM, '1');
  return url.toString();
}
