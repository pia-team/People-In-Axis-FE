import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import LoadingState from '@/components/ui/LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without message when message is empty', () => {
    render(<LoadingState message="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders fullScreen when fullScreen is true', () => {
    const { container } = render(<LoadingState fullScreen />);
    // Check if CircularProgress is rendered
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });

  it('renders normal view when fullScreen is false', () => {
    const { container } = render(<LoadingState fullScreen={false} />);
    // Check if CircularProgress is rendered
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });

  it('renders CircularProgress', () => {
    const { container } = render(<LoadingState />);
    const progress = container.querySelector('.MuiCircularProgress-root');
    expect(progress).toBeInTheDocument();
  });
});

