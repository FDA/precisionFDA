import { defineConfig, devices } from 'playwright/test'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.e2e
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') })

/**
 * Playwright E2E Configuration for precisionFDA
 * 
 * This configuration is for running E2E tests against a local Docker Compose environment.
 * 
 * Prerequisites:
 * 1. Start the Docker Compose environment: `docker compose -f docker/dev.docker-compose.yml up`
 * 2. Create a `.env.e2e` file in the e2e directory with test credentials:
 *    - TEST_USER_EMAIL: Email for the test user
 *    - TEST_USER_PASSWORD: Password for the test user
 *    - BASE_URL: Base URL for the application (default: https://localhost:3000)
 * 
 * Usage:
 *   pnpm run test:e2e
 *   pnpm run test:e2e:ui   # With Playwright UI
 */

const baseURL = process.env.BASE_URL || 'https://localhost:3000'

export default defineConfig({
  testDir: './tests',
  
  // Enable parallel execution - tests can opt-out with test.describe.configure({ mode: 'serial' })
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Run tests in parallel with multiple workers
  workers: process.env.CI ? 2 : 2,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    baseURL,
    
    // Ignore HTTPS certificate errors for local development
    ignoreHTTPSErrors: true,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'off',
    
    // Launch browser options
    launchOptions: {
      args: [
        // Disable animations for faster, more reliable tests
        '--force-prefers-reduced-motion',
      ],
    },
  },
  
  // Configure projects for major browsers
  projects: [
    // Setup project for authentication - primary user
    {
      name: 'setup-primary',
      testMatch: /auth-primary\.setup\.ts$/,
    },

    // Setup project for admin user authentication
    {
      name: 'setup-admin',
      testMatch: /auth-admin\.setup\.ts$/,
    },

    // Setup project for secondary user authentication
    {
      name: 'setup-secondary',
      testMatch: /auth-secondary\.setup\.ts$/,
    },

    // Setup project for admin2 user authentication (scoring app owner)
    {
      name: 'setup-admin2',
      testMatch: /auth-admin2\.setup\.ts$/,
    },
    
    // Authenticated tests (regular user)
    {
      name: 'chromium',
      testMatch: /^(?!.*logged-out)(?!.*challenges-flow).*\.spec\.ts$/,
      use: { 
        ...devices['Desktop Chrome'],
        // Use stored auth state (relative to client package root)
        storageState: path.join(__dirname, '.auth/primary.json'),
      },
      dependencies: ['setup-primary'],
    },

    // Challenge flow tests (uses admin + admin2 + secondary user)
    {
      name: 'chromium-challenges',
      testMatch: /challenges-flow\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // Start with admin user session - tests will switch between users as needed
        storageState: path.join(__dirname, '.auth/admin.json'),
      },
      dependencies: ['setup-admin', 'setup-admin2', 'setup-secondary'],
    },
  ],
  
  // Global timeout for each test
  timeout: 45000,
  
  // Expect timeout
  expect: {
    timeout: 30000,
  },
  
  // Output folder for test artifacts
  outputDir: 'test-results/',
})
