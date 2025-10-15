import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error', error);
  }

  handleReload = () => {
    this.setState({ hasError: false });
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
              <Button variant="contained" onClick={this.handleReload}>Try Again</Button>
            </Stack>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
