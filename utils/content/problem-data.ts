import type { ProblemData } from '@/shared/problem-data';
import { getCurrentDomain, getGraphQLUrl, getNeetcodeMetadataUrl, isNeetcodeDomain } from './domain';

// Cache to avoid redundant requests
let cachedData: { slug: string; data: ProblemData } | null = null;

// Export for testing purposes
export function clearCache(): void {
  cachedData = null;
}

export async function extractProblemData(): Promise<ProblemData | null> {
  try {
    const currentSlug = getCurrentTitleSlug();
    if (!currentSlug) {
      console.log('Could not extract title slug');
      return null;
    }
    const titleSlug = currentSlug;

    if (cachedData && cachedData.slug === titleSlug) {
      return cachedData.data;
    }

    const problemData = isNeetcodeDomain()
      ? await fetchNeetcodeProblemData(titleSlug)
      : await fetchLeetcodeProblemData(titleSlug);

    if (problemData) {
      cachedData = { slug: titleSlug, data: problemData };
      return problemData;
    }

    console.log('Problem data not found');
    return null;
  } catch (error) {
    console.error('Error extracting problem data:', error);
    return null;
  }
}

function getCurrentTitleSlug(): string | null {
  // LeetCode: window.next.router is most reliable after SPA navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextRouter = (window as any).next?.router;
  if (nextRouter?.query?.slug) {
    return nextRouter.query.slug;
  }

  // NeetCode + LeetCode URL fallback: /problems/:slug/...
  const pathMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
  return pathMatch ? pathMatch[1] : null;
}

async function fetchNeetcodeProblemData(problemId: string): Promise<ProblemData | null> {
  try {
    const response = await fetch(getNeetcodeMetadataUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { problemId },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const problem = payload?.data;
    if (!problem?.id || !problem?.name || !problem?.difficulty) {
      return null;
    }

    const difficulty = normalizeDifficulty(problem.difficulty);
    if (!difficulty) {
      return null;
    }

    return {
      difficulty,
      title: problem.name,
      titleSlug: problem.id,
      questionFrontendId: problem.id,
    };
  } catch (error) {
    console.error('Error fetching NeetCode problem data:', error);
    return null;
  }
}

function normalizeDifficulty(value: string): ProblemData['difficulty'] | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'easy') return 'Easy';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'hard') return 'Hard';
  return null;
}

async function fetchLeetcodeProblemData(titleSlug: string): Promise<ProblemData | null> {
  try {
    const graphqlQuery = {
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            translatedTitle
            titleSlug
            difficulty
          }
        }
      `,
      variables: {
        titleSlug: titleSlug,
      },
    };

    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1];

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(getGraphQLUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(graphqlQuery),
    });

    if (response.ok) {
      const data = await response.json();
      const question = data?.data?.question;

      if (question) {
        const useTranslated = getCurrentDomain() === 'leetcode.cn' && question.translatedTitle;
        return {
          difficulty: question.difficulty as ProblemData['difficulty'],
          title: useTranslated ? question.translatedTitle : question.title,
          titleSlug: question.titleSlug,
          questionFrontendId: question.questionFrontendId,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching LeetCode problem data:', error);
    return null;
  }
}
