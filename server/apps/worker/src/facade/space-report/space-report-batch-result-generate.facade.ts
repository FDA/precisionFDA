import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import {
  app,
  ArrayUtils,
  entity as entityDomain,
  errors,
  job,
  queue,
  UserContext,
  userFile,
  workflow,
} from '@shared'
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { BatchComplete } from '@shared/domain/space-report/model/batch-complete'
import { SpaceReportPartSourceEntityUnion } from '@shared/domain/space-report/model/space-report-part-source-entity-union'
import {
  SpaceReportPartSourceType,
  spaceReportPartSourceTypes,
} from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'

@Injectable()
export class SpaceReportBatchResultGenerateFacade {
  private readonly sourceTypeToRepositoryMap

  constructor(
    private readonly em: SqlEntityManager,
    private readonly currentUser: UserContext,
    private readonly spaceReportService: SpaceReportService,
    private readonly entityProvenanceService: EntityProvenanceService,
  ) {
    this.sourceTypeToRepositoryMap = {
      file: em.getRepository(userFile.UserFile),
      app: em.getRepository(app.App),
      job: em.getRepository(job.Job),
      asset: em.getRepository(userFile.Asset),
      workflow: em.getRepository(workflow.Workflow),
    } satisfies Record<SpaceReportPartSourceType, object>
  }

  async generate(ids: number[]) {
    const reportId = await this.generateAndSaveResults(ids)

    if (reportId == null) {
      return
    }

    if (!(await this.spaceReportService.hasAllBatchesDone(reportId))) {
      return
    }

    await queue.createGenerateSpaceReportResultTask(reportId, this.currentUser)
  }

  private async generateAndSaveResults(ids: number[]) {
    return await this.em.transactional(async () => {
      const reportParts = await this.em.find(SpaceReportPart, ids)

      if (ArrayUtils.isEmpty(reportParts)) {
        return
      }

      const reportPartSources: Record<SpaceReportPartSourceType, SpaceReportPart[]> =
        reportParts.reduce(
          (acc: Record<SpaceReportPartSourceType, SpaceReportPart[]>, rp) => {
            acc[rp.sourceType].push(rp)
            return acc
          },
          { file: [], app: [], job: [], workflow: [], asset: [] },
        )

      const types = Object.keys(reportPartSources) as SpaceReportPartSourceType[]
      const batchPromises = types.map((entityType) =>
        this.getBatchCompletes(entityType, reportPartSources[entityType]),
      )
      const batchCompletes = (await Promise.all(batchPromises)).flat(1)

      await this.spaceReportService.completePartsBatch(await Promise.all(batchCompletes))

      return reportParts[0].spaceReport.id
    })
  }

  private async getBatchCompletes(
    type: SpaceReportPartSourceType,
    reportParts: SpaceReportPart[],
  ): Promise<BatchComplete[]> {
    if (ArrayUtils.isEmpty(reportParts)) {
      return []
    }

    const entities = await this.sourceTypeToRepositoryMap[type].find(
      reportParts.map((rps) => rps.sourceId),
    )

    this.deletePartsWithMissingSources(
      entities.map((e) => e.id),
      reportParts,
    )

    return await Promise.all(
      entities.map(async (entity) => {
        const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
        const metaData = this.getResultMetaData(entityProvenanceSource)
        const entityProvenance = await this.entityProvenanceService.getEntityProvenance(
          entityProvenanceSource,
          'svg',
          { omitStyles: true },
        )

        const reportPart = reportParts.find((srp) => entity.id === srp.sourceId)!
        return {
          id: reportPart.id,
          result: {
            ...metaData,
            svg: entityProvenance,
          },
        }
      }),
    )
  }

  private deletePartsWithMissingSources(sourcesIds: number[], reportParts: SpaceReportPart[]) {
    const entityIdsSet = new Set(sourcesIds)

    const partsWithoutSources = reportParts.filter((rps) => !entityIdsSet.has(rps.sourceId))

    if (ArrayUtils.isEmpty(partsWithoutSources)) {
      return
    }

    this.em.remove(partsWithoutSources)
  }

  private getResultMetaData(provenanceSource: EntityProvenanceSourceUnion) {
    const supportedSources: entityDomain.EntityType[] = spaceReportPartSourceTypes

    if (!supportedSources.includes(provenanceSource.type)) {
      throw new errors.InvalidStateError(
        `Unsupported space report part type - ${provenanceSource.type}`,
      )
    }

    return this.spaceReportService.getSpaceReportPartMetaData(
      provenanceSource as SpaceReportPartSourceEntityUnion,
    )
  }
}
