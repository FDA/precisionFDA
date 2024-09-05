import { DataPortalMember } from './types'
import { canEditSettings, canEditContent } from './utils'


describe('canEditSettings', () => {
  const admin = 'john.doe'
  const viewer = 'alex.brown'
  const lead = 'bank.jeff'
  const noUser = 'unknown.user'

  const members = [
    { dxuser: 'john.doe', role: 'admin' },
    { dxuser: 'jane.smith', role: 'contributor' },
    { dxuser: 'alex.brown', role: 'viewer' },
    { dxuser: 'bank.jeff', role: 'lead' },
  ] satisfies DataPortalMember[]

  it('returns false if currentUser is not found in members', () => {
    expect(canEditSettings(noUser, members)).toBe(false)
  })

  it('returns false if currentUser does not have an allowed role', () => {
    expect(canEditSettings(viewer, members)).toBe(false)
  })

  it('returns true if currentUser has an allowed role', () => {
    expect(canEditSettings(lead, members)).toBe(true)
  })
})

describe('canEditContent', () => {
  const noUser = 'unknown.user'
  const viewer = 'alex.brown'
  const contributor = 'jane.smith'
  const admin = 'john.doe'
  const lead = 'bank.jeff'

  const members = [
    { dxuser: 'alex.brown', role: 'viewer' },
    { dxuser: 'john.doe', role: 'admin' },
    { dxuser: 'jane.smith', role: 'contributor' },
    { dxuser: 'bank.jeff', role: 'lead' },
  ] satisfies DataPortalMember[]

  test('should return false if currentUser is not in members', () => {
    expect(canEditContent(noUser, members)).toBe(false)
  })

  test('should return false if currentUser is a viewer', () => {
    expect(canEditContent(viewer, members)).toBe(false)
  })

  test('should return true if currentUser is has allowed role', () => {
    expect(canEditContent(admin, members)).toBe(true)
    expect(canEditContent(lead, members)).toBe(true)
    expect(canEditContent(contributor, members)).toBe(true)
  })
})