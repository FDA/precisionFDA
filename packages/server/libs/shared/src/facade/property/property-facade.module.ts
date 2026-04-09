import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { ComparisonModule } from '@shared/domain/comparison/comparison.module'
import { DbClusterModule } from '@shared/domain/db-cluster/db-cluster.module'
import { JobModule } from '@shared/domain/job/job.module'
import { PropertyModule } from '@shared/domain/property/property.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'
import { SetPropertiesFacade } from '@shared/facade/property/set-properties.facade'

@Module({
  imports: [UserFileModule, AppModule, JobModule, ComparisonModule, WorkflowModule, DbClusterModule, PropertyModule],
  providers: [SetPropertiesFacade],
  exports: [SetPropertiesFacade],
})
export class PropertyFacadeModule {}
