import type { UserState } from '@/types/user'

export type UserDetails = {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  userState: UserState
  createdAt: string
  updatedAt: string
  timeZone: string | null
  isSSO?: boolean
  lastLogin?: string | null
  organization: {
    id: number
    name: string
    handle: string
    adminId: number | null
    adminFullName: string | null
    singular: boolean
  }
}
