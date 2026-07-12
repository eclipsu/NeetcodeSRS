/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '../Header';

describe('Header', () => {
  it('renders the provided title', () => {
    render(<Header title="NeetcodeSRS" />);

    const title = screen.getByRole('heading', { name: 'Neetcode SRS', level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-lg', 'font-bold', 'text-primary');
    expect(screen.getByText('SRS')).toHaveClass('text-rating-easy');
  });

  it('renders children when provided', () => {
    render(
      <Header title="Test Title">
        <button>Test Button</button>
      </Header>
    );

    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
  });
});
