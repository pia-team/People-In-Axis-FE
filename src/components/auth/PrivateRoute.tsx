import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useKeycloak } from '@/hooks/useKeycloak';
import { CircularProgress, Box } from '@mui/material';
import { AUTH_ENABLED } from '@/config/featureFlags';

interface PrivateRouteProps {
  roles?: string[];
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  roles = [], 
  redirectTo = '/login' 
}) => {
  // When auth is disabled, allow access to any route
  if (!AUTH_ENABLED) {
    return <Outlet />;
  }

  const { initialized, authenticated, hasAnyRole } = useKeycloak();

  if (!initialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
