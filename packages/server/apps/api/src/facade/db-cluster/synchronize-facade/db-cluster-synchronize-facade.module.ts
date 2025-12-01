import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserModule } from '@shared/domain/user/user.module'
import { UsersDbClustersSaltModule } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.module'
import { DbClusterSynchronizeFacade } from './db-cluster-synchronize.facade'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'

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
