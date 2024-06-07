import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { entityTypeToParentResolverMapProvider } from '@shared/domain/provenance/providers/entity-type-to-parent-resolver-map.provider'
import { AppProvenanceDataService } from '@shared/domain/provenance/service/entity-data/app-provenance-data.service'
import { AssetProvenanceDataService } from '@shared/domain/provenance/service/entity-data/asset-provenance-data.service'
import { ComparisonProvenanceDataService } from '@shared/domain/provenance/service/entity-data/comparison-provenance-data.service'
import { DBClusterProvenanceDataService } from './dbcluster-provenance-data.service'
import { EntityProvenanceDataProviderService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data-provider.service'
import { FileProvenanceDataService } from '@shared/domain/provenance/service/entity-data/file-provenance-data.service'
import { JobProvenanceDataService } from '@shared/domain/provenance/service/entity-data/job-provenance-data.service'
import { NoteProvenanceDataService } from './note-provenance-data.service'
import { UserProvenanceDataService } from '@shared/domain/provenance/service/entity-data/user-provenance-data.service'
import { WorkflowProvenanceDataService } from '@shared/domain/provenance/service/entity-data/workflow-provenance-data.service'
import { WorkflowModule } from '@shared/domain/workflow/workflow.module'

@Module({
  imports: [WorkflowModule, EntityModule],
  providers: [
    AppProvenanceDataService,
    AssetProvenanceDataService,
    ComparisonProvenanceDataService,
    DBClusterProvenanceDataService,
    FileProvenanceDataService,
    JobProvenanceDataService,
    NoteProvenanceDataService,
    UserProvenanceDataService,
    WorkflowProvenanceDataService,
    entityTypeToParentResolverMapProvider,
    EntityProvenanceDataProviderService,
  ],
  exports: [EntityProvenanceDataProviderService],
})
export class EntityProvenanceDataProviderModule {}
