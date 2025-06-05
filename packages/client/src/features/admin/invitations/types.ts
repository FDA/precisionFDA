export type Invitation = {
  id: number
  firstName: string
  lastName: string
  email: string
  duns: string
  provisioningState: 'pending' | 'in_progress' | 'failed' | 'finished'
  createdAt: string
}

export type InvitationsListType = {
  data: Invitation[]
}
