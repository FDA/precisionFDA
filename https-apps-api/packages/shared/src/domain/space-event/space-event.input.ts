import { SPACE_EVENT_ACTIVITY_TYPE } from './space-event.enum'
import { SpaceMembership } from '..'
import { InputEntityUnion } from '../../utils/object-utils'

type SpaceEventInput = {
  spaceId: number
  userId: number
  membership?: SpaceMembership | null
  entity: InputEntityUnion
  activityType: SPACE_EVENT_ACTIVITY_TYPE
}

export { SpaceEventInput }
