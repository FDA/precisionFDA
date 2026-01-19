import { test as setup } from 'playwright/test'
import { authenticateUser, UserConfig } from './helpers/auth.helpers'

const config: UserConfig = {
  id: 'admin2',
  label: 'admin2',
  usernameEnvVar: 'TEST_ADMIN2_USERNAME',
  passwordEnvVar: 'TEST_ADMIN2_PASSWORD',
  authFileName: 'admin2.json',
  description: 'Admin user who can own scoring apps for challenges',
}

/**
 * Admin2 User Authentication Setup
 * 
 * Authenticates a second admin user who can act as the scoring app owner.
 */
setup('authenticate admin2', async ({ page }) => {
  await authenticateUser(page, config)
})
