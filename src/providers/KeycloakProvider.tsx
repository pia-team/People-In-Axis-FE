import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Keycloak, { KeycloakInstance, KeycloakTokenParsed } from "keycloak-js";
import { AUTH_ENABLED } from "@/config/featureFlags";
import { setAuthToken } from "@/services/api";

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

const KeycloakContext = createContext<KeycloakContextType | undefined>(
  undefined
);

interface KeycloakProviderProps {
  children: React.ReactNode;
}

const computedKeycloakUrl = ((): string => {
  const envUrl = import.meta.env.VITE_KEYCLOAK_URL as string | undefined;
  if (envUrl && envUrl.length > 0) return envUrl;
  return import.meta.env.DEV ? `${window.location.origin}/keycloak` : "https://diam.dnext-pia.com";
})();

const keycloakConfig = {
  url: computedKeycloakUrl,
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "orbitant-realm",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "orbitant-ui-client",
};

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({
  children,
}) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [tokenParsed, setTokenParsed] = useState<
    KeycloakTokenParsed | undefined
  >();
  const didInitRef = useRef(false);
  type WindowWithKc = Window & { __kcInitDone?: boolean };

  useEffect(() => {
    // If auth is disabled, short-circuit and expose a permissive context
    if (!AUTH_ENABLED) {
      setInitialized(true);
      setAuthenticated(true);
      setToken(undefined);
      setAuthToken(null);
      setTokenParsed(undefined);
      return;
    }

    const initKeycloak = async () => {
      try {
        const kc = new Keycloak(keycloakConfig);

        const redirectUriEnv = import.meta.env.VITE_KEYCLOAK_REDIRECT_URI as string | undefined;
        const redirectPath = (import.meta.env.VITE_KEYCLOAK_REDIRECT_PATH as string | undefined) ?? '/dashboard';
        const redirectUri = redirectUriEnv && redirectUriEnv.length > 0
          ? redirectUriEnv
          : new URL(redirectPath, window.location.origin).toString();

        const auth = await kc.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          responseMode: 'query',
          flow: 'standard',
          redirectUri,
        });

        setKeycloak(kc);
        setInitialized(true);
        setAuthenticated(auth);
        setToken(kc.token);
        setTokenParsed(kc.tokenParsed);
        setAuthToken(kc.token ?? null);

        const urlNow = new URL(window.location.href);
        if (urlNow.hash && (urlNow.hash.includes('code=') || urlNow.hash.includes('state=') || urlNow.hash.includes('session_state='))) {
          urlNow.hash = '';
        }
        ['code', 'state', 'session_state'].forEach((p) => urlNow.searchParams.delete(p));
        window.history.replaceState({}, document.title, urlNow.toString());

        // Token refresh
        kc.onTokenExpired = () => {
          kc.updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setToken(kc.token);
                setTokenParsed(kc.tokenParsed);
                setAuthToken(kc.token ?? null);
              }
            })
            .catch((error) => {
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.error("Failed to refresh token", error);
              }
              // Log to Sentry
              try {
                Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
                  tags: { component: 'KeycloakProvider', action: 'tokenRefresh' }
                });
              } catch {
                // Sentry not available
              }
              kc.logout();
            });
        };

        // Auth status change
        kc.onAuthSuccess = () => {
          setAuthenticated(true);
          setToken(kc.token);
          setTokenParsed(kc.tokenParsed);
          setAuthToken(kc.token ?? null);
        };

        kc.onAuthError = () => {
          setAuthenticated(false);
          setToken(undefined);
          setAuthToken(null);
          setTokenParsed(undefined);
        };

        kc.onAuthLogout = () => {
          setAuthenticated(false);
          setToken(undefined);
          setAuthToken(null);
          setTokenParsed(undefined);
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Keycloak initialization failed", error);
        }
        // Log to Sentry
        try {
          Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
            tags: { component: 'KeycloakProvider', action: 'initialization' }
          });
        } catch {
          // Sentry not available
        }
        setInitialized(true);
      }
    };

    if (didInitRef.current) return;
    didInitRef.current = true;
    const w = window as WindowWithKc;
    if (w.__kcInitDone) return;
    w.__kcInitDone = true;
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
    return roles.some((role) =>
      tokenParsed.realm_access?.roles?.includes(role)
    );
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!AUTH_ENABLED) return true;
    if (!tokenParsed?.realm_access?.roles) return false;
    return roles.every((role) =>
      tokenParsed.realm_access?.roles?.includes(role)
    );
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

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};
