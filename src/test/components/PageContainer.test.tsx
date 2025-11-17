import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import PageContainer from '@/components/ui/PageContainer';

describe('PageContainer', () => {
  it('renders children', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<PageContainer title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageContainer subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders title and subtitle together', () => {
    render(<PageContainer title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageContainer
        title="Test Title"
        actions={<button>Action Button</button>}
      />
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('does not render header section when title, subtitle, and actions are not provided', () => {
    const { container } = render(<PageContainer>Content</PageContainer>);
    const header = container.querySelector('div[class*="MuiStack"]');
    // Header should not exist when no title/subtitle/actions
    expect(header).not.toBeInTheDocument();
  });
});

