import { Module } from '@nestjs/common'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DbCluster } from './db-cluster.entity'
import { UserModule } from '../user/user.module'
import { SpaceModule } from '../space/space.module'
import { SpaceMembershipModule } from '../space-membership/space-membership.module'
import { UsersDbClustersSaltModule } from './access-control/users-db-clusters-salt.module'

@Module({
  imports: [
    PlatformClientModule,
    EmailModule,
    MikroOrmModule.forFeature([DbCluster]),
    UserModule,
    SpaceModule,
    SpaceMembershipModule,
    UsersDbClustersSaltModule,
  ],
  providers: [DbClusterService],
  exports: [DbClusterService, MikroOrmModule],
})
export class DbClusterModule {}
