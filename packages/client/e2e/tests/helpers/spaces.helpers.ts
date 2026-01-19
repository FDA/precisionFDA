import { expect, Page } from 'playwright/test'

// ==================== Shared Constants ====================

/**
 * Timeouts for space operations
 */
export const TIMEOUTS = {
  pageLoad: 60000,
  toastMessage: 10000,
}

// ==================== SpacesList Helper ====================

export const SpacesList = {
  /**
   * Search for a space by name
   */
  async searchSpace(page: Page, spaceName: string) {

    // Find the Name column filter input
    const filterInput = page.getByTestId('table-filter-name').getByRole('textbox')

    // Clear the filter first to ensure a fresh search
    await filterInput.clear()
    // Wait for any pending requests from clearing to complete
    await page.waitForLoadState('networkidle')

    // Fill the filter
    await filterInput.fill(spaceName)

    // Wait for debounce (500ms) to trigger the API call, then wait for network to settle
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Create a new private space
   */
  async createPrivateSpace(page: Page, spaceName: string, spaceDescription: string) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Click Private label (radio might be hidden)
    await page.getByRole('radiogroup', { name: 'Spaces option select' }).getByText('Private').click()

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(spaceName)

    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(spaceDescription)

    await page.getByRole('button', { name: 'Create Space' }).click()

    await expect(page.getByText('Space successfully created')).toBeVisible()
  },

  /**
   * Create a new admin space
   */
  async createAdminSpace(page: Page, spaceName: string, spaceDescription: string) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Click Administrator label
    await page.getByRole('radiogroup', { name: 'Spaces option select' }).getByText('Administrator').click()

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(spaceName)

    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(spaceDescription)

    await page.getByRole('button', { name: 'Create Space' }).click()

    await expect(page.getByText('Space successfully created')).toBeVisible()
  },

  /**
   * Create a new review space
   */
  async createReviewSpace(
    page: Page,
    spaceName: string,
    spaceDescription: string,
    reviewerLead: string,
    sponsorLead: string
  ) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Click Review label
    await page.getByRole('radiogroup', { name: 'Spaces option select' }).getByText('Review').click()

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(spaceName)

    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(spaceDescription)

    await page.locator('input[name="hostLeadDxuser"]').clear()
    await page.locator('input[name="hostLeadDxuser"]').fill(reviewerLead)

    await page.locator('input[name="guestLeadDxuser"]').clear()
    await page.locator('input[name="guestLeadDxuser"]').fill(sponsorLead)

    await page.getByRole('button', { name: 'Create Space' }).click()

    await expect(page.getByText('Space successfully created')).toBeVisible()
  },

  /**
   * Create a new group space
   */
  async createGroupSpace(
    page: Page,
    spaceName: string,
    spaceDescription: string,
    hostLead: string,
    guestLead: string
  ) {
    await page.getByText(/^[ ]*Create Space$/).click()

    // Wait for the create space form to load
    await expect(page.getByRole('heading', { name: 'Create a new Space' })).toBeVisible()

    // Click Group label
    await page.getByRole('radiogroup', { name: 'Spaces option select' }).getByText('Group').click()

    await page.locator('input[name="name"]').clear()
    await page.locator('input[name="name"]').fill(spaceName)

    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(spaceDescription)

    await page.locator('input[name="hostLeadDxuser"]').clear()
    await page.locator('input[name="hostLeadDxuser"]').fill(hostLead)

    await page.locator('input[name="guestLeadDxuser"]').clear()
    await page.locator('input[name="guestLeadDxuser"]').fill(guestLead)

    await page.getByRole('button', { name: 'Create Space' }).click()

    await expect(page.getByText('Space successfully created')).toBeVisible()
  },

  /**
   * Create a group space if it doesn't already exist.
   * Searches for the space first and only creates it if not found.
   */
  async createGroupSpaceIfNotExists(
    page: Page,
    spaceName: string,
    spaceDescription: string,
    hostLead: string,
    guestLead: string
  ) {
    // Search for the space
    await SpacesList.searchSpace(page, spaceName)

    // Check if the space exists by looking for it in the table
    const spaceExists = await page
      .getByTestId('table-col-name')
      .getByRole('link', { name: spaceName })
      .first()
      .isVisible()
      .catch(() => false)

    if (!spaceExists) {
      // Space doesn't exist, create it
      await SpacesList.createGroupSpace(page, spaceName, spaceDescription, hostLead, guestLead)
    }
  },

  /**
   * Search for a space and open its detail page
   */
  async searchSpaceOpenDetail(page: Page, spaceName: string) {
    await SpacesList.searchSpace(page, spaceName)

    // Verify space is in the list - the space name is a link inside the cell
    const spaceLink = page.getByTestId('table-col-name').getByRole('link', { name: spaceName })
    await expect(spaceLink).toBeVisible({ timeout: 15000 })

    // Click the space link to open detail
    await spaceLink.click()

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle')

    // Verify we're on the space detail page by checking the URL contains /spaces/
    await expect(page).toHaveURL(/\/spaces\/\d+/)
  },
}

// ==================== SpaceSettings Helper ====================

export const SpaceSettings = {
  /**
   * Navigate to space settings (edit page)
   */
  async goToSettings(page: Page) {
    await page.getByTestId('edit-space-link').click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Navigate back to space from settings
   */
  async goBackToSpace(page: Page) {
    await page.getByText('Back to Space').click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Lock a review space
   */
  async lockSpace(page: Page) {
    await page.getByTestId('lock-space-button').click()

    // Click Lock button in confirmation dialog (the primary variant button)
    await page.getByTestId('modal-unlock-lock-space').getByRole('button', { name: 'Lock' }).click()

    await expect(page.getByText('Space locked successfully')).toBeVisible()

    // Wait for toast to disappear
    await expect(page.getByText('Space locked successfully')).not.toBeVisible({ timeout: TIMEOUTS.toastMessage })
  },

  /**
   * Unlock a review space
   */
  async unlockSpace(page: Page) {
    await page.getByTestId('lock-space-button').click()

    // Click Unlock button in confirmation dialog (the primary variant button)
    await page.getByTestId('modal-unlock-lock-space').getByRole('button', { name: 'Unlock' }).click()

    await expect(page.getByText('Space unlocked successfully')).toBeVisible()

    // Wait for toast to disappear
    await expect(page.getByText('Space unlocked successfully')).not.toBeVisible({ timeout: TIMEOUTS.toastMessage })
  },

  /**
   * Edit description field
   */
  async editDescription(page: Page, description: string) {
    await page.locator('input[name="description"]').clear()
    await page.locator('input[name="description"]').fill(description)
  },

  /**
   * Add tags to the space via the Edit Tags modal
   */
  async addTags(page: Page, tag: string) {
    await page.getByRole('button', { name: 'Edit Tags' }).click()

    await page.locator('input[name="tags"]').fill(tag)

    await page.getByRole('button', { name: 'Edit Tags' }).click()

    await expect(page.getByText(/^Successfully edited [a-zA-Z]+ tags/)).toBeVisible()
  },

  /**
   * Fill CTS field (for Review spaces)
   */
  async fillCTS(page: Page, cts: string) {
    await page.locator('input[name="cts"]').fill(cts)
  },

  /**
   * Save space settings
   */
  async save(page: Page) {
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Validate space type exists on settings page
   * The space type is displayed in a disabled input field
   */
  async validateSpaceType(page: Page, spaceType: 'Private' | 'Administrator' | 'Review' | 'Group') {
    // The InputText component renders a disabled input with the space type name as value
    await expect(page.locator(`input[value="${spaceType}"][disabled]`)).toBeVisible()
  },
}

// ==================== SpaceMembers Helper ====================

export const SpaceMembers = {
  /**
   * Navigate to members tab in a space
   */
  async goToMembers(page: Page) {
    await page.getByTestId('members-link').click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Open the Actions menu and click a specific item
   */
  async openActionsMenuAndClick(page: Page, actionName: string | RegExp) {
    // Click the Actions button
    await page.getByTestId('members-actions-button').click()
    await page.waitForTimeout(500)

    // Click the menu item
    await page.getByRole('menuitem', { name: actionName }).click({ force: true })
  },

  /**
   * Add members to the space
   */
  async addMembers(page: Page, usernames: string[]) {
    // Click Add Members button
    await page.getByRole('button', { name: 'Add Members' }).click()

    // Fill in the invitees field
    await page.locator('input[name="invitees"]').fill(usernames.join(', '))

    // Click Add Members button in modal
    await page.getByTestId('modal-add-members').getByRole('button', { name: 'Add Members' }).click()

    // Wait for success message
    await expect(page.getByText('Success: Adding members')).toBeVisible()
  },

  /**
   * Search for a member in the members table by username
   */
  async searchMemberByUsername(page: Page, username: string) {
    const filterInput = page.getByTestId('table-filter-user_name').getByRole('textbox')
    await filterInput.clear()
    await filterInput.fill(username)
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Filter members by role
   */
  async filterByRole(page: Page, role: string) {
    const filterInput = page.getByTestId('table-filter-role').getByRole('textbox')
    await filterInput.clear()
    await filterInput.fill(role)
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
  },

  /**
   * Select a member row by username
   */
  async selectMemberRow(page: Page, username: string) {
    const userRow = page.getByTestId('data-row').filter({ 
      has: page.getByTestId('table-col-user_name').getByRole('link', { name: username })
    })
    await userRow.getByTestId('row-checkbox').click()
  },

  /**
   * Disable a member via the Edit Role modal
   */
  async disableMember(page: Page) {
    await page.getByRole('button', { name: 'Disable member' }).click()
    await expect(page.getByText(/Disabled member/)).toBeVisible()
  },

  /**
   * Enable a member via the Edit Role modal
   */
  async enableMember(page: Page) {
    await page.getByRole('button', { name: 'Enable member' }).click()
    await expect(page.getByText(/Enabled member/)).toBeVisible()
  },

  /**
   * Change member role in the Edit Role modal
   */
  async changeMemberRole(page: Page, newRole: string) {
    await page.locator('#select_member_role').fill(newRole)
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Change Role' }).click()
  },
}
