import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders with default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing to display yet.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(<EmptyState title="No items" description="No items found" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const onAction = vi.fn();
    render(<EmptyState actionLabel="Add Item" onAction={onAction} />);
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    button.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is not provided', () => {
    render(<EmptyState onAction={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render action button when onAction is not provided', () => {
    render(<EmptyState actionLabel="Add Item" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

