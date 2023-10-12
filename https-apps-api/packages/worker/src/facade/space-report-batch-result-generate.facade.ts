import { SqlEntityManager } from '@mikro-orm/mysql'
import { app, ArrayUtils, errors, job, provenance, queue, spaceReport, userFile } from '@pfda/https-apps-shared'
import { UserCtx } from '@pfda/https-apps-shared/src/types'

export class SpaceReportBatchResultGenerateFacade {
  private readonly em
  private readonly spaceReportService
  private readonly entityProvenanceService
  private readonly sourceTypeToRepositoryMap
  private readonly currentUser

  constructor(
    em: SqlEntityManager,
    currentUser: UserCtx,
    spaceReportService: spaceReport.SpaceReportService,
    entityProvenanceService: provenance.EntityProvenanceService,
  ) {
    this.spaceReportService = spaceReportService
    this.entityProvenanceService = entityProvenanceService
    this.em = em
    this.currentUser = currentUser
    this.sourceTypeToRepositoryMap = {
      file: em.getRepository(userFile.UserFile),
      app: em.getRepository(app.App),
      job: em.getRepository(job.Job),
    } satisfies Record<spaceReport.SpaceReportPartSourceType, object>
  }

  async generate(ids: number[]) {
    const reportId = await this.generateAndSaveResults(ids)

    if (reportId == null) {
      return
    }

    if (await this.spaceReportService.hasPendingBatch(reportId)) {
      return
    }

    await queue.createGenerateSpaceReportResultTask(reportId, this.currentUser)
  }

  private async generateAndSaveResults(ids: number[]) {
    return await this.em.transactional(async tem => {
      const reportParts = await tem.find(spaceReport.SpaceReportPart, ids)

      if (ArrayUtils.isEmpty(reportParts)) {
        return
      }

      const reportPartSources: Record<spaceReport.SpaceReportPartSourceType, spaceReport.SpaceReportPart[]> = reportParts
        .reduce((acc, rp) => {
          acc[rp.sourceType].push(rp)
          return acc
        }, { file: [], app: [], job: [] })

      const types = Object.keys(reportPartSources) as spaceReport.SpaceReportPartSourceType[]
      const batchPromises = types
        .map(entityType => this.getBatchCompletes(entityType, reportPartSources[entityType]))
      const batchCompletes = (await Promise.all(batchPromises)).flat(1)

      await this.spaceReportService.completePartsBatch(await Promise.all(batchCompletes))

      return reportParts[0].spaceReport.id
    })
  }

  private async getBatchCompletes(
    type: spaceReport.SpaceReportPartSourceType,
    reportParts: spaceReport.SpaceReportPart[],
  ): Promise<spaceReport.BatchComplete[]> {
    const entities = await this.sourceTypeToRepositoryMap[type]
      .find(reportParts.map(rps => rps.sourceId))

    // TODO - test
    this.deletePartsWithMissingSources(entities.map(e => e.id), reportParts)

    return await Promise.all(entities.map(async entity => {
      const entityProvenanceSource = { type, entity } as provenance.EntityProvenanceSourceUnion
      const entityProvenance = await this.entityProvenanceService.getEntityProvenance(entityProvenanceSource, 'svg')

      const reportPart = reportParts.find(srp => entity.id === srp.sourceId)
      return {
        id: reportPart.id,
        result: {
          ...this.getResultMetaData(entityProvenanceSource),
          svg: entityProvenance,
        },
      }
    }))
  }

  private deletePartsWithMissingSources(sourcesIds: number[], reportParts: spaceReport.SpaceReportPart[]) {
    const entityIdsSet = new Set(sourcesIds)

    const partsWithoutSources = reportParts.filter(rps => !entityIdsSet.has(rps.sourceId))

    if (ArrayUtils.isEmpty(partsWithoutSources)) {
      return
    }

    this.em.remove(partsWithoutSources)
  }

  private getResultMetaData(provenanceSource: provenance.EntityProvenanceSourceUnion) {
    const supportedSources = ['file', 'app', 'job']

    if (!supportedSources.includes(provenanceSource.type)) {
      throw new errors.InvalidStateError(`Unsupported space report part type - ${provenanceSource.type}`)
    }

    return this.spaceReportService.getSpaceReportPartMetaData(provenanceSource as spaceReport.SpaceReportPartSourceEntityUnion)
  }
}
