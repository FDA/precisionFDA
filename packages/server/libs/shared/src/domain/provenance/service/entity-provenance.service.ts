import { Injectable } from '@nestjs/common'
import * as errors from '../../../errors'
import { EntityProvenanceFormatType } from '../model/entity-provenance-format.type'
import { EntityProvenanceOptionsType } from '../model/entity-provenance-options.type'
import { EntityProvenanceResultType } from '../model/entity-provenance-result.type'
import { EntityProvenanceSourceUnion } from '../model/entity-provenance-source-union'
import { EntityProvenanceDataProviderService } from './entity-data/entity-provenance-data-provider.service'
import { EntityProvenanceSvgResultTransformerService } from './result-transform/entity-provenance-svg-result-transformer.service'

@Injectable()
export class EntityProvenanceService {
  constructor(
    private readonly entityProvenanceDataProviderService: EntityProvenanceDataProviderService,
    private readonly entityProvenanceSvgResultTransformerService: EntityProvenanceSvgResultTransformerService,
  ) {}

  async getEntityProvenance<T extends EntityProvenanceFormatType>(
    source: EntityProvenanceSourceUnion,
    format: T,
    options?: EntityProvenanceOptionsType<T>,
  ): Promise<EntityProvenanceResultType<T>> {
    const provenanceData = await this.entityProvenanceDataProviderService.getData(source)

    if (format === 'raw') {
      return provenanceData as EntityProvenanceResultType<T>
    }

    if (format === 'svg') {
      return (await this.entityProvenanceSvgResultTransformerService.transform(
        provenanceData,
        options,
      )) as EntityProvenanceResultType<T>
    }

    throw new errors.InvalidStateError('Generate entity provenance - Unsupported format type.')
  }

  async getSvgStyles() {
    return this.entityProvenanceSvgResultTransformerService.getStyles()
  }
}
