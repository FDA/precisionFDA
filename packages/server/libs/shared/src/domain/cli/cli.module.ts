import { Module } from '@nestjs/common'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'

@Module({
  imports: [
    PlatformClientModule,
    EntityModule,
    DiscussionModule,
    UserFileModule,
    AppModule,
    JobModule,
    WorkflowModule,
    DbClusterModule,
    EntityLinkModule,
    AttachmentsFacadeModule,
  ],
  providers: [CliService],
  exports: [CliService],
})
export class CliModule {}
