import { test, expect } from '@playwright/test';

test.describe('Login UI', () => {
  test('switching to admin shows admin title', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'مدير' }).click();
    await expect(page.getByText('تسجيل دخول المدير')).toBeVisible();
    await expect(page.getByPlaceholder('أدخل البريد الإلكتروني')).toBeVisible();
  });

  test('admin: valid email and short password shows validation toast', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'مدير' }).click();
    await page.getByPlaceholder('أدخل البريد الإلكتروني').fill('admin@test.com');
    await page.locator('form input[type="password"]').fill('12');
    await page.getByRole('button', { name: 'دخول النظام' }).click();
    await expect(page.getByText('كلمة المرور يجب أن تكون 6 أحرف على الأقل')).toBeVisible();
  });

  test('patient: invalid identifier shows validation toast', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'مريض', exact: true }).click();
    await page.getByPlaceholder(/example@mail\.com/).fill('not-valid-id');
    await page.locator('form input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'دخول المريض' }).click();
    await expect(
      page.getByText('أدخل بريد إلكتروني صحيح أو رقم هاتف مصري صحيح')
    ).toBeVisible();
  });

  test('forgot password link navigates', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'نسيت كلمة المرور؟' }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
