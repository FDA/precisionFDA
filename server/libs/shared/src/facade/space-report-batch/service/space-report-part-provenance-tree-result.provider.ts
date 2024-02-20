import { Injectable } from '@nestjs/common'
import { entityTypeToEntityMap } from '@shared/domain/entity/domain/entity-type-to-entity.map'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPartProvenanceTreeResult } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { SpaceReportPartTypeForResult } from '@shared/domain/space-report/model/space-report-part-type-for-result'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

@Injectable()
export abstract class SpaceReportPartProvenanceTreeResultProvider<
  T extends SpaceReportPartTypeForResult<SpaceReportPartProvenanceTreeResult>,
> implements SpaceReportPartResultProvider<T>
{
  constructor(private readonly entityProvenanceService: EntityProvenanceService) {}

  protected abstract type: T

  protected abstract getMeta(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
  ): SpaceReportPartProvenanceTreeResultMeta

  async getResult(
    entity: InstanceType<(typeof entityTypeToEntityMap)[T]>,
  ): Promise<SpaceReportPartProvenanceTreeResult> {
    const entityProvenanceSource = { type: this.type, entity } as EntityProvenanceSourceUnion
    const entityProvenance = await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      'svg',
      { omitStyles: true },
    )

    return {
      ...this.getMeta(entity),
      svg: entityProvenance,
    }
  }
}
