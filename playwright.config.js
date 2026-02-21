import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './test/e2e',
	use: {
		baseURL: 'http://localhost:4173',
	},
	webServer: {
		command: 'npx serve . --listen 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
	},
});
