import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ArrayUtils } from '@shared/utils/array.utils'
import { SpaceReportPart } from '../../entity/space-report-part.entity'
import type { BatchComplete } from '../../model/batch-complete'
import type { SpaceReportPartSource } from '../../model/space-report-part-source'

@Injectable()
export class SpaceReportPartService {
  constructor(private readonly em: SqlEntityManager) {}

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

  private createReportPart(source: SpaceReportPartSource): SpaceReportPart {
    const reportPart = new SpaceReportPart()
    reportPart.sourceId = source?.id
    reportPart.sourceType = source?.type

    return reportPart
  }
}
