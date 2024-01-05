import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceFormatType } from '../../model/entity-provenance-format.type'
import { EntityProvenanceOptionsType } from '../../model/entity-provenance-options.type'
import { EntityProvenanceResultType } from '../../model/entity-provenance-result.type'

export interface EntityProvenanceResultTransformerService<T extends EntityProvenanceFormatType> {
  transform(
    provenance: EntityProvenance,
    options?: EntityProvenanceOptionsType<T>,
  ): Promise<EntityProvenanceResultType<T>>
}
