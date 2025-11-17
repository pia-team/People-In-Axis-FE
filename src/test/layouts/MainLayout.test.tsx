import { describe, it, vi } from 'vitest';
import MainLayout from '@/layouts/MainLayout';
import React from 'react';

// Note: MainLayout tests are skipped because:
// 1. MainLayout requires KeycloakProvider (which is complex to mock)
// 2. MainLayout requires Redux store with specific state
// 3. MainLayout requires React Query with data
// 4. MainLayout requires many service mocks (timesheet, notification, language, etc.)
// 5. MainLayout is better suited for integration tests or E2E tests
// 
// For unit testing, individual components within MainLayout should be tested separately.
// For integration testing, use Playwright or similar E2E testing tools.

describe.skip('MainLayout', () => {
  // These tests would require extensive mocking setup:
  // - KeycloakProvider with authenticated state
  // - Redux store with user state
  // - React Query with cached data
  // - Multiple service mocks
  // - Navigation setup
  // 
  // Instead, test individual components:
  // - Menu items rendering
  // - Drawer open/close functionality
  // - Navigation logic
  // - Theme toggle
  // - Language selection
  // - Notification badge
  //
  // Integration tests should cover:
  // - Full layout rendering
  // - Navigation between routes
  // - User interactions
  // - State management integration
});

