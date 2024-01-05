import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { ArrayUtils } from '@shared'
import { SOURCE_TYPE_TO_META_PROVIDER_MAP } from '@shared/domain/space-report/providers/source-type-to-meta-provider-map.provider'
import { SpaceReportPart } from '../../entity/space-report-part.entity'
import type { BatchComplete } from '../../model/batch-complete'
import type { SpaceReportPartSource } from '../../model/space-report-part-source'
import type { SpaceReportPartSourceEntity } from '../../model/space-report-part-source-entity'
import type { SpaceReportPartSourceType } from '../../model/space-report-part-source.type'
import type { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'

@Injectable()
export class SpaceReportPartService {
  // TODO(PFDA-4833) - use IOC and create unit tests after that
  constructor(
    private readonly em: SqlEntityManager,
    @Inject(SOURCE_TYPE_TO_META_PROVIDER_MAP)
    private readonly SOURCE_TYPE_TO_META_PROVIDER: {
      [T in SpaceReportPartSourceType]: SpaceReportPartResultMetaProvider<T>
    },
  ) {}

  createReportParts(sources: SpaceReportPartSource[]) {
    return sources?.map((f) => this.createReportPart(f))
  }

  async completeBatch(batches: BatchComplete[]) {
    if (ArrayUtils.isEmpty(batches)) {
      return []
    }

    const batchLookup = batches.reduce<Record<number, BatchComplete>>((acc, batch) => {
      acc[batch.id] = batch
      return acc
    }, {})

    return await this.em.transactional(async () => {
      const reportParts = await this.em.find(
        SpaceReportPart,
        batches.map((b) => b.id),
      )

      reportParts.forEach((rp) => {
        rp.result = batchLookup[rp.id].result
        rp.state = 'DONE'
      })

      return reportParts
    })
  }

  getSpaceReportPartMetaData<T extends SpaceReportPartSourceType>(
    source: SpaceReportPartSourceEntity<T>,
  ) {
    return this.SOURCE_TYPE_TO_META_PROVIDER[source.type].getResultMeta(source.entity)
  }

  private createReportPart(source: SpaceReportPartSource): SpaceReportPart {
    const reportPart = new SpaceReportPart()
    reportPart.sourceId = source?.id
    reportPart.sourceType = source?.type

    return reportPart
  }
}
