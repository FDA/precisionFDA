import { SqlEntityManager } from '@mikro-orm/mysql'
import * as errors from '../../../errors'
import { EntityProvenanceFormatType } from '../model/entity-provenance-format.type'
import { EntityProvenanceResultType } from '../model/entity-provenance-result.type'
import { EntityProvenanceSourceUnion } from '../model/entity-provenance-source-union'
import { EntityProvenanceDataProviderService } from './entity-data/entity-provenance-data-provider.service'
import {
  EntityProvenanceSvgResultTransformerService,
} from './result-transform/entity-provenance-svg-result-transformer.service'

export class EntityProvenanceService {
  private readonly entityProvenanceDataProviderService: EntityProvenanceDataProviderService
  private readonly entityProvenanceSvgResultTransformerService: EntityProvenanceSvgResultTransformerService

  constructor(
    entityProvenanceDataProviderService: EntityProvenanceDataProviderService,
    entityProvenanceSvgResultTransformerService: EntityProvenanceSvgResultTransformerService,
  ) {
    this.entityProvenanceDataProviderService = entityProvenanceDataProviderService
    this.entityProvenanceSvgResultTransformerService = entityProvenanceSvgResultTransformerService
  }

  async getEntityProvenance<T extends EntityProvenanceFormatType>(
    source: EntityProvenanceSourceUnion,
    format: T,
  ): Promise<EntityProvenanceResultType<T>> {
    const provenanceData = await this.entityProvenanceDataProviderService.getEntityProvenanceData(source)

    if (format === 'raw') {
      return provenanceData as EntityProvenanceResultType<T>
    }

    if (format === 'svg') {
      return await this.entityProvenanceSvgResultTransformerService.transform(provenanceData) as EntityProvenanceResultType<T>
    }

    throw new errors.InvalidStateError('Generate entity provenance - Unsupported format type.')
  }

  // TODO - Remove with IOC
  static getInstance(em: SqlEntityManager) {
    const entityProvenanceDataProviderService = new EntityProvenanceDataProviderService(em)
    const entityProvenanceSvgResultTransformerService = new EntityProvenanceSvgResultTransformerService()

    return new EntityProvenanceService(
      entityProvenanceDataProviderService,
      entityProvenanceSvgResultTransformerService,
    )
  }
}
