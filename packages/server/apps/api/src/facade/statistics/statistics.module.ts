import { Module } from '@nestjs/common'
import { OrganizationModule } from '@shared/domain/org/organization.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { StatisticsFacade } from './statistics.facade'

@Module({
  imports: [SpaceModule, UserFileModule, UserModule, OrganizationModule],
  providers: [StatisticsFacade],
  exports: [StatisticsFacade],
})
export class StatisticsFacadeModule {}
