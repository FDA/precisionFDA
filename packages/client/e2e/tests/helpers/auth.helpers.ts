import { Page, expect } from 'playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Configuration for a test user
 */
export interface UserConfig {
  /** Unique identifier for this user (e.g., 'admin', 'secondary') */
  id: string
  /** Human-readable label for log messages */
  label: string
  /** Environment variable name for username */
  usernameEnvVar: string
  /** Environment variable name for password */
  passwordEnvVar: string
  /** Path to the auth state file (relative to .auth directory) */
  authFileName: string
  /** Additional context for error messages */
  description?: string
}

/**
 * Get the path to an auth state file
 */
export function getAuthFilePath(authFileName: string): string {
  return path.join(__dirname, '../../.auth', authFileName)
}

/**
 * Check if the stored auth state is still valid by checking session expiration
 */
export function isAuthStateValid(authFile: string, userLabel: string): boolean {
  try {
    // Check if auth file exists
    if (!fs.existsSync(authFile)) {
      console.log(`🔑 No ${userLabel} auth file found, need to authenticate`)
      return false
    }

    // Check if file is not empty/invalid
    const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
    if (!authData.cookies || authData.cookies.length === 0) {
      console.log(`🔑 ${userLabel} auth file has no cookies, need to authenticate`)
      return false
    }

    // Find the sessionExpiredAt cookie
    const sessionExpiredAtCookie = authData.cookies.find(
      (cookie: { name: string }) => cookie.name === 'sessionExpiredAt',
    )

    if (!sessionExpiredAtCookie) {
      console.log(`🔑 No sessionExpiredAt cookie found for ${userLabel}, need to authenticate`)
      return false
    }

    // The value is a Unix timestamp in seconds
    const expirationTime = parseInt(sessionExpiredAtCookie.value, 10)
    const now = Math.floor(Date.now() / 1000)

    // Add a 60-second buffer to avoid edge cases
    if (expirationTime <= now + 60) {
      console.log(`🔑 ${userLabel} session expired or expiring soon, need to re-authenticate`)
      return false
    }

    const remainingMinutes = Math.floor((expirationTime - now) / 60)
    console.log(`✅ Valid ${userLabel} session found (expires in ${remainingMinutes} minutes), skipping login`)
    return true
  } catch (error) {
    console.log(`🔑 Error checking ${userLabel} auth state, will re-authenticate:`, error)
    return false
  }
}

/**
 * Perform the DNAnexus OAuth login flow
 */
export async function performDNAnexusLogin(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  const baseURL = process.env.BASE_URL || 'https://localhost:3000'

  // Clear any stale cookies before fresh login
  await page.context().clearCookies()

  // Navigate to the login page
  await page.goto(`${baseURL}/login`)

  // Wait for redirect to DNAnexus auth
  await page.waitForURL(/auth\.dnanexus\.com|staging\.dnanexus\.com/, {
    timeout: 10000,
  })

  // Fill in the DNAnexus login form - username page
  await page.fill('input[name="username"], #username', username)
  await page.click('button[type="submit"], input[type="submit"], #submit')

  // Wait for password page (some auth flows have separate username/password screens)
  await page.waitForURL(/auth\.dnanexus\.com|staging\.dnanexus\.com/, {
    timeout: 10000,
  })

  // Fill in password and submit
  await page.fill('input[type="password"], #password', password)
  await page.click('button[type="submit"], input[type="submit"], #submit')

  // Click the "Grant access" button on the OAuth consent page
  await page.click('button:has-text("Grant access"), input[value="Grant access"]', {
    timeout: 10000,
  })

  // Wait for redirect back to precisionFDA
  await page.waitForURL(new RegExp(`^${baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), {
    timeout: 120000,
  })

  // Check for session limit error
  const sessionLimitError = page.getByText(/reached a limit for login|only \d+ active sessions/i)
  if (await sessionLimitError.isVisible({ timeout: 2000 }).catch(() => false)) {
    throw new Error(
      'DNAnexus session limit reached. You have too many active sessions.\n' +
      'Please log out from some existing sessions at https://staging.dnanexus.com or wait for them to expire.',
    )
  }

  // Verify we're logged in by checking for user-specific elements
  await expect(page.locator('[data-testid="user-context-menu"]')).toBeVisible({
    timeout: 10000,
  })
}

/**
 * Authenticate a user and save the session state
 * 
 * This is the main entry point for auth setup files.
 * It checks for a valid existing session and only performs login if needed.
 */
export async function authenticateUser(page: Page, config: UserConfig): Promise<void> {
  const authFile = getAuthFilePath(config.authFileName)
  const username = process.env[config.usernameEnvVar]
  const password = process.env[config.passwordEnvVar]

  if (!username || !password) {
    const descriptionLine = config.description ? `\n${config.description}.` : ''
    throw new Error(
      `${config.usernameEnvVar} and ${config.passwordEnvVar} must be set in .env.e2e\n` +
      `See .env.e2e.example for reference.${descriptionLine}`,
    )
  }

  // Check if we already have a valid session
  if (isAuthStateValid(authFile, config.label)) {
    return
  }

  // Perform the login flow
  await performDNAnexusLogin(page, username, password)

  // Save the authentication state
  await page.context().storageState({ path: authFile })

  console.log(`✅ ${config.label} authentication successful, state saved to:`, authFile)
}

/**
 * Helper to get credentials from a user config for manual login flows
 */
export function getCredentials(config: UserConfig): { username: string; password: string } {
  const username = process.env[config.usernameEnvVar]
  const password = process.env[config.passwordEnvVar]

  if (!username || !password) {
    throw new Error(
      `${config.usernameEnvVar} and ${config.passwordEnvVar} must be set in .env.e2e`,
    )
  }

  return { username, password }
}
