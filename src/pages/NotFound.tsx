import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">404 - Page Not Found</Typography>
          <Typography variant="body2" color="text.secondary">The page you're looking for does not exist.</Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFound;
