import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import ErrorState from '@/components/ui/ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorState title="Custom Error" message="Error details" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    const retryButton = screen.getByText('Try Again');
    retryButton.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});

