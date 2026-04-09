import { Provider } from '@nestjs/common'
import { ReviewSpaceCreationProcess } from '@shared/domain/space/create/review-space-creation.process'
import { SPACE_TYPE, SpaceProcessTypeMap } from '@shared/domain/space/space.enum'
import { AdministratorSpaceCreationProcess } from './administrator-space-creation.process'
import { GovernmentSpaceCreationProcess } from './government-space-creation.process'
import { GroupsSpaceCreationProcess } from './groups-space-creation.process'
import { PrivateSpaceCreationProcess } from './private-space-creation.process'

const SPACE_TYPE_TO_PROCESS_PROVIDER_MAP = 'SPACE_TYPE_TO_CREATOR_PROVIDER_MAP'

const SpaceTypeToProcessMapProvider: Provider = {
  provide: SPACE_TYPE_TO_PROCESS_PROVIDER_MAP,
  inject: [
    GroupsSpaceCreationProcess,
    PrivateSpaceCreationProcess,
    AdministratorSpaceCreationProcess,
    ReviewSpaceCreationProcess,
    GovernmentSpaceCreationProcess,
  ],
  useFactory: (
    groupsType: GroupsSpaceCreationProcess,
    privateType: PrivateSpaceCreationProcess,
    administratorType: AdministratorSpaceCreationProcess,
    reviewType: ReviewSpaceCreationProcess,
    governmentType: GovernmentSpaceCreationProcess,
  ): SpaceProcessTypeMap => {
    return {
      [SPACE_TYPE.GROUPS]: groupsType,
      [SPACE_TYPE.REVIEW]: reviewType,
      [SPACE_TYPE.GOVERNMENT]: governmentType,
      [SPACE_TYPE.PRIVATE_TYPE]: privateType,
      [SPACE_TYPE.VERIFICATION]: null, // DEPRECATED
      [SPACE_TYPE.ADMINISTRATOR]: administratorType,
    }
  },
}

export { SPACE_TYPE_TO_PROCESS_PROVIDER_MAP, SpaceTypeToProcessMapProvider }
