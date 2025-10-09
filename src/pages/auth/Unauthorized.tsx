import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center">
      <Typography variant="h1" color="error">
        403
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        You don't have permission to access this resource.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default Unauthorized;
