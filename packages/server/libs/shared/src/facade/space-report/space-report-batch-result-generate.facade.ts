import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { BatchComplete } from '@shared/domain/space-report/model/batch-complete'
import {
  SpaceReportPartSourceType,
  spaceReportPartSourceTypes,
} from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportQueueJobProducer } from '@shared/domain/space-report/producer/space-report-queue-job.producer'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { InvalidStateError } from '@shared/errors'
import { SOURCE_TYPE_TO_RESULT_PROVIDER_MAP } from '@shared/facade/space-report/provider/source-type-to-result-provider-map.provider'
import { SpaceReportPartResultProvider } from '@shared/facade/space-report/service/space-report-part-result.provider'
import { ArrayUtils } from '@shared/utils/array.utils'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class SpaceReportBatchResultGenerateFacade {
  private readonly sourceTypeToRepositoryMap

  constructor(
    private readonly em: SqlEntityManager,
    private readonly currentUser: UserContext,
    private readonly spaceReportService: SpaceReportService,
    private readonly spaceReportQueueJobProducer: SpaceReportQueueJobProducer,
    @Inject(SOURCE_TYPE_TO_RESULT_PROVIDER_MAP)
    private readonly SOURCE_TYPE_TO_RESULT_PROVIDER: {
      [T in SpaceReportPartSourceType]: SpaceReportPartResultProvider<T>
    },
  ) {
    this.sourceTypeToRepositoryMap = {
      file: em.getRepository(UserFile),
      app: em.getRepository(App),
      job: em.getRepository(Job),
      asset: em.getRepository(Asset),
      workflow: em.getRepository(Workflow),
      user: em.getRepository(User),
      discussion: em.getRepository(Discussion),
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

    await this.spaceReportQueueJobProducer.createResultTask(reportId, this.currentUser)
  }

  private async generateAndSaveResults(ids: number[]) {
    return await this.em.transactional(async () => {
      const reportParts = await this.em.find(SpaceReportPart, ids, { populate: ['spaceReport'] })

      if (ArrayUtils.isEmpty(reportParts)) {
        return
      }

      const reportPartSources: Record<SpaceReportPartSourceType, SpaceReportPart[]> =
        reportParts.reduce(
          (acc: Record<SpaceReportPartSourceType, SpaceReportPart[]>, rp) => {
            acc[rp.sourceType].push(rp)
            return acc
          },
          { file: [], app: [], job: [], workflow: [], asset: [], user: [], discussion: [] },
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

    const supportedSources: EntityType[] = spaceReportPartSourceTypes

    if (!supportedSources.includes(type)) {
      throw new InvalidStateError(`Unsupported space report part type - ${type}`)
    }

    const entities = await this.sourceTypeToRepositoryMap[type].find(
      reportParts.map((rps) => rps.sourceId),
    )

    this.deletePartsWithMissingSources(
      entities.map((e) => e.id),
      reportParts,
    )

    const report = reportParts[0].spaceReport.getEntity()

    const space = EntityScopeUtils.isSpaceScope(report.scope)
      ? await this.em.findOneOrFail(Space, EntityScopeUtils.getSpaceIdFromScope(report.scope), {
          populate: ['spaceMemberships'],
        })
      : null

    return await Promise.all(
      entities.map(async (entity) => {
        const reportPart = reportParts.find((srp) => entity.id === srp.sourceId)!

        return {
          id: reportPart.id,
          result: await this.SOURCE_TYPE_TO_RESULT_PROVIDER[type].getResult(
            entity,
            space,
            report.format,
          ),
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
}
