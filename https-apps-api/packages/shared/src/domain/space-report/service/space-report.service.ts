import { QueryOrder } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { ArrayUtils, errors } from '../../..'
import { App } from '../../app'
import { Job } from '../../job'
import { Space } from '../../space'
import { User } from '../../user'
import { Asset, UserFile } from '../../user-file'
import { Workflow } from '../../workflow'
import { SpaceReportPart } from '../entity/space-report-part.entity'
import { SpaceReport } from '../entity/space-report.entity'
import { BatchComplete } from '../model/batch-complete'
import { SpaceReportPartSource } from '../model/space-report-part-source'
import { SpaceReportPartSourceEntity } from '../model/space-report-part-source-entity'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'
import { SpaceReportPartService } from './part/space-report-part.service'
import { SpaceReportResultService } from './space-report-result.service'

export class SpaceReportService {
  private readonly em
  private readonly spaceReportPartService
  private readonly spaceReportResultService

  constructor(
    em: SqlEntityManager,
    spaceReportPartService: SpaceReportPartService,
    spaceReportResultService: SpaceReportResultService,
  ) {
    this.em = em
    this.spaceReportPartService = spaceReportPartService
    this.spaceReportResultService = spaceReportResultService
  }

  // TODO - get the current user from the IOC
  async createReport(spaceId: number, user: User) {
    if (spaceId == null) {
      throw new errors.InvalidStateError('Space id is required for creating a report')
    }

    return await this.em.transactional(async tem => {
      const space = await this.getSpaceForUserValidated(spaceId, user)
      const spaceReport = new SpaceReport(user)
      spaceReport.space = space
      spaceReport.reportParts.add(await this.createSpaceReportParts(spaceReport))

      if (ArrayUtils.isEmpty(spaceReport.reportParts.getItems())) {
        throw new errors.InvalidStateError('Report not generated: No entities to report on in this space')
      }

      tem.persist(spaceReport)

      return spaceReport
    })
  }

  async getReports(ids: number[]) {
    return await this.em.transactional(tm => tm.find(SpaceReport, ids))
  }

  async getReportsForSpace(spaceId: number, user: User) {
    return await this.em.transactional(async tem => {
      const space = await this.getSpaceForUserValidated(spaceId, user)
      const reports = await tem.find(
        SpaceReport,
        { space },
        {
          orderBy: { createdAt: QueryOrder.desc },
          populate: ['resultFile'],
        },
      )

      return reports.map(r => ({
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

    const ids = reports.map(r => r.id)

    await this.em.transactional(async tm => tm.remove(reports))

    return ids
  }

  async completePartsBatch(batches: BatchComplete[]) {
    return this.spaceReportPartService.completeBatch(batches)
  }

  async generateResult(report: SpaceReport) {
    return await this.spaceReportResultService.generateResult(report)
  }

  async hasPendingBatch(reportId: number) {
    const pendingTask = await this.em.findOne(SpaceReportPart, {
      spaceReport: reportId,
      state: 'CREATED',
    })

    return Boolean(pendingTask)
  }

  async setSpaceReportError(id: number) {
    return await this.em.transactional(async tem => {
      const spaceReport = await tem.findOneOrFail(SpaceReport, id)

      if (spaceReport.state === 'ERROR') {
        return null
      }

      spaceReport.state = 'ERROR'
      return spaceReport
    })
  }

  async setSpaceReportPartsError(ids: number[]) {
    await this.spaceReportPartService.setReportPartsError(ids)
  }

  private async getSpaceForUserValidated(spaceId: number, user: User) {
    const spaces = await this.getSpacesForUser([spaceId], user)

    if (ArrayUtils.isEmpty(spaces)) {
      throw new errors.NotFoundError('Space not found')
    }

    return spaces[0]
  }

  async getSpacesForUser(spaceIds: number[], user: User) {
    return await this.em.createQueryBuilder(Space, 'space')
      .joinAndSelect('space.spaceMemberships', 'membership')
      .joinAndSelect('membership.user', 'user')
      .where({ 'space.id': spaceIds, 'user.id': user.id })
      .getResult()
  }

  getSpaceReportPartMetaData<T extends SpaceReportPartSourceType>(source: SpaceReportPartSourceEntity<T>) {
    return this.spaceReportPartService.getSpaceReportPartMetaData(source)
  }

  private async createSpaceReportParts(spaceReport: SpaceReport): Promise<SpaceReportPart[]> {
    const space = await this.em.findOneOrFail(Space, spaceReport.space.id)
    const scope = space.scope
    const spaceFiles = await this.em.find(UserFile, { scope })
    const spaceApps = await this.em.find(App, { scope })
    const spaceJobs = await this.em.find(Job, { scope })
    const spaceAssets = await this.em.find(Asset, { scope })
    const spaceWorkflows = await this.em.find(Workflow, { scope })
    const reportPartSources: SpaceReportPartSource[] = [
      ...spaceFiles.map(f => ({ type: 'file' as const, id: f.id })),
      ...spaceApps.map(a => ({ type: 'app' as const, id: a.id })),
      ...spaceJobs.map(j => ({ type: 'job' as const, id: j.id })),
      ...spaceAssets.map(a => ({ type: 'asset' as const, id: a.id })),
      ...spaceWorkflows.map(w => ({ type: 'workflow' as const, id: w.id })),
    ]

    return this.spaceReportPartService.createReportParts(reportPartSources)
  }

  // TODO - Remove with IOC
  static getInstance(em: SqlEntityManager) {
    const spaceReportPartService = new SpaceReportPartService(em)
    const spaceReportResultService = new SpaceReportResultService()
    return new SpaceReportService(
      em,
      spaceReportPartService,
      spaceReportResultService,
    )
  }
}
