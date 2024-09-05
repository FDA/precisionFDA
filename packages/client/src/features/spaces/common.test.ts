import {
  SpaceTypeName,
  getHostLeadLabel,
  getGuestLeadLabel,
  isActionDisabledBasedOnRole,
  isActionDisabledBasedOnProtected,
} from './common'
import { createMockSpace } from '../../test/mocks'

const space = createMockSpace()

describe('SpaceTypeName', () => {
  it('should have correct values', () => {
    expect(SpaceTypeName).toEqual({
      groups: 'Group',
      review: 'Review',
      private_type: 'Private',
      government: 'Government',
      administrator: 'Administrator',
    })
  })
})

describe('getHostLeadLabel', () => {
  it('should return "Reviewer Lead" for review type', () => {
    expect(getHostLeadLabel('review')).toBe('Reviewer Lead')
  })

  it('should return "Host Lead" for groups type', () => {
    expect(getHostLeadLabel('groups')).toBe('Host Lead')
  })

  it('should return empty string for other types', () => {
    expect(getHostLeadLabel('private_type')).toBe('')
  })
})

describe('getGuestLeadLabel', () => {
  it('should return "Reviewer Lead" for review type', () => {
    expect(getGuestLeadLabel('review')).toBe('Reviewer Lead')
  })

  it('should return "Guest Lead" for groups type', () => {
    expect(getGuestLeadLabel('groups')).toBe('Guest Lead')
  })

  it('should return empty string for other types', () => {
    expect(getGuestLeadLabel('private_type')).toBe('')
  })
})

describe('isActionDisabledBasedOnRole', () => {
  it('should return false if no space is provided', () => {
    expect(isActionDisabledBasedOnRole(1)).toBe(false)
  })

  it('should return false if user is host lead', () => {
    expect(isActionDisabledBasedOnRole(1, space)).toBe(false)
  })

  it('should return false if user is guest lead', () => {
    expect(isActionDisabledBasedOnRole(2, space)).toBe(false)
  })

  it('should return true if user is not a lead', () => {
    expect(isActionDisabledBasedOnRole(3, space)).toBe(true)
  })
})

describe('isActionDisabledBasedOnProtected', () => {
  it('should return false if space is not protected', () => {
    expect(isActionDisabledBasedOnProtected(1, { ...space, protected: false })).toBe(false)
  })

  it('should return false if user is host lead', () => {
    expect(isActionDisabledBasedOnProtected(1, space)).toBe(false)
  })

  it('should return false if user is guest lead', () => {
    expect(isActionDisabledBasedOnProtected(2, space)).toBe(false)
  })

  it('should return true if user is not a lead', () => {
    expect(isActionDisabledBasedOnProtected(3, space)).toBe(true)
  })
})
