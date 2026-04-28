import type { AdminUserDetails, User } from './types'
import { canAdminUnlockUsers } from './canAdminUnlockUsers'

const makeListUser = (userState: User['userState']): Pick<User, 'userState'> => ({ userState })
const makeDetailsUser = (userState: AdminUserDetails['userState']): Pick<AdminUserDetails, 'userState'> => ({ userState })

describe('canAdminUnlockUsers', () => {
  test('allows unlock for a single active user', () => {
    expect(canAdminUnlockUsers([makeListUser('active')])).toBe(true)
  })

  test('allows unlock for a single locked user', () => {
    expect(canAdminUnlockUsers([makeListUser('locked')])).toBe(true)
  })

  test('allows unlock for a single deactivated user in the drawer', () => {
    expect(canAdminUnlockUsers([makeDetailsUser('deactivated')])).toBe(true)
  })

  test('disallows unlock when no user is in scope', () => {
    expect(canAdminUnlockUsers([])).toBe(false)
  })

  test('disallows unlock when multiple users are selected', () => {
    expect(canAdminUnlockUsers([makeListUser('active'), makeListUser('locked')])).toBe(false)
  })
})
