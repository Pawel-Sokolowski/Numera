import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Office Management System/);
});

test('login page is accessible', async ({ page }) => {
  await page.goto('/');
  // Add more specific tests based on your application
  const heading = page.locator('h1, h2').first();
  await expect(heading).toBeVisible();
});
