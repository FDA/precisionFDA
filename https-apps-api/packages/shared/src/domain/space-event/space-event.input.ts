import { SpaceMembership } from '../space-membership/space-membership.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from './space-event.enum'

type SpaceEventInput = {
  spaceId: number
  userId: number
  membership?: SpaceMembership | null
  entity: any
  activityType: SPACE_EVENT_ACTIVITY_TYPE
}

export { SpaceEventInput }
