import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('blog page renders', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: /blog/i }).first()).toBeVisible();
});

test('login form submits and shows error for bad credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('does-not-exist@tsgweb.com');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5_000 });
});
