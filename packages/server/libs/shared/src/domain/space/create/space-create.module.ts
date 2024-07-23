import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { AdministratorSpaceCreationProcess } from '@shared/domain/space/create/administrator-space-creation.process'
import { GovernmentSpaceCreationProcess } from '@shared/domain/space/create/government-space-creation.process'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { PrivateSpaceCreationProcess } from '@shared/domain/space/create/private-space-creation.process'
import { SpaceTypeToProcessMapProvider } from '@shared/domain/space/create/space-type-to-process-map.provider'
import { SpaceNotificationService } from '@shared/domain/space/service/space-notification.service'
import { User } from '@shared/domain/user/user.entity'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [PlatformClientModule, EmailModule, MikroOrmModule.forFeature([User])],
  providers: [
    AdministratorSpaceCreationProcess,
    GroupsSpaceCreationProcess,
    PrivateSpaceCreationProcess,
    GovernmentSpaceCreationProcess,
    SpaceTypeToProcessMapProvider,
    SpaceNotificationService,
  ],
  exports: [SpaceTypeToProcessMapProvider],
})
export class SpaceCreateModule {
}
