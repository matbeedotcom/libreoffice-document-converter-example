import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Document Converter/);
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

test('enters batch mode when multiple files are dropped', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to be ready
    await expect(page.getByText('Drop your document here')).toBeVisible();

    // Create mock files using DataTransfer
    const dropZone = page.locator('.drop-zone');

    // Simulate multiple file drop using evaluate
    await dropZone.evaluate(async (element) => {
        // Create mock files
        const file1 = new File(['content1'], 'test1.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const file2 = new File(['content2'], 'test2.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // Create DataTransfer with files
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file1);
        dataTransfer.items.add(file2);

        // Dispatch drop event
        const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer,
        });
        element.dispatchEvent(dropEvent);
    });

    // Should show batch panel
    await expect(page.locator('.batch-panel')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Batch Conversion')).toBeVisible();
});

test('batch panel shows file list with statuses', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Drop your document here')).toBeVisible();

    const dropZone = page.locator('.drop-zone');

    await dropZone.evaluate(async (element) => {
        const file1 = new File(['content1'], 'doc1.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const file2 = new File(['content2'], 'doc2.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const file3 = new File(['content3'], 'unsupported.xyz', {
            type: 'application/octet-stream',
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file1);
        dataTransfer.items.add(file2);
        dataTransfer.items.add(file3);

        const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer,
        });
        element.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.batch-panel')).toBeVisible({ timeout: 5000 });

    // Check files are listed
    await expect(page.getByText('doc1.docx')).toBeVisible();
    await expect(page.getByText('doc2.xlsx')).toBeVisible();
    await expect(page.getByText('unsupported.xyz')).toBeVisible();

    // Check unsupported status
    await expect(page.getByText('Unsupported', { exact: true })).toBeVisible();
});

test('batch panel can be cancelled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Drop your document here')).toBeVisible();

    const dropZone = page.locator('.drop-zone');

    await dropZone.evaluate(async (element) => {
        const file1 = new File(['content1'], 'test1.docx', { type: 'application/octet-stream' });
        const file2 = new File(['content2'], 'test2.docx', { type: 'application/octet-stream' });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file1);
        dataTransfer.items.add(file2);

        const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer,
        });
        element.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.batch-panel')).toBeVisible({ timeout: 5000 });

    // Click cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Panel should close
    await expect(page.locator('.batch-panel')).not.toBeVisible();
});
