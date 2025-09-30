import { Module } from '@nestjs/common'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { AppModule } from '@shared/domain/app/app.module'
import { JobModule } from '@shared/domain/job/job.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { SetPropertiesFacade } from '@shared/facade/property/set-properties.facade'
import { PropertyModule } from '@shared/domain/property/property.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'

@Module({
  imports: [
    UserFileModule,
    AppModule,
    JobModule,
    ComparisonModule,
    WorkflowModule,
    DbClusterModule,
    PropertyModule,
  ],
  providers: [SetPropertiesFacade],
  exports: [SetPropertiesFacade],
})
export class PropertyFacadeModule {}
