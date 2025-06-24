import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'

import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { CliDescribeEntityFacade } from './cli-describe-entity.facade'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'
import { CliJobScopeFacade } from './cli-job-scope.facade'
import { CliNodeRemoveFacade } from './cli-node-remove.facade'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'

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
    AttachmentsFacadeModule,
    RemoveNodesFacadeModule,
  ],
  providers: [CliDescribeEntityFacade, CliJobScopeFacade, CliNodeRemoveFacade],
  exports: [CliDescribeEntityFacade, CliJobScopeFacade, CliNodeRemoveFacade],
})
export class CliApiFacadeModule {}
