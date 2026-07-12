import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hideSubmitRatingPrompt, showSubmitRatingPrompt } from '../submit-rating-prompt';

// @vitest-environment happy-dom

describe('submit rating prompt', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.add('dark-theme');
  });

  afterEach(() => {
    hideSubmitRatingPrompt();
    vi.restoreAllMocks();
  });

  it('renders rating actions and calls handlers', () => {
    const onRate = vi.fn();
    const onAddWithoutRating = vi.fn();

    showSubmitRatingPrompt({ onRate, onAddWithoutRating });

    const prompt = document.getElementById('leetsrs-submit-rating-prompt');
    expect(prompt).toBeTruthy();
    expect(prompt?.textContent).toContain('How hard was this?');

    const good = [...prompt!.querySelectorAll('button')].find((b) => b.textContent === 'Good');
    expect(good).toBeTruthy();
    good!.click();
    expect(onRate).toHaveBeenCalledWith(3, 'Good');
    expect(document.getElementById('leetsrs-submit-rating-prompt')).toBeNull();
  });

  it('supports add without rating', () => {
    const onAddWithoutRating = vi.fn();
    showSubmitRatingPrompt({ onRate: vi.fn(), onAddWithoutRating });

    const prompt = document.getElementById('leetsrs-submit-rating-prompt')!;
    const addBtn = [...prompt.querySelectorAll('button')].find((b) => (b.textContent || '').includes('Add to SRS'));
    addBtn!.click();
    expect(onAddWithoutRating).toHaveBeenCalledTimes(1);
  });
});
