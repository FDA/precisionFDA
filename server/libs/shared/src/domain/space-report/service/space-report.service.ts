import { QueryOrder } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { SCOPE } from '@shared/types/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ArrayUtils } from '@shared/utils/array.utils'
import { SpaceReportPart } from '../entity/space-report-part.entity'
import { SpaceReport } from '../entity/space-report.entity'
import { BatchComplete } from '../model/batch-complete'
import { SpaceReportPartSource } from '../model/space-report-part-source'
import { SpaceReportPartSourceEntity } from '../model/space-report-part-source-entity'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'
import { SpaceReportPartService } from './part/space-report-part.service'
import { SpaceReportResultService } from './space-report-result.service'

@Injectable()
export class SpaceReportService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportPartService: SpaceReportPartService,
    private readonly spaceReportResultService: SpaceReportResultService,
    private readonly user: UserContext,
  ) {}

  async createReport(spaceId: number) {
    if (spaceId == null) {
      throw new InvalidStateError('Space id is required for creating a report')
    }

    return await this.em.transactional(async () => {
      const space = await this.getSpaceForUserValidated(spaceId)
      const spaceReport = new SpaceReport(this.em.getReference(User, this.user.id))
      spaceReport.space = space
      spaceReport.reportParts.add(await this.createSpaceReportParts(space.scope))

      if (ArrayUtils.isEmpty(spaceReport.reportParts.getItems())) {
        throw new InvalidStateError(
          'Report not generated: No entities to report on in this space',
        )
      }

      this.em.persist(spaceReport)

      return spaceReport
    })
  }

  async getReports(ids: number[]) {
    return await this.em.find(SpaceReport, ids)
  }

  async getReportsForSpace(spaceId: number) {
    return await this.em.transactional(async () => {
      const space = await this.getSpaceForUserValidated(spaceId)
      const reports = await this.em.find(
        SpaceReport,
        { space },
        {
          orderBy: { createdAt: QueryOrder.desc },
          populate: ['resultFile'],
        },
      )

      return reports.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        state: r.state,
        resultFile: r.resultFile,
      }))
    })
  }

  async deleteReports(reports: SpaceReport[]) {
    if (ArrayUtils.isEmpty(reports)) {
      return []
    }

    await this.em.transactional(async () => this.em.remove(reports))

    return reports.map((r) => r.id)
  }

  async completePartsBatch(batches: BatchComplete[]) {
    return this.spaceReportPartService.completeBatch(batches)
  }

  async generateResult(report: SpaceReport, styles?: string) {
    return await this.spaceReportResultService.generateResult(report, styles)
  }

  async hasAllBatchesDone(reportId: number) {
    const notDoneTask = await this.em.findOne(SpaceReportPart, {
      spaceReport: reportId,
      state: { $ne: 'DONE' },
    })

    return !Boolean(notDoneTask)
  }

  private async getSpaceForUserValidated(spaceId: number) {
    const spaces = await this.getSpacesForUser([spaceId])

    if (ArrayUtils.isEmpty(spaces)) {
      throw new NotFoundError('Space not found')
    }

    return spaces[0]
  }

  async getSpacesForUser(spaceIds: number[]) {
    return await this.em
      .createQueryBuilder(Space, 'space')
      .joinAndSelect('space.spaceMemberships', 'membership')
      .joinAndSelect('membership.user', 'user')
      .where({ 'space.id': spaceIds, 'user.id': this.user.id })
      .getResult()
  }

  getSpaceReportPartMetaData<T extends SpaceReportPartSourceType>(
    source: SpaceReportPartSourceEntity<T>,
  ) {
    return this.spaceReportPartService.getSpaceReportPartMetaData(source)
  }

  private async createSpaceReportParts(scope: SCOPE): Promise<SpaceReportPart[]> {
    const spaceFiles = await this.em.find(UserFile, { scope })
    const spaceApps = await this.em.find(App, { scope })
    const spaceJobs = await this.em.find(Job, { scope })
    const spaceAssets = await this.em.find(Asset, { scope })
    const spaceWorkflows = await this.em.find(Workflow, { scope })
    const reportPartSources: SpaceReportPartSource[] = [
      ...spaceFiles.map((f) => ({ type: 'file' as const, id: f.id })),
      ...spaceApps.map((a) => ({ type: 'app' as const, id: a.id })),
      ...spaceJobs.map((j) => ({ type: 'job' as const, id: j.id })),
      ...spaceAssets.map((a) => ({ type: 'asset' as const, id: a.id })),
      ...spaceWorkflows.map((w) => ({ type: 'workflow' as const, id: w.id })),
    ]

    return this.spaceReportPartService.createReportParts(reportPartSources)
  }
}
