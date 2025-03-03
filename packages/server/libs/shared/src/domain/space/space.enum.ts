import { InvalidStateError } from '@shared/errors'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { ReviewSpaceCreationProcess } from '@shared/domain/space/create/review-space-creation.process'
import { PrivateSpaceCreationProcess } from '@shared/domain/space/create/private-space-creation.process'
import { GovernmentSpaceCreationProcess } from '@shared/domain/space/create/government-space-creation.process'
import { AdministratorSpaceCreationProcess } from '@shared/domain/space/create/administrator-space-creation.process'

enum SPACE_TYPE {
  GROUPS = 0,
  REVIEW = 1,
  PRIVATE_TYPE = 3,
  GOVERNMENT = 4,
  ADMINISTRATOR = 5,
  // deprecated type - no longer in use
  VERIFICATION = 2,
}

type SpaceProcessTypeMap = {
  [SPACE_TYPE.GROUPS]: GroupsSpaceCreationProcess
  [SPACE_TYPE.REVIEW]: ReviewSpaceCreationProcess
  [SPACE_TYPE.PRIVATE_TYPE]: PrivateSpaceCreationProcess
  [SPACE_TYPE.GOVERNMENT]: GovernmentSpaceCreationProcess
  [SPACE_TYPE.ADMINISTRATOR]: AdministratorSpaceCreationProcess
  [SPACE_TYPE.VERIFICATION]: Object // unused
}

function getSpaceTypeEnum(key: string): SPACE_TYPE {
  switch (key?.toUpperCase()) {
    case 'GROUPS':
      return SPACE_TYPE.GROUPS
    case 'REVIEW':
      return SPACE_TYPE.REVIEW
    case 'PRIVATE_TYPE':
      return SPACE_TYPE.PRIVATE_TYPE
    case 'GOVERNMENT':
      return SPACE_TYPE.GOVERNMENT
    case 'ADMINISTRATOR':
      return SPACE_TYPE.ADMINISTRATOR
    default:
      throw new InvalidStateError(`Unknown SPACE_TYPE: ${key}`)
  }
}

enum SPACE_STATE {
  UNACTIVATED = 0,
  ACTIVE = 1,
  LOCKED = 2,
  DELETED = 3,
}

export { getSpaceTypeEnum, SPACE_STATE, SPACE_TYPE, SpaceProcessTypeMap }
