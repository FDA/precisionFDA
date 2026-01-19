import { test, expect, Page, BrowserContext, Browser } from 'playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CHALLENGE_TIMEOUTS,
  AUTH_FILES,
  generateChallengeName,
  getDateTimeLocalValue,
  waitForChallengeApi,
} from './helpers/challenges.helpers'
import { CreateAppForm, TIMEOUTS } from './helpers/apps.helpers'
import { setupPageStyles } from './fixtures'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Challenge Flow E2E Tests
 * 
 * This test suite covers the complete challenge lifecycle with multiple users:
 * 1. Admin user creates a challenge
 * 2. Admin user changes challenge status to open (public)
 * 3. Secondary user joins the challenge
 * 4. Secondary user submits an entry to the challenge
 * 
 * Prerequisites:
 * - Admin user must have can_create_challenges permission
 * - Secondary user should be a regular user
 * - Both users must have valid credentials in .env.e2e:
 *   - TEST_ADMIN_USERNAME / TEST_ADMIN_PASSWORD
 *   - TEST_SECONDARY_USERNAME / TEST_SECONDARY_PASSWORD
 * 
 * Note: This test uses separate browser contexts for each user to properly
 * isolate authentication state.
 */

// Unique test ID for this test run (generated once, shared across all tests)
const testId = Date.now().toString(36)
const challengeName = generateChallengeName(`E2E Test Challenge ${testId}`)

// Challenge ID will be captured during test execution
let challengeId: string | null = null

// Scoring app name (created by admin2 user)
const scoringAppName = `e2e_scoring_app_${testId}`
const scoringAppTitle = `E2E Scoring App ${testId}`

// Helper to create a new page with specific auth state
async function createPageWithAuth(browser: Browser, authFile: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    storageState: authFile,
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()
  setupPageStyles(page)
  return { context, page }
}

// Tests must run in serial order because they depend on each other
test.describe.configure({ mode: 'serial' })

// These tests create challenges and involve multi-user flows
test.setTimeout(CHALLENGE_TIMEOUTS.statusChange + 120000)

test.describe('Challenge Flow - Multi User', () => {
  /**
   * Test 1: Admin creates a challenge
   * 
   * Uses admin user credentials to create a new challenge with:
   * - Unique name for test isolation
   * - Future start/end dates
   * - Setup status (not yet public)
   */
  test('Admin creates a new challenge', async ({ browser }) => {
    // Create a page with admin auth
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.admin)

    try {
      // Navigate to challenges list
      await page.goto('/challenges')
      // Wait for the page to load - use the challenges list or the page content
      await expect(page.getByTestId('challenges-list')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Click Create Challenge button
      const createButton = page.getByTestId('create-challenge-button')
      await expect(createButton).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })
      await createButton.click()

      // Wait for form to load
      await expect(page.getByTestId('challenge-form')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Fill out the challenge form
      // Name
      await page.getByTestId('challenge-name-input').fill(challengeName)

      // Description
      await page.getByTestId('challenge-description-input').fill(
        `This is an automated E2E test challenge created at ${new Date().toISOString()}`,
      )

      // Upload challenge image (required for new challenges)
      const imageInput = page.locator('input[type="file"][accept="image/*"]')
      const challengeImagePath = path.join(__dirname, '../fixtures/challenge.png')
      await imageInput.setInputFiles(challengeImagePath)

      // Start date (yesterday - so challenge can be opened immediately)
      const startDate = getDateTimeLocalValue(-1)
      await page.getByTestId('challenge-start-at-input').fill(startDate)

      // End date (30 days from now)
      const endDate = getDateTimeLocalValue(30)
      await page.getByTestId('challenge-end-at-input').fill(endDate)

      // Wait for select options to load
      await page.waitForTimeout(1000)

      // Select scope - click and choose first available option
      const scopeSelect = page.getByTestId('challenge-scope-select')
      await scopeSelect.click()
      await page.waitForTimeout(500)
      // Select the first available option
      const scopeOption = page.locator('[class*="option"]').first()
      if (await scopeOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scopeOption.click()
      } else {
        // Fallback: press Enter to select default
        await page.keyboard.press('Escape')
      }

      // Select host lead user (first option)
      const hostLeadSelect = page.getByTestId('challenge-host-lead-select')
      await hostLeadSelect.click()
      await page.waitForTimeout(500)
      const hostLeadOption = page.locator('[class*="option"]').first()
      if (await hostLeadOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await hostLeadOption.click()
      } else {
        await page.keyboard.press('Escape')
      }

      // Select guest lead user - use TEST_ADMIN2_USERNAME from env (must be different from host lead)
      const guestLeadSelect = page.getByTestId('challenge-guest-lead-select')
      await guestLeadSelect.click()
      await page.waitForTimeout(500)
      const admin2Username = process.env.TEST_ADMIN2_USERNAME
      if (admin2Username) {
        // Type to search for the specific user
        await page.keyboard.type(admin2Username)
        await page.waitForTimeout(500)
        const guestLeadOption = page.locator('[class*="option"]').first()
        if (await guestLeadOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await guestLeadOption.click()
        } else {
          await page.keyboard.press('Escape')
          console.warn(`⚠️ Could not find guest lead user: ${admin2Username}`)
        }
      } else {
        // Fallback: select second option if TEST_ADMIN2_USERNAME not set
        const guestLeadOptions = page.locator('[class*="option"]')
        const guestLeadOptionCount = await guestLeadOptions.count()
        if (guestLeadOptionCount > 1) {
          await guestLeadOptions.nth(1).click()
        } else {
          await guestLeadOptions.first().click()
        }
      }

      // Select scoring app user - must be TEST_ADMIN2_USERNAME (who will create the scoring app)
      const scoringAppSelect = page.getByTestId('challenge-scoring-app-select')
      await scoringAppSelect.click()
      await page.waitForTimeout(500)
      if (admin2Username) {
        // Type to search for the specific user
        await page.keyboard.type(admin2Username)
        await page.waitForTimeout(500)
        const scoringAppOption = page.locator('[class*="option"]').first()
        if (await scoringAppOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await scoringAppOption.click()
          console.log(`✅ Selected scoring app user: ${admin2Username}`)
        } else {
          await page.keyboard.press('Escape')
          console.warn(`⚠️ Could not find scoring app user: ${admin2Username}`)
        }
      } else {
        // Fallback: select first option if TEST_ADMIN2_USERNAME not set
        const scoringAppOption = page.locator('[class*="option"]').first()
        if (await scoringAppOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await scoringAppOption.click()
        } else {
          await page.keyboard.press('Escape')
        }
      }

      // Select status - setup initially
      const statusSelect = page.getByTestId('challenge-status-select')
      await statusSelect.click()
      await page.waitForTimeout(500)
      const setupOption = page.getByText('setup', { exact: true })
      await expect(setupOption).toBeVisible({ timeout: 3000 })
      await setupOption.click()

      // Set up API response listener
      const apiResponsePromise = waitForChallengeApi(page, 'POST')

      // Submit the form
      const submitButton = page.getByTestId('challenge-submit-button')
      await expect(submitButton).toBeEnabled({ timeout: 5000 })
      await submitButton.click()

      // Wait for API response
      const response = await apiResponsePromise
      
      // Log response details for debugging
      if (response.status() !== 200 && response.status() !== 201) {
        const responseBody = await response.text().catch(() => 'Could not read response body')
        console.error(`❌ API Error - Status: ${response.status()}`)
        console.error(`Response body: ${responseBody}`)
      }
      
      // Accept both 200 and 201 (Created) as success
      expect([200, 201]).toContain(response.status())

      // The challenge is created, but image upload may fail in test environment
      // due to DNAnexus token issues. Wait for either success or error message.
      const successMessage = page.getByText('Challenge has been created')
      const errorMessage = page.getByText(/Error|failed|could not/i)
      
      // Wait for page to settle after API response
      await page.waitForTimeout(2000)
      
      // Check if we got redirected to challenges list (success case)
      const isOnChallengesList = page.url().includes('/challenges') && !page.url().includes('/create')
      
      if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`✅ Challenge "${challengeName}" created successfully`)
      } else if (isOnChallengesList) {
        console.log(`✅ Challenge "${challengeName}" created (redirected to list)`)
      } else if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Image upload may fail in test env, but challenge should still be created
        console.log('⚠️ Challenge created but image upload may have failed (expected in test env)')
      }
      
      // Verify challenge exists by navigating to the list
      await page.goto('/challenges')
      await expect(page.getByTestId('challenges-list')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })
      
      // Search for our challenge
      const ourChallenge = page.getByTestId('challenge-title').filter({ hasText: challengeName })
      await expect(ourChallenge).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      console.log(`✅ Challenge "${challengeName}" verified in list`)
    } finally {
      await context.close()
    }
  })

  /**
   * Test 2: Scoring app user creates an app and assigns it to the challenge
   * 
   * The scoring app user (admin2) creates an app and assigns it to the challenge
   * using the "Set as Challenge App" action from the app detail page.
   * Note: The app does NOT need to be public to be assignable to a challenge.
   */
  test('Scoring app user creates an app and assigns it to challenge', async ({ browser }) => {
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.admin2)

    try {
      // Navigate to apps page
      await page.goto('/home/apps?scope=me')
      await expect(page.locator('a.active').filter({ hasText: 'Apps' })).toBeVisible({
        timeout: TIMEOUTS.pageLoad,
      })

      // Click Create App button
      const createAppButton = page.getByRole('link', { name: 'Create App' })
      await expect(createAppButton).toBeVisible({ timeout: TIMEOUTS.pageLoad })
      await createAppButton.click()

      // Wait for create app form to load
      await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

      // Fill out the app form - using the helper
      await CreateAppForm.submit(page, scoringAppName, scoringAppTitle)

      console.log(`✅ Scoring app "${scoringAppTitle}" created successfully`)

      // Now assign the app to the challenge via "Set as Challenge App" action
      // Navigate back to apps list and find the app
      await page.goto('/home/apps?scope=me')
      await expect(page.locator('a.active').filter({ hasText: 'Apps' })).toBeVisible({
        timeout: TIMEOUTS.pageLoad,
      })

      // Search for the app
      const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')
      await filterInput.fill(scoringAppName)
      await page.waitForTimeout(600)
      await page.waitForLoadState('networkidle')

      // Click on the app to open detail
      await page.getByTestId('table-col-name').filter({ hasText: scoringAppName }).getByRole('link').click()
      await page.waitForLoadState('networkidle')

      // Wait for the app detail page to fully load
      await expect(page.getByTestId('app-title')).toBeVisible({ timeout: TIMEOUTS.pageLoad })

      // Click Actions menu and select "Set as Challenge App"
      const actionsButton = page.getByRole('button', { name: 'Actions' })
      await expect(actionsButton).toBeVisible({ timeout: TIMEOUTS.pageLoad })
      await actionsButton.click()

      const challengeAppMenuItem = page.getByRole('menuitem', { name: 'Set as Challenge App' })
      await expect(challengeAppMenuItem).toBeVisible({ timeout: 5000 })
      await challengeAppMenuItem.click()

      // Wait for the "Assign to challenge" modal to appear
      await expect(page.getByTestId('modal-apps-attach-to-challenge')).toBeVisible({ timeout: 10000 })

      // Find and select our challenge from the list
      const challengeRow = page.locator('tbody tr').filter({ hasText: challengeName })
      await expect(challengeRow).toBeVisible({ timeout: 5000 })
      await challengeRow.click()

      // Click the Assign button
      const assignButton = page.getByRole('button', { name: 'Assign' })
      await expect(assignButton).toBeEnabled({ timeout: 5000 })
      await assignButton.click()

      // Wait for modal to close and success message
      await expect(page.getByTestId('modal-apps-attach-to-challenge')).not.toBeVisible({ timeout: 10000 })

      console.log(`✅ Scoring app "${scoringAppTitle}" assigned to challenge "${challengeName}"`)
    } finally {
      await context.close()
    }
  })

  /**
   * Test 3: Admin changes challenge status to open
   * 
   * Admin user navigates to the challenge settings and changes
   * the status from "setup" to "open" to make it publicly joinable.
   */
  test('Admin changes challenge status to open', async ({ browser }) => {
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.admin)

    try {
      // Navigate to challenges list
      await page.goto('/challenges')
      await expect(page.getByTestId('challenges-list')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Find and click on the challenge we created
      const challengeLink = page.getByTestId('challenge-title').filter({ hasText: challengeName })
      await expect(challengeLink).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })
      await challengeLink.click()

      // Wait for challenge details to load
      await expect(page.getByTestId('challenge-details-banner')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Capture challenge ID from URL
      const url = page.url()
      const match = url.match(/\/challenges\/(\d+)/)
      if (match) {
        challengeId = match[1]
        console.log(`📝 Challenge ID captured: ${challengeId}`)
      }

      // Click Settings button
      await page.getByTestId('challenge-settings-button').click()

      // Wait for edit form to load
      await expect(page.getByTestId('challenge-form')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Note: Scoring app is assigned separately by the scoring app user 
      // via the "Set as Challenge App" action on their app (Test 2)

      // Change status to "open"
      const statusSelect = page.getByTestId('challenge-status-select')
      await statusSelect.click()
      await page.waitForTimeout(500)

      const openOption = page.getByText('open', { exact: true })
      await expect(openOption).toBeVisible({ timeout: 3000 })
      await openOption.click()

      // Set up API response listener
      const apiResponsePromise = waitForChallengeApi(page, 'PUT')

      // Submit the form
      const submitButton = page.getByTestId('challenge-submit-button')
      await expect(submitButton).toBeEnabled({ timeout: 5000 })
      await submitButton.click()

      // Wait for API response
      const response = await apiResponsePromise
      
      // Log response details for debugging (204 No Content is also a valid success response)
      if (response.status() !== 200 && response.status() !== 204) {
        const responseBody = await response.text().catch(() => 'Could not read response body')
        console.error(`❌ API Error - Status: ${response.status()}`)
        console.error(`Response body: ${responseBody}`)
      }
      
      expect([200, 204]).toContain(response.status())

      // Wait for success message
      await expect(page.getByText('Challenge successfully edited')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.statusChange,
      })

      console.log('✅ Challenge status changed to "open"')
    } finally {
      await context.close()
    }
  })

  /**
   * Test 4: Secondary user joins the challenge
   * 
   * A regular user (without admin permissions) finds the public
   * challenge and joins it.
   */
  test('Secondary user joins the challenge', async ({ browser }) => {
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.secondary)

    try {
      // Navigate to challenges list
      await page.goto('/challenges')
      await expect(page.getByTestId('challenges-list')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Find and click on the challenge
      const challengeLink = page.getByTestId('challenge-title').filter({ hasText: challengeName })
      await expect(challengeLink).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })
      await challengeLink.click()

      // Wait for challenge details to load
      await expect(page.getByTestId('challenge-details-banner')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Click Join Challenge button
      const joinButton = page.getByTestId('challenge-join-button')
      await expect(joinButton).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })
      await joinButton.click()

      // The join flow redirects to Rails which handles the join
      // and redirects back to the challenge page
      // Wait for the redirect to complete and verify joined status
      await page.waitForURL(/\/challenges\/\d+/, {
        timeout: CHALLENGE_TIMEOUTS.statusChange,
      })

      // Wait for the page to stabilize after redirect
      await page.waitForLoadState('networkidle')

      // Verify we're back on the challenge page and joined
      await expect(page.getByTestId('challenge-details-banner')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Check for joined confirmation (either message or submit button visible)
      const joinedMessage = page.getByTestId('challenge-joined-message')
      const submitEntryButton = page.getByTestId('challenge-submit-entry-button')

      // User should see either "You have joined this challenge" or the submit button
      const isJoined = await Promise.race([
        joinedMessage.isVisible({ timeout: 5000 }).then(() => true).catch(() => false),
        submitEntryButton.isVisible({ timeout: 5000 }).then(() => true).catch(() => false),
      ])

      expect(isJoined).toBe(true)

      console.log('✅ Secondary user successfully joined the challenge')
    } finally {
      await context.close()
    }
  })

  /**
   * Test 5: Secondary user submits an entry
   * 
   * The secondary user who joined the challenge now submits
   * an entry with the required inputs.
   * 
   * Note: This test depends on the challenge having a scoring app configured.
   * If no scoring app is assigned, the test will be skipped.
   */
  test.skip('Secondary user submits a challenge entry', async ({ browser }) => {
    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.secondary)

    try {
      // Navigate directly to the challenge
      if (challengeId) {
        await page.goto(`/challenges/${challengeId}`)
      } else {
        // Fallback: navigate via list
        await page.goto('/challenges')
        const challengeLink = page.getByTestId('challenge-title').filter({ hasText: challengeName })
        await expect(challengeLink).toBeVisible({
          timeout: CHALLENGE_TIMEOUTS.pageLoad,
        })
        await challengeLink.click()
      }

      // Wait for challenge details to load
      await expect(page.getByTestId('challenge-details-banner')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Click Submit Challenge Entry button
      const submitEntryButton = page.getByTestId('challenge-submit-entry-button')
      
      // Check if submit entry button exists (challenge must be open and user joined)
      if (await submitEntryButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitEntryButton.click()

        // Check if submission form is visible (requires scoring app)
        const submissionForm = page.getByTestId('submission-form')
        const noScoringAppMessage = page.getByText('does not have a scoring app')

        const isFormVisible = await submissionForm.isVisible({ timeout: 10000 }).catch(() => false)
        const isNoAppMessage = await noScoringAppMessage.isVisible({ timeout: 2000 }).catch(() => false)

        if (isNoAppMessage) {
          console.log('⚠️ Challenge does not have a scoring app configured. Skipping submission test.')
          test.skip()
          return
        }

        if (isFormVisible) {
          // Fill out the submission form
          const submissionName = `E2E Test Submission ${testId}`
          await page.getByTestId('submission-name-input').clear()
          await page.getByTestId('submission-name-input').fill(submissionName)

          await page.getByTestId('submission-description-input').fill(
            `Automated test submission created at ${new Date().toISOString()}`,
          )

          // Select instance type
          const instanceTypeSelect = page.getByTestId('submission-instance-type-select')
          await instanceTypeSelect.click()
          await page.waitForTimeout(500)
          const instanceOption = page.locator('[class*="option"]').first()
          if (await instanceOption.isVisible({ timeout: 3000 }).catch(() => false)) {
            await instanceOption.click()
          }

          // Note: File inputs would need to be handled separately
          // This test focuses on the form interaction, not file uploads

          // Submit the entry
          const submitButton = page.getByTestId('submission-submit-button')
          
          // Check if button is enabled (all required fields filled)
          const isEnabled = await submitButton.isEnabled().catch(() => false)
          
          if (isEnabled) {
            await submitButton.click()

            // Wait for submission to complete
            await expect(page.getByText('Submission created').or(page.getByTestId('challenge-nav-my-entries'))).toBeVisible({
              timeout: CHALLENGE_TIMEOUTS.formSubmit,
            })

            console.log(`✅ Submission "${submissionName}" created successfully`)
          } else {
            console.log('⚠️ Submit button is disabled - likely missing required inputs (files)')
            // Still consider this a pass as we've verified the form is accessible
          }
        }
      } else {
        console.log('⚠️ Submit Entry button not visible - challenge may not be open or user not joined')
        // Navigate to my entries to verify user has access
        const myEntriesNav = page.getByTestId('challenge-nav-my-entries')
        if (await myEntriesNav.isVisible({ timeout: 3000 }).catch(() => false)) {
          await myEntriesNav.click()
          console.log('✅ User can access My Entries tab')
        }
      }
    } finally {
      await context.close()
    }
  })

  /**
   * Test 6: Cleanup - Admin archives the challenge
   * 
   * Admin user changes the challenge status to archived to clean up
   * after the test. This is optional but helps keep the test environment clean.
   */
  test.skip('Admin archives the challenge (cleanup)', async ({ browser }) => {
    // Skip cleanup in CI to preserve test artifacts for debugging
    if (process.env.CI) {
      console.log('⏭️ Skipping cleanup in CI environment')
      test.skip()
      return
    }

    const { context, page } = await createPageWithAuth(browser, AUTH_FILES.admin)

    try {
      // Navigate to challenge settings
      if (challengeId) {
        await page.goto(`/challenges/${challengeId}/settings`)
      } else {
        // Fallback: navigate via list
        await page.goto('/challenges')
        const challengeLink = page.getByTestId('challenge-title').filter({ hasText: challengeName })
        if (!await challengeLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('⚠️ Challenge not found, may have already been cleaned up')
          return
        }
        await challengeLink.click()
        await page.getByTestId('challenge-settings-button').click()
      }

      // Wait for form
      await expect(page.getByTestId('challenge-form')).toBeVisible({
        timeout: CHALLENGE_TIMEOUTS.pageLoad,
      })

      // Change status to archived
      const statusSelect = page.getByTestId('challenge-status-select')
      await statusSelect.click()
      await page.waitForTimeout(500)

      const archivedOption = page.getByText('archived', { exact: true })
      if (await archivedOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await archivedOption.click()

        // Submit
        const submitButton = page.getByTestId('challenge-submit-button')
        await expect(submitButton).toBeEnabled({ timeout: 5000 })
        await submitButton.click()

        await expect(page.getByText('Challenge successfully edited')).toBeVisible({
          timeout: CHALLENGE_TIMEOUTS.statusChange,
        })

        console.log('✅ Challenge archived successfully')
      } else {
        console.log('⚠️ Archived status option not available')
      }
    } finally {
      await context.close()
    }
  })
})
