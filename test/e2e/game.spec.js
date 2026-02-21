import { test, expect } from '@playwright/test';

test.describe('SkiFree.js', () => {
	test('loads and renders the game canvas', async ({ page }) => {
		await page.goto('/');

		const canvas = page.locator('#skifree-canvas');
		await expect(canvas).toBeVisible();
	});

	test('canvas fills the viewport', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 768 });
		await page.goto('/');

		const canvas = page.locator('#skifree-canvas');
		const box = await canvas.boundingBox();

		expect(box.width).toBe(1024);
		expect(box.height).toBe(768);
	});

	test('game loop is running — canvas is not blank after a moment', async ({ page }) => {
		await page.goto('/');

		// Wait for images to load and a few game frames to render
		await page.waitForTimeout(500);

		const hasPixels = await page.evaluate(() => {
			const canvas = document.getElementById('skifree-canvas');
			const ctx = canvas.getContext('2d');
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
			// Check that at least one non-transparent pixel exists
			for (let i = 3; i < data.length; i += 4) {
				if (data[i] > 0) return true;
			}
			return false;
		});

		expect(hasPixels).toBe(true);
	});

	test('keyboard controls do not throw errors', async ({ page }) => {
		const errors = [];
		page.on('pageerror', err => errors.push(err.message));

		await page.goto('/');
		await page.waitForTimeout(300);

		// Focus the canvas and send key events
		await page.locator('#skifree-canvas').click();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('KeyF');
		await page.keyboard.press('Space');

		expect(errors).toHaveLength(0);
	});
});
