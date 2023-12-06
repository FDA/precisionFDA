import type { SqlEntityManager } from '@mikro-orm/mysql'
import { ArrayUtils } from '../../../..'
import { SpaceReportPart } from '../../entity/space-report-part.entity'
import type { BatchComplete } from '../../model/batch-complete'
import type { SpaceReportPartSource } from '../../model/space-report-part-source'
import type { SpaceReportPartSourceEntity } from '../../model/space-report-part-source-entity'
import type { SpaceReportPartSourceType } from '../../model/space-report-part-source.type'
import { SpaceReportPartAppResultMetaProvider } from './space-report-part-app-result-meta.provider'
import { SpaceReportPartAssetResultMetaProvider } from './space-report-part-asset-result-meta.provider'
import { SpaceReportPartFileResultMetaProvider } from './space-report-part-file-result-meta.provider'
import { SpaceReportPartJobResultMetaProvider } from './space-report-part-job-result-meta.provider'
import type { SpaceReportPartResultMetaProvider } from './space-report-part-result-meta.provider'
import { SpaceReportPartWorkflowResultMetaProvider } from './space-report-part-workflow-result-meta.provider'

export class SpaceReportPartService {
  private readonly em

  // TODO(PFDA-4701) - use IOC and create unit tests after that
  private readonly sourceTypeToMetaProviderMap: { [ T in SpaceReportPartSourceType ]: SpaceReportPartResultMetaProvider<T> } = {
    job: new SpaceReportPartJobResultMetaProvider(),
    file: new SpaceReportPartFileResultMetaProvider(),
    app: new SpaceReportPartAppResultMetaProvider(),
    asset: new SpaceReportPartAssetResultMetaProvider(),
    workflow: new SpaceReportPartWorkflowResultMetaProvider(),
  }

  constructor(em: SqlEntityManager) {
    this.em = em
  }

  createReportParts(sources: SpaceReportPartSource[]) {
    return sources?.map(f => this.createReportPart(f))
  }

  async completeBatch(batches: BatchComplete[]) {
    if (ArrayUtils.isEmpty(batches)) {
      return []
    }

    const batchLookup = batches.reduce<Record<number, BatchComplete>>((acc, batch) => {
      acc[batch.id] = batch
      return acc
    }, {})

    return await this.em.transactional(async tem => {
      const reportParts = await tem.find(SpaceReportPart, batches.map(b => b.id))

      reportParts.forEach(rp => {
        rp.result = batchLookup[rp.id].result
        rp.state = 'DONE'
      })

      return reportParts
    })
  }

  async setReportPartsError(ids: number[]) {
    await this.em.nativeUpdate(SpaceReportPart, { id: { $in: ids } }, { state: 'ERROR' })
  }

  getSpaceReportPartMetaData<T extends SpaceReportPartSourceType>(source: SpaceReportPartSourceEntity<T>) {
    return this.sourceTypeToMetaProviderMap[source.type].getResultMeta(source.entity)
  }

  private createReportPart(source: SpaceReportPartSource): SpaceReportPart {
    const reportPart = new SpaceReportPart()
    reportPart.sourceId = source?.id
    reportPart.sourceType = source?.type

    return reportPart
  }
}
