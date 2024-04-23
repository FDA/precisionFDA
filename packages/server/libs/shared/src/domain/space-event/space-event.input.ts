import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_EVENT_ACTIVITY_TYPE } from './space-event.enum'
import { InputEntityUnion } from '../../utils/object-utils'

type SpaceEventInput = {
  spaceId: number
  userId: number
  membership?: SpaceMembership | null
  entity: InputEntityUnion
  activityType: SPACE_EVENT_ACTIVITY_TYPE
}

export { SpaceEventInput }
