import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Secure and Offline Document Conversion/);
});

test('shows upload area', async ({ page }) => {
    await page.goto('/');

    // Check for the upload area text
    await expect(page.getByText('Drop your document here')).toBeVisible();
    await expect(page.getByText('or click to browse files')).toBeVisible();
});

test('loads converter resources', async ({ page }) => {
    // Monitor network requests
    const workerPromise = page.waitForResponse(response =>
        response.url().includes('browser.worker.global.js') && response.status() === 200
    );

    // Navigate to page
    await page.goto('/');

    // Wait for worker to load
    await workerPromise;
});
