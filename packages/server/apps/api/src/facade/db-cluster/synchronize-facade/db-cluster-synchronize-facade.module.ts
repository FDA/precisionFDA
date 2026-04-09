import { Module } from '@nestjs/common'
import { UsersDbClustersSaltModule } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserModule } from '@shared/domain/user/user.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterSynchronizeFacade } from './db-cluster-synchronize.facade'

@Module({
  imports: [
    DbClusterModule,
    PlatformClientModule,
    EmailModule,
    UserModule,
    SpaceModule,
    UsersDbClustersSaltModule,
    NotificationModule,
  ],
  providers: [DbClusterSynchronizeFacade],
  exports: [DbClusterSynchronizeFacade],
})
export class DbClusterSynchronizeFacadeModule {}
