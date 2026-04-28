import type { AdminUserDetails, User } from './types'

type UnlockableUser = Pick<User, 'userState'> | Pick<AdminUserDetails, 'userState'>

export const canAdminUnlockUsers = (users: UnlockableUser[]): boolean => users.length === 1
