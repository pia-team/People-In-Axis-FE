import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak, { KeycloakInstance, KeycloakTokenParsed } from 'keycloak-js';
import { AUTH_ENABLED } from '@/config/featureFlags';

interface KeycloakContextType {
  keycloak: KeycloakInstance | null;
  initialized: boolean;
  authenticated: boolean;
  token: string | undefined;
  tokenParsed: KeycloakTokenParsed | undefined;
  login: () => void;
  logout: () => void;
  register: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'people-in-axis',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'people-in-axis-frontend',
};

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [tokenParsed, setTokenParsed] = useState<KeycloakTokenParsed | undefined>();

  useEffect(() => {
    // If auth is disabled, short-circuit and expose a permissive context
    if (!AUTH_ENABLED) {
      setInitialized(true);
      setAuthenticated(true);
      setToken(undefined);
      setTokenParsed(undefined);
      return;
    }

    const initKeycloak = async () => {
      try {
        const kc = new Keycloak(keycloakConfig);
        
        const auth = await kc.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
        });

        setKeycloak(kc);
        setInitialized(true);
        setAuthenticated(auth);
        setToken(kc.token);
        setTokenParsed(kc.tokenParsed);

        // Token refresh
        kc.onTokenExpired = () => {
          kc.updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setToken(kc.token);
                setTokenParsed(kc.tokenParsed);
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
              kc.logout();
            });
        };

        // Auth status change
        kc.onAuthSuccess = () => {
          setAuthenticated(true);
          setToken(kc.token);
          setTokenParsed(kc.tokenParsed);
        };

        kc.onAuthError = () => {
          setAuthenticated(false);
          setToken(undefined);
          setTokenParsed(undefined);
        };

        kc.onAuthLogout = () => {
          setAuthenticated(false);
          setToken(undefined);
          setTokenParsed(undefined);
        };

      } catch (error) {
        console.error('Keycloak initialization failed', error);
        setInitialized(true);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    if (!AUTH_ENABLED) return; // no-op when auth disabled
    keycloak?.login();
  };

  const logout = () => {
    if (!AUTH_ENABLED) return; // no-op when auth disabled
    keycloak?.logout();
  };

  const register = () => {
    if (!AUTH_ENABLED) return; // no-op when auth disabled
    keycloak?.register();
  };

  const hasRole = (role: string): boolean => {
    if (!AUTH_ENABLED) return true;
    return tokenParsed?.realm_access?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!AUTH_ENABLED) return true;
    if (!tokenParsed?.realm_access?.roles) return false;
    return roles.some(role => tokenParsed.realm_access?.roles?.includes(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!AUTH_ENABLED) return true;
    if (!tokenParsed?.realm_access?.roles) return false;
    return roles.every(role => tokenParsed.realm_access?.roles?.includes(role));
  };

  const value: KeycloakContextType = {
    keycloak,
    initialized,
    authenticated,
    token,
    tokenParsed,
    login,
    logout,
    register,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };

  return <KeycloakContext.Provider value={value}>{children}</KeycloakContext.Provider>;
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};
