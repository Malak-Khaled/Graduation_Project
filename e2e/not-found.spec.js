import { test, expect } from '@playwright/test';

test.describe('Not found', () => {
  test('unknown path shows 404', async ({ page }) => {
    await page.goto('/__e2e_route_not_defined_404__');
    await expect(page.getByText('404').first()).toBeVisible();
  });
});
