import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import LoadingSkeleton, { TableRowSkeleton, CardSkeleton, DataGridSkeleton } from '@/components/ui/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders single skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(1);
  });

  it('renders multiple skeletons when count is provided', () => {
    const { container } = render(<LoadingSkeleton count={5} />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(5);
  });

  it('renders with custom variant', () => {
    const { container } = render(<LoadingSkeleton variant="circular" />);
    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders with custom width and height', () => {
    const { container } = render(<LoadingSkeleton width={200} height={50} />);
    const skeleton = container.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('TableRowSkeleton', () => {
  it('renders table rows with specified columns', () => {
    const { container } = render(<table><tbody><TableRowSkeleton columns={3} rows={2} /></tbody></table>);
    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(2);
    const firstRowCells = rows[0].querySelectorAll('td');
    expect(firstRowCells).toHaveLength(3);
  });

  it('renders default 5 rows when rows not specified', () => {
    const { container } = render(<table><tbody><TableRowSkeleton columns={2} /></tbody></table>);
    const rows = container.querySelectorAll('tr');
    expect(rows).toHaveLength(5);
  });
});

describe('CardSkeleton', () => {
  it('renders single card skeleton by default', () => {
    const { container } = render(<CardSkeleton />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders multiple card skeletons when count is provided', () => {
    const { container } = render(<CardSkeleton count={3} />);
    const boxes = container.querySelectorAll('div[class*="MuiBox"]');
    expect(boxes.length).toBeGreaterThanOrEqual(3);
  });
});

describe('DataGridSkeleton', () => {
  it('renders data grid skeleton', () => {
    const { container } = render(<DataGridSkeleton />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

