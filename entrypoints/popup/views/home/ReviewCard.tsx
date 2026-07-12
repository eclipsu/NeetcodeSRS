import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { Difficulty, getCardProblemUrl, type Card } from '@/shared/cards';
import { Rating } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';
import { Button } from 'react-aria-components';
import { bounceButton } from '@/shared/styles';
import { useI18n } from '../../contexts/I18nContext';

type ReviewCardProps = {
  card: Pick<Card, 'slug' | 'leetcodeId' | 'name' | 'difficulty' | 'domain'>;
  onRate: (rating: Grade) => void;
  isProcessing?: boolean;
};

type RatingButtonConfig = {
  rating: Grade;
  labelKey: 'again' | 'hard' | 'good' | 'easy';
  colorClass: string;
};

const difficultyColorMap: Record<Difficulty, string> = {
  Easy: 'bg-difficulty-easy',
  Medium: 'bg-difficulty-medium',
  Hard: 'bg-difficulty-hard',
};

const ratingButtonConfigs: RatingButtonConfig[] = [
  { rating: Rating.Again, labelKey: 'again', colorClass: 'bg-rating-again' },
  { rating: Rating.Hard, labelKey: 'hard', colorClass: 'bg-rating-hard' },
  { rating: Rating.Good, labelKey: 'good', colorClass: 'bg-rating-good' },
  { rating: Rating.Easy, labelKey: 'easy', colorClass: 'bg-rating-easy' },
];

export function ReviewCard({ card, onRate, isProcessing = false }: ReviewCardProps) {
  const t = useI18n();
  const difficultyColor = difficultyColorMap[card.difficulty] || 'bg-difficulty-medium';

  const handleRating = (rating: Grade) => {
    onRate(rating);
  };

  return (
    <div className="border border-current rounded-lg bg-secondary px-3.5 py-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-medium text-secondary truncate font-jetbrains-mono">#{card.leetcodeId}</span>
        <span className={`text-[11px] leading-none px-2 py-1 rounded text-white shrink-0 ${difficultyColor}`}>
          {card.difficulty}
        </span>
      </div>

      <div className="flex justify-center text-center px-1">
        <a
          href={getCardProblemUrl(card)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold leading-snug text-primary group"
          aria-label="NeetCode problem"
        >
          {card.name}
          <FaArrowUpRightFromSquare className="inline ml-1.5 text-[10px] opacity-60 group-hover:opacity-100 transition-opacity align-baseline" />
        </a>
      </div>

      <div className="flex gap-1.5 justify-center pt-0.5">
        {ratingButtonConfigs.map(({ rating, labelKey, colorClass }) => (
          <Button
            key={labelKey}
            onPress={() => handleRating(rating)}
            isDisabled={isProcessing}
            className={`flex-1 max-w-[4.75rem] py-1.5 rounded text-xs font-semibold ${colorClass} text-white hover:opacity-90 ${bounceButton} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t.ratings[labelKey]}
          </Button>
        ))}
      </div>
    </div>
  );
}
