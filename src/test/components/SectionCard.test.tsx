import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import SectionCard from '@/components/ui/SectionCard';

describe('SectionCard', () => {
  it('renders children', () => {
    render(
      <SectionCard>
        <div>Test Content</div>
      </SectionCard>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<SectionCard title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <SectionCard
        title="Test Title"
        actions={<button>Action Button</button>}
      />
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('renders title and actions together', () => {
    render(
      <SectionCard
        title="Test Title"
        actions={<button>Action</button>}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('does not render header when title and actions are not provided', () => {
    const { container } = render(<SectionCard>Content</SectionCard>);
    // Should still render the Paper component
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeInTheDocument();
  });
});

