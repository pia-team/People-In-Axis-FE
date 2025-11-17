import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/utils';
import { useKeycloak } from '@/hooks/useKeycloak';
import { KeycloakProvider } from '@/providers/KeycloakProvider';
import React from 'react';
import * as keycloakJs from 'keycloak-js';

// Mock keycloak-js
vi.mock('keycloak-js', () => {
  const mockKeycloak = {
    init: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    token: 'mock-token',
    tokenParsed: {
      realm_access: {
        roles: ['user', 'admin'],
      },
    },
    onTokenExpired: null,
    onAuthSuccess: null,
    onAuthError: null,
    onAuthLogout: null,
    updateToken: vi.fn(),
  };

  return {
    default: vi.fn(() => mockKeycloak),
  };
});

// Mock feature flags
vi.mock('@/config/featureFlags', () => ({
  AUTH_ENABLED: false, // Disable auth for testing
}));

// Mock Sentry
global.Sentry = {
  captureException: vi.fn(),
} as any;

describe('useKeycloak', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.__kcInitDone
    (window as any).__kcInitDone = undefined;
  });

  it('returns keycloak context when auth is disabled', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
      expect(result.current.authenticated).toBe(true);
      expect(result.current.keycloak).toBeNull();
      expect(result.current.token).toBeUndefined();
    });
  });

  it('provides login function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    // When auth is disabled, login should be a no-op
    expect(() => result.current.login()).not.toThrow();
  });

  it('provides logout function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });

    // When auth is disabled, logout should be a no-op
    expect(() => result.current.logout()).not.toThrow();
  });

  it('provides register function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.register).toBeDefined();
      expect(typeof result.current.register).toBe('function');
    });

    // When auth is disabled, register should be a no-op
    expect(() => result.current.register()).not.toThrow();
  });

  it('provides hasRole function that returns true when auth is disabled', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasRole).toBeDefined();
      expect(typeof result.current.hasRole).toBe('function');
    });

    // When auth is disabled, hasRole should return true
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('nonexistent')).toBe(true);
  });

  it('provides hasAnyRole function that returns true when auth is disabled', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasAnyRole).toBeDefined();
      expect(typeof result.current.hasAnyRole).toBe('function');
    });

    // When auth is disabled, hasAnyRole should return true
    expect(result.current.hasAnyRole(['admin', 'user'])).toBe(true);
    expect(result.current.hasAnyRole(['nonexistent'])).toBe(true);
  });

  it('provides hasAllRoles function that returns true when auth is disabled', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeycloakProvider>{children}</KeycloakProvider>
    );

    const { result } = renderHook(() => useKeycloak(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasAllRoles).toBeDefined();
      expect(typeof result.current.hasAllRoles).toBe('function');
    });

    // When auth is disabled, hasAllRoles should return true
    expect(result.current.hasAllRoles(['admin', 'user'])).toBe(true);
    expect(result.current.hasAllRoles(['nonexistent'])).toBe(true);
  });

  // Note: Testing error throwing outside provider is complex with our test setup
  // as AllTheProviders includes KeycloakProvider. This test is skipped for now.
  it.skip('throws error when used outside KeycloakProvider', () => {
    // This test would require a separate render function without KeycloakProvider
    // which is not easily achievable with our current test setup
  });
});

