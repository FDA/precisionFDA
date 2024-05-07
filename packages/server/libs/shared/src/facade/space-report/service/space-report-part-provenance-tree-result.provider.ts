import { Injectable } from '@nestjs/common'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { EntityProvenanceFormatType } from '@shared/domain/provenance/model/entity-provenance-format.type'
import { EntityProvenanceResultType } from '@shared/domain/provenance/model/entity-provenance-result.type'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import {
  SpaceReportPartProvenanceTreeHtmlResult,
  SpaceReportPartProvenanceTreeJsonResult,
} from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import { SpaceReportPartProvenanceTreeResultMeta } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result-meta'
import { SpaceReportPartTypeForResult } from '@shared/domain/space-report/model/space-report-part-type-for-result'
import { SpaceReportPartProvenanceTreeResult } from '@shared/domain/space-report/model/space-report-part-type-to-result.map'
import { SpaceReportPartResultProvider } from './space-report-part-result.provider'

@Injectable()
export abstract class SpaceReportPartProvenanceTreeResultProvider<
  T extends SpaceReportPartTypeForResult<SpaceReportPartProvenanceTreeResult>,
> extends SpaceReportPartResultProvider<T> {
  constructor(private readonly entityProvenanceService: EntityProvenanceService) {
    super()
  }

  protected abstract type: T

  protected abstract getMeta(entity: EntityInstance<T>): SpaceReportPartProvenanceTreeResultMeta

  protected async getJsonResult(
    entity: EntityInstance<T>,
  ): Promise<SpaceReportPartProvenanceTreeJsonResult> {
    return {
      ...this.getMeta(entity),
      provenance: await this.getProvenance(entity, 'raw'),
    }
  }

  protected async getHtmlResult(
    entity: EntityInstance<T>,
  ): Promise<SpaceReportPartProvenanceTreeHtmlResult> {
    return {
      ...this.getMeta(entity),
      svg: await this.getProvenance(entity, 'svg'),
    }
  }

  private async getProvenance<F extends EntityProvenanceFormatType>(
    entity: EntityInstance<T>,
    provenanceFormat: F,
  ): Promise<EntityProvenanceResultType<F>> {
    const entityProvenanceSource = { type: this.type, entity } as EntityProvenanceSourceUnion
    return await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      provenanceFormat,
      { omitStyles: true },
    )
  }
}
