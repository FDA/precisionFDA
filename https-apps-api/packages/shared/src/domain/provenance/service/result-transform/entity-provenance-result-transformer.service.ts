import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceFormatType } from '../../model/entity-provenance-format.type'
import { EntityProvenanceResultType } from '../../model/entity-provenance-result.type'

export interface EntityProvenanceResultTransformerService<T extends EntityProvenanceFormatType> {
  transform(provenance: EntityProvenance): Promise<EntityProvenanceResultType<T>>
}
