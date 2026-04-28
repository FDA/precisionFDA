export interface ProfileViewFields {
  emailConfirmed: boolean
  email: string
}

export interface ProfileUser {
  id: number
  dxuser: string
  firstName: string
  lastName: string
  email: string
  fullName: string
  timeZone: string | null
  singular: boolean
  canProvisionAccounts: boolean
  isOrgAdmin: boolean
}

export interface ProfileOrganization {
  id: number
  handle: string
  name: string
  adminId: number
  adminFullName: string
}

export interface ProfilePageData {
  user: ProfileUser
  profile: ProfileViewFields
  organization: ProfileOrganization | null
}

export interface OrgUser {
  id: number
  dxuser: string
  fullName: string
  createdAt: string
  isEnabled: boolean
  isAdmin: boolean
}

export interface OrgUsersListResponse {
  users: OrgUser[]
  totalCount: number
}

export interface UpdateProfilePayload {
  email?: string | null
  password?: string
  otp?: string
}

export interface UpdateTimeZonePayload {
  timeZone: string
}
