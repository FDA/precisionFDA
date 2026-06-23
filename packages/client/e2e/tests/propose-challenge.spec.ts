import { test, expect } from './extend'

test.describe('Propose Challenge', () => {
  test('submits a challenge proposal', async ({ page }) => {
    const proposal = {
      name: 'Ada Lovelace',
      email: 'ada.lovelace@example.com',
      organisation: 'Analytical Engine Institute',
      specificQuestion: true,
      specificQuestionText: 'Can community benchmark workflows improve variant interpretation consistency?',
      dataDetails: false,
      dataDetailsText: '',
    }
    let submittedPayload: unknown

    await page.route('**/api/v2/challenges/propose', async route => {
      submittedPayload = route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.goto('/challenges/propose')

    await expect(page.getByRole('heading', { name: 'Propose a Challenge' })).toBeVisible()

    await page.getByPlaceholder('Enter your name').fill(proposal.name)
    await page.getByPlaceholder('Enter your contact email').fill(proposal.email)
    await page.getByPlaceholder('Enter your organisation / institute').fill(proposal.organisation)
    await page.getByPlaceholder('Enter the question details').fill(proposal.specificQuestionText)

    const dataDetailsGroup = page.getByRole('radiogroup', { name: 'Do you have access to data for the challenge?' })
    await dataDetailsGroup.getByText('No').click()
    await expect(dataDetailsGroup.getByText('No')).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByPlaceholder('Enter the data details')).toHaveValue('')

    const proposeResponse = page.waitForResponse(
      response => response.url().includes('/api/v2/challenges/propose') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Submit Inquiry' }).click()
    await proposeResponse

    expect(submittedPayload).toEqual(proposal)
    await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible()
    await expect(page.getByText('Your challenge proposal has been submitted successfully!')).toBeVisible()
  })
})