import React from 'react';
import { DataGrid, DataGridProps, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { standardDataGridSx } from './dataGridStyles';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { DataGridSkeleton } from './LoadingSkeleton';

interface DataGridWrapperProps<T> extends Omit<DataGridProps, 'rows' | 'columns'> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  error?: Error | null;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  getRowId: (row: T) => string | number;
}

/**
 * Wrapper component for DataGrid with standardized loading, error, and empty states
 */
export function DataGridWrapper<T>({
  rows,
  columns,
  loading = false,
  error = null,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items to display.',
  onRetry,
  getRowId,
  ...gridProps
}: DataGridWrapperProps<T>) {
  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        message={error.message || 'An error occurred while loading the data.'}
        onRetry={onRetry}
        showDetails={import.meta.env.DEV}
        error={error}
      />
    );
  }

  if (loading && rows.length === 0) {
    return <DataGridSkeleton />;
  }

  const NoRowsOverlay = React.useCallback(
    () => (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    ),
    [emptyTitle, emptyDescription]
  );

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        slots={{ noRowsOverlay: NoRowsOverlay }}
        sx={standardDataGridSx}
        {...gridProps}
      />
    </Box>
  );
}

export default DataGridWrapper;

