import { SPACE_TYPE } from '../space.enum'

type SpaceParam = {
  id?: number
  name: string
  description: string
  hostProject?: string
  guestProject?: string
  hostDxOrg?: string
  guestDxOrg?: string
  guestLeadDxUser?: string
  hostLeadDxUser?: string
  sponsorLeadDxUser?: string
  meta?: string
  state?: string
  cts?: string
  type: SPACE_TYPE
  verified?: boolean
  sponsorOrgId?: number
  restrictToTemplate?: boolean
  inactivityNotified?: boolean
  protected?: boolean
}

export { SpaceParam }
