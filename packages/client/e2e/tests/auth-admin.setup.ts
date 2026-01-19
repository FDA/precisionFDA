import { test as setup } from 'playwright/test'
import { authenticateUser, UserConfig } from './helpers/auth.helpers'

const config: UserConfig = {
  id: 'admin',
  label: 'admin',
  usernameEnvVar: 'TEST_ADMIN_USERNAME',
  passwordEnvVar: 'TEST_ADMIN_PASSWORD',
  authFileName: 'admin.json',
  description: 'Admin user with can_create_challenges permission',
}

/**
 * Admin User Authentication Setup
 * 
 * Authenticates an admin user with challenge creation permissions.
 */
setup('authenticate admin', async ({ page }) => {
  await authenticateUser(page, config)
})
