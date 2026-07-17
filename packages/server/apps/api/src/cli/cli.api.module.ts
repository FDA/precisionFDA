import { Module } from '@nestjs/common'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { CliExchangeFacadeModule } from '@shared/facade/cli-exchange/cli-exchange-facade.module'
import { UserFileCreateFacadeModule } from '@shared/facade/file-create/user-file-create-facade.module'
import { PropertyFacadeModule } from '@shared/facade/property/property-facade.module'
import { CliApiFacadeModule } from '../facade/cli/cli-api-facade.module'
import { CliDbClusterPasswordFacadeModule } from '../facade/db-cluster/password-facade/cli-db-cluster-password-facade.module'
import { DiscussionApiFacadeModule } from '../facade/discussion/discussion-api-facade.module'
import { UserFileApiFacadeModule } from '../facade/user-file/user-file-api-facade.module'
import { CliController } from './cli.controller'
import { CliAssetsController } from './cli-assets.controller'
import { CliDbClustersController } from './cli-db-clusters.controller'
import { CliDescribeController } from './cli-describe.controller'
import { CliDiscussionsController } from './cli-discussions.controller'
import { CliFilesController } from './cli-files.controller'
import { CliJobsController } from './cli-jobs.controller'
import { CliNodesController } from './cli-nodes.controller'
import { CliRepliesController } from './cli-replies.controller'
import { CliSpacesController } from './cli-spaces.controller'

@Module({
  imports: [
    CliApiFacadeModule,
    CliDbClusterPasswordFacadeModule,
    DiscussionApiFacadeModule,
    DiscussionModule,
    PropertyFacadeModule,
    CliExchangeFacadeModule,
    UserFileApiFacadeModule,
    UserFileCreateFacadeModule,
  ],
  controllers: [
    CliAssetsController,
    CliFilesController,
    CliController,
    CliDbClustersController,
    CliDescribeController,
    CliDiscussionsController,
    CliJobsController,
    CliNodesController,
    CliRepliesController,
    CliSpacesController,
  ],
})
export class CliApiModule {}
