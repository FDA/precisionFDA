import { Provider } from '@nestjs/common'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { GroupsSpaceCreationProcess } from './groups-space-creation.process'
import { PrivateSpaceCreationProcess } from './private-space-creation.process'
import { AdministratorSpaceCreationProcess } from './administrator-space-creation.process'
import { GovernmentSpaceCreationProcess } from './government-space-creation.process'

const SPACE_TYPE_TO_PROCESS_PROVIDER_MAP = 'SPACE_TYPE_TO_CREATOR_PROVIDER_MAP'

const SpaceTypeToProcessMapProvider: Provider = {
  provide: SPACE_TYPE_TO_PROCESS_PROVIDER_MAP,
  inject: [
    GroupsSpaceCreationProcess,
    PrivateSpaceCreationProcess,
    AdministratorSpaceCreationProcess,
    GovernmentSpaceCreationProcess,
  ],
  useFactory: (
    groupsType: GroupsSpaceCreationProcess,
    privateType: PrivateSpaceCreationProcess,
    administratorType: AdministratorSpaceCreationProcess,
    governmentType: GovernmentSpaceCreationProcess,
  ): { [T in SPACE_TYPE]: SpaceCreationProcess } => {
    return {
      [SPACE_TYPE.GROUPS]: groupsType,
      [SPACE_TYPE.REVIEW]: null, //TODO: implement review space creation process
      [SPACE_TYPE.GOVERNMENT]: governmentType,
      [SPACE_TYPE.PRIVATE_TYPE]: privateType,
      [SPACE_TYPE.VERIFICATION]: null, // DEPRECATED
      [SPACE_TYPE.ADMINISTRATOR]: administratorType,
    }
  },
}

export {
  SpaceTypeToProcessMapProvider,
  SPACE_TYPE_TO_PROCESS_PROVIDER_MAP,
}
