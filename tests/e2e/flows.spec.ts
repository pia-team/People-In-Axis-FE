import { test, expect } from '@playwright/test';

// Basic UI presence tests with auth disabled

test('Expense import page visible', async ({ page }) => {
  await page.goto('/expenses/new');
  await expect(page.getByRole('heading', { name: 'Import Expenses from Excel' })).toBeVisible();
});

test('TimeSheet import page visible', async ({ page }) => {
  await page.goto('/timesheets/new');
  await expect(page.getByRole('heading', { name: 'Import TimeSheets from Excel' })).toBeVisible();
});

test('Admin users page visible without auth (feature-flag off)', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
});
