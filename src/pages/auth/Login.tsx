import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, authenticated } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  return (
    <Box textAlign="center">
      <Typography variant="h4" component="h1" gutterBottom>
        People In Axis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Human Resources Management System
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={login}
        sx={{ mt: 2 }}
      >
        Sign In with Keycloak
      </Button>
    </Box>
  );
};

export default Login;
