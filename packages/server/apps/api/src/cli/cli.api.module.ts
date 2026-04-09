import { Module } from '@nestjs/common'
import { CliExchangeFacadeModule } from '@shared/facade/cli-exchange/cli-exchange-facade.module'
import { PropertyFacadeModule } from '@shared/facade/property/property-facade.module'
import { CliApiFacadeModule } from '../facade/cli/cli-api-facade.module'
import { CliDbClusterPasswordFacadeModule } from '../facade/db-cluster/password-facade/cli-db-cluster-password-facade.module'
import { DiscussionApiFacadeModule } from '../facade/discussion/discussion-api-facade.module'
import { CliController } from './cli.controller'
import { CliAssetsController } from './cli-assets.controller'
import { CliDbClustersController } from './cli-dbclusters.controller'
import { CliDescribeController } from './cli-describe.controller'
import { CliDiscussionsController } from './cli-discussions.controller'
import { CliFilesController } from './cli-files.controller'
import { CliJobsController } from './cli-jobs.controller'
import { CliNodesController } from './cli-nodes.controller'
import { CliSpacesController } from './cli-spaces.controller'

@Module({
  imports: [
    CliApiFacadeModule,
    CliDbClusterPasswordFacadeModule,
    DiscussionApiFacadeModule,
    PropertyFacadeModule,
    CliExchangeFacadeModule,
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
    CliSpacesController,
  ],
})
export class CliApiModule {}
