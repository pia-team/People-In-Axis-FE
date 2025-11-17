import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
  spacing?: number;
}

/**
 * Generic loading skeleton component
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  spacing = 1,
}) => {
  if (count === 1) {
    return <Skeleton variant={variant} width={width} height={height} />;
  }

  return (
    <Stack spacing={spacing}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} width={width} height={height} />
      ))}
    </Stack>
  );
};

/**
 * Table row skeleton
 */
export const TableRowSkeleton: React.FC<{ columns: number; rows?: number }> = ({
  columns,
  rows = 5,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} style={{ padding: '8px' }}>
              <Skeleton variant="text" width="100%" height={24} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/**
 * Card skeleton
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2, borderRadius: 1 }} />
        </Box>
      ))}
    </>
  );
};

/**
 * DataGrid skeleton overlay
 */
export const DataGridSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="25%" height={40} />
            ))}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default LoadingSkeleton;

