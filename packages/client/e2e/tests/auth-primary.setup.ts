import { test as setup } from 'playwright/test'
import { authenticateUser, UserConfig } from './helpers/auth.helpers'

const config: UserConfig = {
  id: 'primary',
  label: 'primary',
  usernameEnvVar: 'TEST_USER_USERNAME',
  passwordEnvVar: 'TEST_USER_PASSWORD',
  authFileName: 'primary.json',
  description: 'Primary test user',
}

/**
 * Primary User Authentication Setup
 * 
 * Authenticates the primary test user and saves session state for reuse.
 */
setup('authenticate primary', async ({ page }) => {
  await authenticateUser(page, config)
})
