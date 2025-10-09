import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useKeycloak } from '@/hooks/useKeycloak';
import { AUTH_ENABLED } from '@/config/featureFlags';

interface PublicRouteProps {
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ redirectTo = '/' }) => {
  // When auth is disabled, always allow access to public routes (no redirect)
  if (!AUTH_ENABLED) {
    return <Outlet />;
  }

  const { authenticated } = useKeycloak();

  if (authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
