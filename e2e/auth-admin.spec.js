import { test, expect } from '@playwright/test';

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe('Admin login (optional)', () => {
  test.beforeEach(() => {
    test.skip(
      !email || !password,
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD and ensure the API (VITE_API_BASE_URL) is running for this test.'
    );
  });

  test('logs in and lands on admin area', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'مدير' }).click();
    await page.getByPlaceholder('أدخل البريد الإلكتروني').fill(email);
    await page.locator('form input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'دخول النظام' }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
  });
});
