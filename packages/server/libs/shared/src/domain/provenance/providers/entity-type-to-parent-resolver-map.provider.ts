import { Provider } from '@nestjs/common'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { AppProvenanceDataService } from '@shared/domain/provenance/service/entity-data/app-provenance-data.service'
import { AssetProvenanceDataService } from '@shared/domain/provenance/service/entity-data/asset-provenance-data.service'
import { ComparisonProvenanceDataService } from '@shared/domain/provenance/service/entity-data/comparison-provenance-data.service'
import { DBClusterProvenanceDataService } from '../service/entity-data/dbcluster-provenance-data.service'
import { EntityProvenanceDataService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data.service'
import { FileProvenanceDataService } from '@shared/domain/provenance/service/entity-data/file-provenance-data.service'
import { JobProvenanceDataService } from '@shared/domain/provenance/service/entity-data/job-provenance-data.service'
import { NoteProvenanceDataService } from '../service/entity-data/note-provenance-data.service'
import { UserProvenanceDataService } from '@shared/domain/provenance/service/entity-data/user-provenance-data.service'
import { WorkflowProvenanceDataService } from '@shared/domain/provenance/service/entity-data/workflow-provenance-data.service'

export const ENTITY_TYPE_TO_PARENT_RESOLVER_MAP = 'ENTITY_TYPE_TO_PARENT_RESOLVER_MAP'

export const entityTypeToParentResolverMapProvider: Provider = {
  provide: ENTITY_TYPE_TO_PARENT_RESOLVER_MAP,
  inject: [
    AppProvenanceDataService,
    AssetProvenanceDataService,
    ComparisonProvenanceDataService,
    DBClusterProvenanceDataService,
    FileProvenanceDataService,
    JobProvenanceDataService,
    NoteProvenanceDataService,
    UserProvenanceDataService,
    WorkflowProvenanceDataService,
  ],
  useFactory: (app, asset, comparison, dbcluster, file, job, note, user, workflow) =>
    ({ file, job, user, comparison, dbcluster, note, asset, app, workflow }) satisfies {
      [T in EntityWithProvenanceType]: EntityProvenanceDataService<T>
    },
}
