import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { StatisticsFacade } from './statistics.facade'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { OrganizationModule } from '@shared/domain/org/organization.module'

@Module({
  imports: [SpaceModule, UserFileModule, UserModule, OrganizationModule],
  providers: [StatisticsFacade],
  exports: [StatisticsFacade],
})
export class StatisticsFacadeModule {}
