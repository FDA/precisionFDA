import { Module } from '@nestjs/common'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'

@Module({
  imports: [
    PlatformClientModule,
    EntityModule,
    DiscussionModule,
    DbClusterModule,
    EntityLinkModule,
  ],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
