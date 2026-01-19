import { Page, expect, BrowserContext } from 'playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Timeout constants for challenge tests
 */
export const CHALLENGE_TIMEOUTS = {
  pageLoad: 30000,
  formSubmit: 60000,
  challengeCreate: 90000,
  statusChange: 120000,
}

/**
 * Path to auth files
 */
export const AUTH_FILES = {
  admin: path.join(__dirname, '../../.auth/admin.json'),
  admin2: path.join(__dirname, '../../.auth/admin2.json'),
  secondary: path.join(__dirname, '../../.auth/secondary.json'),
  user: path.join(__dirname, '../../.auth/user.json'),
}

/**
 * Helper to get a date string in the format required by datetime-local input
 */
export function getDateTimeLocalValue(daysFromNow: number = 1): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setMinutes(0, 0, 0)
  return date.toISOString().slice(0, 16)
}

/**
 * Helper functions for Challenge list page
 */
export const ChallengeList = {
  /**
   * Navigate to challenges list
   */
  async goto(page: Page) {
    await page.goto('/challenges')
    await expect(page.getByTestId('challenges-list')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },

  /**
   * Click Create Challenge button (requires admin permissions)
   */
  async clickCreateChallenge(page: Page) {
    const createButton = page.getByTestId('create-challenge-button')
    await expect(createButton).toBeVisible()
    await createButton.click()
    await expect(page.getByTestId('challenge-form')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },

  /**
   * Open a specific challenge by name
   */
  async openChallengeByName(page: Page, challengeName: string) {
    const challengeItem = page.getByTestId('challenge-title').filter({ hasText: challengeName })
    await expect(challengeItem).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
    await challengeItem.click()
    await expect(page.getByTestId('challenge-details-banner')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },
}

/**
 * Helper functions for Challenge form (create/edit)
 */
export const ChallengeForm = {
  /**
   * Fill out challenge form with given data
   */
  async fillForm(page: Page, data: {
    name: string
    description?: string
    startAt?: string
    endAt?: string
    scope?: string
    hostLead?: string
    guestLead?: string
    scoringAppUser?: string
    status?: string
  }) {
    // Fill name
    await page.getByTestId('challenge-name-input').fill(data.name)

    // Fill description if provided
    if (data.description) {
      await page.getByTestId('challenge-description-input').fill(data.description)
    }

    // Fill start date if provided
    if (data.startAt) {
      await page.getByTestId('challenge-start-at-input').fill(data.startAt)
    }

    // Fill end date if provided
    if (data.endAt) {
      await page.getByTestId('challenge-end-at-input').fill(data.endAt)
    }

    // Select scope if provided
    if (data.scope) {
      await ChallengeForm.selectOption(page, 'challenge-scope-select', data.scope)
    }

    // Select host lead if provided
    if (data.hostLead) {
      await ChallengeForm.selectOption(page, 'challenge-host-lead-select', data.hostLead)
    }

    // Select guest lead if provided
    if (data.guestLead) {
      await ChallengeForm.selectOption(page, 'challenge-guest-lead-select', data.guestLead)
    }

    // Select scoring app user if provided
    if (data.scoringAppUser) {
      await ChallengeForm.selectOption(page, 'challenge-scoring-app-select', data.scoringAppUser)
    }

    // Select status if provided
    if (data.status) {
      await ChallengeForm.selectOption(page, 'challenge-status-select', data.status)
    }
  },

  /**
   * Helper to select an option from a React Select component
   */
  async selectOption(page: Page, testId: string, optionText: string) {
    const selectContainer = page.getByTestId(testId)
    await selectContainer.click()
    
    // Wait for options to be visible and click the matching one
    const option = page.getByText(optionText, { exact: true }).first()
    await expect(option).toBeVisible({ timeout: 5000 })
    await option.click()
  },

  /**
   * Submit the challenge form
   */
  async submit(page: Page) {
    const submitButton = page.getByTestId('challenge-submit-button')
    await expect(submitButton).toBeEnabled()
    await submitButton.click()
  },

  /**
   * Wait for form submission to complete successfully
   */
  async waitForSubmitSuccess(page: Page, isCreate: boolean = true) {
    const successMessage = isCreate
      ? 'Challenge has been created'
      : 'Challenge successfully edited'
    await expect(page.getByText(successMessage)).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.challengeCreate,
    })
  },
}

/**
 * Helper functions for Challenge details page
 */
export const ChallengeDetails = {
  /**
   * Verify challenge name is displayed
   */
  async verifyChallengeName(page: Page, name: string) {
    await expect(page.getByTestId('challenge-name')).toHaveText(name)
  },

  /**
   * Click Settings button (requires admin permissions)
   */
  async clickSettings(page: Page) {
    await page.getByTestId('challenge-settings-button').click()
    await expect(page.getByTestId('challenge-form')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },

  /**
   * Click Join Challenge button
   */
  async clickJoinChallenge(page: Page) {
    const joinButton = page.getByTestId('challenge-join-button')
    await expect(joinButton).toBeVisible()
    await joinButton.click()
    // After join, user is redirected to Rails join flow
    // which will redirect back to challenge details
  },

  /**
   * Verify user has joined the challenge
   */
  async verifyJoined(page: Page) {
    await expect(page.getByTestId('challenge-joined-message')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },

  /**
   * Click Submit Challenge Entry button
   */
  async clickSubmitEntry(page: Page) {
    await page.getByTestId('challenge-submit-entry-button').click()
    await expect(page.getByTestId('submission-form')).toBeVisible({
      timeout: CHALLENGE_TIMEOUTS.pageLoad,
    })
  },

  /**
   * Navigate to My Entries tab
   */
  async goToMyEntries(page: Page) {
    await page.getByTestId('challenge-nav-my-entries').click()
  },

  /**
   * Navigate to Submissions tab
   */
  async goToSubmissions(page: Page) {
    await page.getByTestId('challenge-nav-submissions').click()
  },
}

/**
 * Helper functions for Submission form
 */
export const SubmissionForm = {
  /**
   * Fill submission form
   */
  async fillForm(page: Page, data: {
    name: string
    description?: string
    instanceType?: string
  }) {
    await page.getByTestId('submission-name-input').clear()
    await page.getByTestId('submission-name-input').fill(data.name)

    if (data.description) {
      await page.getByTestId('submission-description-input').fill(data.description)
    }

    if (data.instanceType) {
      await page.getByTestId('submission-instance-type-select').click()
      await page.getByText(data.instanceType, { exact: false }).first().click()
    }
  },

  /**
   * Submit the entry
   */
  async submit(page: Page) {
    await page.getByTestId('submission-submit-button').click()
  },

  /**
   * Cancel submission
   */
  async cancel(page: Page) {
    await page.getByTestId('submission-cancel-button').click()
  },
}

/**
 * Context switching helpers for multi-user tests
 */
export const UserContext = {
  /**
   * Switch to admin user context by loading admin auth state
   */
  async switchToAdmin(context: BrowserContext) {
    await context.clearCookies()
    await context.addCookies(
      (await import(AUTH_FILES.admin)).cookies || [],
    )
  },

  /**
   * Switch to secondary user context by loading secondary auth state
   */
  async switchToSecondary(context: BrowserContext) {
    await context.clearCookies()
    await context.addCookies(
      (await import(AUTH_FILES.secondary)).cookies || [],
    )
  },

  /**
   * Get a new page with a specific user's auth state
   * This is the preferred method for switching users in tests
   */
  async getPageWithAuth(browser: any, authFile: string): Promise<{ context: BrowserContext; page: Page }> {
    const context = await browser.newContext({
      storageState: authFile,
    })
    const page = await context.newPage()
    return { context, page }
  },
}

/**
 * Generate a unique challenge name for tests
 */
export function generateChallengeName(prefix: string = 'E2E Challenge'): string {
  const testId = Date.now().toString(36)
  return `${prefix} ${testId}`
}

/**
 * Wait for challenge API response
 */
export async function waitForChallengeApi(page: Page, method: 'POST' | 'PUT' = 'POST') {
  return page.waitForResponse(
    response =>
      response.url().includes('/api/v2/challenges') &&
      response.request().method() === method,
    { timeout: CHALLENGE_TIMEOUTS.challengeCreate },
  )
}
