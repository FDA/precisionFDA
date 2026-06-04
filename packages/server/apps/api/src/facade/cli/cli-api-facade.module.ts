import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { JobModule } from '@shared/domain/job/job.module'
import { PropertyModule } from '@shared/domain/property/property.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { AppFacadeModule } from '@shared/facade/app/app-facade.module'
import { AttachmentsFacadeModule } from '@shared/facade/discussion/attachments-facade.module'
import { RemoveNodesFacadeModule } from '@shared/facade/node-remove/remove-nodes-facade.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserFileApiFacadeModule } from '../user-file/user-file-api-facade.module'
import { CliDescribeEntityFacade } from './cli-describe-entity.facade'
import { CliFindNodesFacade } from './cli-find-nodes.facade'
import { CliJobScopeFacade } from './cli-job-scope.facade'
import { CliAssetsListFacade } from './cli-assets-list.facade'
import { CliDiscussionsListFacade } from './cli-discussions-list.facade'
import { CliJobsListFacade } from './cli-jobs-list.facade'
import { CliMembersListFacade } from './cli-members-list.facade'
import { CliSpacesListFacade } from './cli-spaces-list.facade'
import { CliNodeRemoveFacade } from './cli-node-remove.facade'
import { CliRunAppFacade } from './cli-run-app.facade'
import { CliTerminateJobFacade } from './cli-terminate-job.facade'

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
    SpaceModule,
    AttachmentsFacadeModule,
    RemoveNodesFacadeModule,
    PropertyModule,
    AppFacadeModule,
    UserFileApiFacadeModule,
  ],
  providers: [
    CliDescribeEntityFacade,
    CliJobScopeFacade,
    CliNodeRemoveFacade,
    CliMembersListFacade,
    CliDiscussionsListFacade,
    CliFindNodesFacade,
    CliRunAppFacade,
    CliTerminateJobFacade,
    CliSpacesListFacade,
    CliAssetsListFacade,
    CliJobsListFacade,
  ],
  exports: [
    CliDescribeEntityFacade,
    CliJobScopeFacade,
    CliNodeRemoveFacade,
    CliMembersListFacade,
    CliDiscussionsListFacade,
    CliFindNodesFacade,
    CliRunAppFacade,
    CliTerminateJobFacade,
    CliSpacesListFacade,
    CliAssetsListFacade,
    CliJobsListFacade,
  ],
})
export class CliApiFacadeModule {}
