import type { Card as FsrsCard } from 'ts-fsrs';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type CardDomain = 'leetcode.com' | 'leetcode.cn' | 'neetcode.io';
/** @deprecated Use CardDomain */
export type LeetcodeDomain = CardDomain;

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

export function getCardProblemUrl(card: Pick<Card, 'slug'>): string {
  return `https://neetcode.io/problems/${card.slug}`;
}
