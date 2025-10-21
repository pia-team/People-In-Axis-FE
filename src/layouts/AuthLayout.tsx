import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F7F8FC 0%, #FFFFFF 100%)',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }} color="primary">
            People In Axis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Sign in to continue to your workspace
          </Typography>
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
