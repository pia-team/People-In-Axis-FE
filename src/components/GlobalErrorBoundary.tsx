import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';

type Props = { children: React.ReactNode };

type State = { 
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry if available
    try {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
        },
      });
    } catch {
      // Sentry not initialized or failed
    }
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Unhandled UI error', error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Paper sx={{ p: 4, maxWidth: 560 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Something went wrong</Typography>
              <Typography variant="body2" color="text.secondary">
                An unexpected error occurred. Please try again. If the problem persists, contact support.
              </Typography>
              {import.meta.env.DEV && this.state.error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}
              <Button variant="contained" onClick={this.handleReload}>Try Again</Button>
            </Stack>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
