import { describe, expect, it } from 'vitest'
import { createMockSpace } from '../../test/mocks'
import { getReviewAreaCopyTarget } from './file.utils'

describe('getReviewAreaCopyTarget', () => {
  it('targets the private area from the shared area of a review space', () => {
    const space = { ...createMockSpace(), private_space_id: 42 }
    expect(getReviewAreaCopyTarget(space)).toEqual({
      scope: 'space-42',
      label: 'Copy to Private Area',
      areaName: 'Private Area',
      modalTitle: 'Copy Files to "space1 - Private Area"',
      variant: 'private',
    })
  })

  it('targets the shared area from a private area of a review space', () => {
    const space = { ...createMockSpace(), shared_space_id: 7 }
    expect(getReviewAreaCopyTarget(space)).toEqual({
      scope: 'space-7',
      label: 'Copy to Shared Area',
      areaName: 'Shared Area',
      modalTitle: 'Copy Files to "space1 - Shared Area"',
      variant: 'shared',
    })
  })

  it('returns undefined for a review space without an opposite area', () => {
    expect(getReviewAreaCopyTarget(createMockSpace())).toBeUndefined()
  })

  it('returns undefined for non-review spaces', () => {
    const space = { ...createMockSpace(), type: 'groups' as const, private_space_id: 42 }
    expect(getReviewAreaCopyTarget(space)).toBeUndefined()
  })

  it('returns undefined outside a space', () => {
    expect(getReviewAreaCopyTarget(undefined)).toBeUndefined()
  })
})
