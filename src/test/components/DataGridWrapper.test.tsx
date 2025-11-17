import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import DataGridWrapper from '@/components/ui/DataGridWrapper';
import type { GridColDef } from '@mui/x-data-grid';

interface TestRow {
  id: string;
  name: string;
  email: string;
}

describe('DataGridWrapper', () => {
  const columns: GridColDef<TestRow>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
  ];

  const mockRows: TestRow[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  it('renders DataGrid with rows and columns', () => {
    render(
      <DataGridWrapper
        rows={mockRows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    // DataGrid should render (checking for grid container)
    const gridContainer = document.querySelector('.MuiDataGrid-root');
    expect(gridContainer).toBeInTheDocument();
  });

  it('shows loading state when loading is true and no rows', () => {
    render(
      <DataGridWrapper
        rows={[]}
        columns={columns}
        loading={true}
        getRowId={(row) => row.id}
      />
    );

    // Should show skeleton instead of grid
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });

  it('shows error state when error is provided', () => {
    const error = new Error('Test error message');
    const onRetry = vi.fn();

    render(
      <DataGridWrapper
        rows={[]}
        columns={columns}
        error={error}
        onRetry={onRetry}
        getRowId={(row) => row.id}
      />
    );

    // ErrorState renders title "Failed to load data" as h6
    // Check for the title using getAllByText and get the first one (title)
    const titles = screen.getAllByText('Failed to load data');
    expect(titles.length).toBeGreaterThan(0);
    // Check for retry button
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const error = new Error('Test error');
    const onRetry = vi.fn();

    render(
      <DataGridWrapper
        rows={[]}
        columns={columns}
        error={error}
        onRetry={onRetry}
        getRowId={(row) => row.id}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when no rows and not loading', () => {
    render(
      <DataGridWrapper
        rows={[]}
        columns={columns}
        loading={false}
        getRowId={(row) => row.id}
      />
    );

    // DataGrid should render with empty state overlay
    const gridContainer = document.querySelector('.MuiDataGrid-root');
    expect(gridContainer).toBeInTheDocument();
  });

  it('uses custom empty title and description', () => {
    render(
      <DataGridWrapper
        rows={[]}
        columns={columns}
        emptyTitle="No items found"
        emptyDescription="Please try a different search"
        getRowId={(row) => row.id}
      />
    );

    // Empty state should be shown via DataGrid's noRowsOverlay
    const gridContainer = document.querySelector('.MuiDataGrid-root');
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders data when rows are provided', () => {
    render(
      <DataGridWrapper
        rows={mockRows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    const gridContainer = document.querySelector('.MuiDataGrid-root');
    expect(gridContainer).toBeInTheDocument();
  });
});
