import { expect, Page } from 'playwright/test'

// ==================== Shared Constants ====================

/**
 * Timeouts for discussion operations
 */
export const TIMEOUTS = {
  pageLoad: 60000,
  toastMessage: 10000,
  comparisonComplete: 360000, // 6 minutes for comparison to complete
}

// ==================== DiscussionsList Helper ====================

export const DiscussionsList = {
  /**
   * Navigate to discussions tab in a space
   */
  async goToDiscussions(page: Page) {
    await page.getByTestId('discussions-link').click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Click "Start a Discussion" link
   */
  async startDiscussion(page: Page) {
    await page.getByRole('link', { name: 'Create Discussion' }).click()
    await page.waitForLoadState('networkidle')
  },

  /**
   * Open a discussion by title
   */
  async openDiscussion(page: Page, discussionTitle: string) {
    await page.getByTestId('table-col-title').filter({ hasText: discussionTitle }).click()
    await page.waitForLoadState('networkidle')
  },
}

// ==================== DiscussionForm Helper ====================

export const DiscussionForm = {
  /**
   * Fill in the discussion form
   */
  async fill(page: Page, title: string, content: string) {
    await page.locator('input[name="title"]').fill(title)
    await page.locator('textarea[name="content"]').fill(content)
  },

  /**
   * Open the attachment selector dropdown
   */
  async openAttachmentSelector(page: Page) {
    await page.getByTestId('admin-users-resource-button').filter({ hasText: 'Select Attachment' }).click()
  },

  /**
   * Select attachment type from dropdown
   */
  async selectAttachmentType(page: Page, type: 'Files' | 'Apps' | 'Jobs' | 'Comparisons') {
    await page.getByRole('menuitem', { name: type }).click()
  },

  /**
   * Filter and select an attachment in the modal
   */
  async filterAndSelectAttachment(page: Page, filterText: string, ariaLabel?: string) {
    // If ariaLabel is provided, we need to click the tab first
    if (ariaLabel) {
      await page.locator(`div[aria-label="${ariaLabel}"]`).getByText(new RegExp(`^${ariaLabel.replace('Select ', '')} `)).click({ force: true })
    }

    await page.getByPlaceholder('Filter...').fill(filterText)
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')

    // Click the item
    await page.getByText(filterText, { exact: false }).first().click()
  },

  /**
   * Confirm attachment selection
   */
  async confirmAttachmentSelection(page: Page, ariaLabel?: string) {
    if (ariaLabel) {
      await page.locator(`div[aria-label="${ariaLabel}"]`).getByRole('button', { name: /^Select/ }).click()
    } else {
      await page.getByRole('button', { name: /^Select \d+/ }).click()
    }
  },

  /**
   * Submit the discussion form
   */
  async submit(page: Page) {
    await page.getByRole('button', { name: 'Create' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('started this discussion')).toBeVisible()
  },
}

// ==================== DiscussionDetail Helper ====================

export const DiscussionDetail = {
  /**
   * Validate attachment is visible
   */
  async validateFileAttachment(page: Page, fileName: string) {
    await expect(page.getByTestId('attachments-files').getByRole('link', { name: fileName })).toBeVisible()
  },

  /**
   * Open the discussion dropdown menu
   */
  async openDropdown(page: Page) {
    await page.getByTestId('discussion-dropdown').click()
  },

  /**
   * Delete the discussion
   */
  async deleteDiscussion(page: Page) {
    await DiscussionDetail.openDropdown(page)
    await page.getByRole('menuitem', { name: 'Delete Discussion' }).click({ force: true })
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByText('Discussion successfully removed')).toBeVisible()
  },

  /**
   * Add a comment to the discussion
   */
  async addComment(page: Page, content: string) {
    await page.locator('textarea[name="content"]').fill(content)
    await page.getByRole('button', { name: 'Comment' }).click()
    await expect(page.getByText('Reply has been published')).toBeVisible()
  },

  /**
   * Add an answer to the discussion
   */
  async addAnswer(page: Page, content: string) {
    await page.locator('textarea[name="content"]').fill(content)
    await page.locator('input[name="isAnswer"]').check()
    await page.getByRole('button', { name: 'Comment' }).click()
    await expect(page.getByText('Reply has been published')).toBeVisible()
  },

  /**
   * Open comment dropdown (for edit/delete)
   */
  async openCommentDropdown(page: Page, index: 'first' | 'last' = 'first') {
    const dropdown = page.getByTestId('comment-dropdown')
    if (index === 'last') {
      await dropdown.last().click()
    } else {
      await dropdown.first().click()
    }
  },

  /**
   * Open answer dropdown (for edit/delete)
   */
  async openAnswerDropdown(page: Page, index: 'first' | 'last' = 'first') {
    const dropdown = page.getByTestId('answer-dropdown')
    if (index === 'last') {
      await dropdown.last().click()
    } else {
      await dropdown.first().click()
    }
  },

  /**
   * Edit a comment
   */
  async editComment(page: Page, newContent: string) {
    await DiscussionDetail.openCommentDropdown(page, 'first')
    await page.getByRole('menuitem', { name: 'Edit Comment' }).click({ force: true })
    await page.locator('textarea[name="content"]').first().clear()
    await page.locator('textarea[name="content"]').first().fill(newContent)
    await page.getByRole('button', { name: 'Save' }).click()
    // Wait for the edit form to close and verify the content was updated in the paragraph
    await expect(page.locator('p').filter({ hasText: newContent })).toBeVisible({ timeout: TIMEOUTS.toastMessage })
  },

  /**
   * Delete a comment
   */
  async deleteComment(page: Page, index: 'first' | 'last' = 'last') {
    await DiscussionDetail.openCommentDropdown(page, index)
    await page.getByRole('menuitem', { name: 'Delete Comment' }).click({ force: true })
    await page.getByRole('button', { name: 'OK' }).click()
  },

  /**
   * Edit an answer
   */
  async editAnswer(page: Page, newContent: string, index: 'first' | 'last' = 'last') {
    await DiscussionDetail.openAnswerDropdown(page, index)
    await page.getByRole('menuitem', { name: 'Edit Answer' }).click({ force: true })
    await page.locator('textarea[name="content"]').first().clear()
    await page.locator('textarea[name="content"]').first().fill(newContent)
    await page.locator('button[form="commentForm"]').filter({ hasText: 'Save' }).click()
    await expect(page.getByText('Reply has been published')).toBeVisible()
  },

  /**
   * Delete an answer
   */
  async deleteAnswer(page: Page, index: 'first' | 'last' = 'first') {
    await DiscussionDetail.openAnswerDropdown(page, index)
    await page.getByRole('menuitem', { name: 'Delete Answer' }).click({ force: true })
    await page.getByRole('button', { name: 'OK' }).click()
  },

  /**
   * Click Reply button to reply to an answer
   */
  async clickReplyButton(page: Page) {
    await page.getByTestId('reply-answer').click()
  },

  /**
   * Add reply to an answer
   */
  async addReplyToAnswer(page: Page, content: string) {
    await DiscussionDetail.clickReplyButton(page)
    await page.locator('textarea[name="content"]').last().fill(content)
    await page.getByRole('button', { name: 'Comment' }).and(page.locator(':not([disabled])')).click()
    await expect(page.getByText('Reply has been published')).toBeVisible()
  },

  /**
   * Validate comments and answers count
   */
  async validateCommentsAndAnswersCount(page: Page, commentsCount: number, answersCount: number) {
    const commentText = commentsCount === 1 ? 'Comment' : 'Comments'
    const answerText = answersCount === 1 ? 'Answer' : 'Answers'
    await expect(page.getByText(`${commentsCount} ${commentText} and ${answersCount} ${answerText}`)).toBeVisible()
  },
}
