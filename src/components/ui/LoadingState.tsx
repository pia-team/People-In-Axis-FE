import React from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

/**
 * Generic loading state component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 40,
  fullScreen = false,
}) => {
  const content = (
    <Stack spacing={2} alignItems="center" justifyContent="center">
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={200}
      p={3}
    >
      {content}
    </Box>
  );
};

export default LoadingState;

