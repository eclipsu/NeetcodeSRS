/**
 * Domain utilities for LeetCode and NeetCode problem pages
 */

import type { CardDomain } from '@/shared/cards';

export type { CardDomain, LeetcodeDomain } from '@/shared/cards';

/**
 * Detects the current problem site based on the hostname
 */
export function getCurrentDomain(): CardDomain {
  const hostname = window.location.hostname;
  if (hostname.includes('neetcode.io')) {
    return 'neetcode.io';
  }
  if (hostname.includes('leetcode.cn')) {
    return 'leetcode.cn';
  }
  return 'leetcode.com';
}

export function isNeetcodeDomain(): boolean {
  return getCurrentDomain() === 'neetcode.io';
}

/**
 * Returns the GraphQL API URL for the current LeetCode domain
 */
export function getGraphQLUrl(): string {
  const domain = getCurrentDomain();
  if (domain === 'neetcode.io') {
    throw new Error('GraphQL is only available on LeetCode domains');
  }
  return `https://${domain}/graphql`;
}

/**
 * Returns the NeetCode problem metadata API URL
 */
export function getNeetcodeMetadataUrl(): string {
  return 'https://neetcode.io/api/getProblemMetadataFunctionHttp';
}

/**
 * Returns the problem URL for a given slug on the current domain
 */
export function getProblemUrl(slug: string): string {
  const domain = getCurrentDomain();
  if (domain === 'neetcode.io') {
    return `https://neetcode.io/problems/${slug}`;
  }
  return `https://${domain}/problems/${slug}/description/`;
}
