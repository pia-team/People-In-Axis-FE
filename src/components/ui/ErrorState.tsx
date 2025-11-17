import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showDetails?: boolean;
  error?: Error | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  showDetails = false,
  error
}) => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight={200}
      p={3}
    >
      <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
          {showDetails && error && import.meta.env.DEV && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, textAlign: 'left' }}>
              <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {error.toString()}
                {error.stack}
              </Typography>
            </Box>
          )}
          {onRetry && (
            <Button 
              variant="contained" 
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{ mt: 2 }}
            >
              {retryLabel}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ErrorState;

