import { test, expect } from '@playwright/test';

// Assumes build-time VITE_AUTH_ENABLED=false

test('404 page renders', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.getByText('404 - Page Not Found')).toBeVisible();
});

test('Reports page renders', async ({ page }) => {
  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
});
