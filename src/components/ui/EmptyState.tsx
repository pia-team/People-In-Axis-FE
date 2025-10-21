import React from 'react';
import { Box, Typography, Button } from '@mui/material';

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data',
  description = 'There is nothing to display yet.',
  actionLabel,
  onAction,
}) => (
  <Box sx={{ textAlign: 'center', py: 6 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
    )}
  </Box>
);

export default EmptyState;
