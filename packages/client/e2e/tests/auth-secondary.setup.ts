import { test as setup } from 'playwright/test'
import { authenticateUser, UserConfig } from './helpers/auth.helpers'

const config: UserConfig = {
  id: 'secondary',
  label: 'secondary',
  usernameEnvVar: 'TEST_SECONDARY_USERNAME',
  passwordEnvVar: 'TEST_SECONDARY_PASSWORD',
  authFileName: 'secondary.json',
  description: 'Secondary user for multi-user flow testing',
}

/**
 * Secondary User Authentication Setup
 * 
 * Authenticates a secondary user for multi-user flow testing
 * (e.g., joining challenges created by admin).
 */
setup('authenticate secondary', async ({ page }) => {
  await authenticateUser(page, config)
})
