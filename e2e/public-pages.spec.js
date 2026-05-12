import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('about shows main heading', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('doctors page shows main heading', async ({ page }) => {
    await page.goto('/doctors');
    await expect(page).toHaveURL(/\/doctors$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('contact page shows main heading', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('register page shows patient signup title', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('إنشاء حساب مريض')).toBeVisible();
  });

  test('forgot-password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByText('نسيت كلمة المرور؟')).toBeVisible();
  });
});
