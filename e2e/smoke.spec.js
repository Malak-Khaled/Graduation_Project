import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/graduation/i);
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });
});
