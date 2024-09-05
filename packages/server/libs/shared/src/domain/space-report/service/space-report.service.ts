import { QueryOrder } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityInstance } from '@shared/domain/entity/domain/entity-instance'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceReportCreateDto } from '@shared/domain/space-report/model/space-report-create.dto'
import { SpaceReportFormat } from '@shared/domain/space-report/model/space-report-format'
import { SpaceReportFormatToResultOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-result-options.map'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SpaceReportResultService } from '@shared/domain/space-report/service/result/space-report-result.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScope, SpaceScope } from '@shared/types/common'
import { ArrayUtils } from '@shared/utils/array.utils'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { SpaceReportPart } from '../entity/space-report-part.entity'
import { SpaceReport } from '../entity/space-report.entity'
import { BatchComplete } from '../model/batch-complete'
import { SpaceReportPartSource } from '../model/space-report-part-source'
import { SpaceReportPartService } from './part/space-report-part.service'

@Injectable()
export class SpaceReportService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportPartService: SpaceReportPartService,
    private readonly spaceReportResultService: SpaceReportResultService,
    private readonly user: UserContext,
    private readonly notificationService: NotificationService,
  ) {}

  async createReport({ format, options, scope }: SpaceReportCreateDto) {
    if (scope == null) {
      throw new InvalidStateError('Scope is required for creating a report')
    }

    return await this.em.transactional(async () => {
      if (EntityScopeUtils.isSpaceScope(scope)) {
        await this.getSpaceForUserValidated(EntityScopeUtils.getSpaceIdFromScope(scope))
      }

      const spaceReport = new SpaceReport(this.em.getReference(User, this.user.id))
      spaceReport.scope = scope
      spaceReport.format = format
      spaceReport.options = options
      spaceReport.reportParts.add(await this.createSpaceReportParts(spaceReport.scope))

      if (ArrayUtils.isEmpty(spaceReport.reportParts.getItems())) {
        throw new InvalidStateError('Report not generated: No entities to report on in this space')
      }

      this.em.persist(spaceReport)

      return spaceReport
    })
  }

  async getReports(ids: number[]) {
    return await this.em.find(SpaceReport, ids, { populate: ['createdBy'] })
  }

  async getReportsForScope(scope: EntityScope) {
    return await this.em.transactional(async () => {
      if (EntityScopeUtils.isSpaceScope(scope)) {
        await this.getSpaceForUserValidated(EntityScopeUtils.getSpaceIdFromScope(scope))
      }

      const where = EntityScopeUtils.isSpaceScope(scope)
        ? { scope }
        : { scope: 'private' as const, createdBy: this.user.id }

      const reports = await this.em.find(SpaceReport, where, {
        orderBy: { createdAt: QueryOrder.desc },
        populate: ['resultFile'],
      })

      return reports.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        state: r.state,
        resultFile: r.resultFile,
        format: r.format,
      }))
    })
  }

  async deleteReports(reports: SpaceReport[]) {
    if (ArrayUtils.isEmpty(reports)) {
      return []
    }

    await this.em.transactional(async () => {
      this.logger.log(`Deleting reports with ids: ${reports.map((report) => report.id)}`)
      this.em.remove(reports)
    })

    return reports.map((r) => r.id)
  }

  async completePartsBatch(batches: BatchComplete[]) {
    return this.spaceReportPartService.completeBatch(batches)
  }

  async generateResult<T extends SpaceReportFormat>(
    report: SpaceReport<T>,
    opts?: SpaceReportFormatToResultOptionsMap[T],
  ) {
    return await this.spaceReportResultService.generateResult(report, opts)
  }

  async hasAllBatchesDone(reportId: number) {
    const notDoneTask = await this.em.findOne(SpaceReportPart, {
      spaceReport: reportId,
      state: { $ne: 'DONE' },
    })

    return !Boolean(notDoneTask)
  }

  async completeReportForResultFile(resultFileUid: Uid<'file'>) {
    const report = await this.em.transactional(async () => {
      const report = await this.em.findOneOrFail(SpaceReport, {
        resultFile: { uid: resultFileUid },
      })

      report.state = 'DONE'

      return report
    })

    const messageAndLink = await this.getNotificationMessageAndLink(report)

    return await this.notificationService.createNotification({
      severity: SEVERITY.INFO,
      userId: report.createdBy.id,
      message: messageAndLink.message,
      action: NOTIFICATION_ACTION.SPACE_REPORT_DONE,
      meta: {
        linkTitle: 'Go to Reports',
        linkUrl: messageAndLink.link,
      },
    })
  }

  private async getNotificationMessageAndLink(report: SpaceReport) {
    if (EntityScopeUtils.isSpaceScope(report.scope)) {
      const spaceId = EntityScopeUtils.getSpaceIdFromScope(report.scope)
      const space = await this.getSpaceForUserValidated(spaceId)

      return {
        message: `Report of space "${space.name}" successfully generated`,
        link: `/spaces/${space.id}/reports`,
      }
    }

    return {
      message: `Report of your private area has been successfully generated`,
      link: `/home/reports`,
    }
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

  private async createSpaceReportParts(scope: EntityScope): Promise<SpaceReportPart[]> {
    const entities = await this.getEntities(scope)

    const reportPartSources: SpaceReportPartSource[] = [
      ...entities.file.map((f) => ({ type: 'file' as const, id: f.id })),
      ...entities.app.map((a) => ({ type: 'app' as const, id: a.id })),
      ...entities.job.map((j) => ({ type: 'job' as const, id: j.id })),
      ...entities.asset.map((a) => ({ type: 'asset' as const, id: a.id })),
      ...entities.workflow.map((w) => ({ type: 'workflow' as const, id: w.id })),
      ...entities.user.map((u) => ({ type: 'user' as const, id: u.id })),
      ...entities.discussion.map((d) => ({ type: 'discussion' as const, id: d.id })),
    ]

    return this.spaceReportPartService.createReportParts(reportPartSources)
  }

  private async getEntities(scope: EntityScope): Promise<{
    [T in SpaceReportPartSourceType]: EntityInstance<T>[]
  }> {
    if (EntityScopeUtils.isSpaceScope(scope)) {
      return this.getEntitiesForSpace(scope)
    }

    if (scope === 'private') {
      return this.getEntitiesForPrivate()
    }

    throw new InvalidStateError(`${scope}" is not a valid scope for space report`)
  }

  private async getEntitiesForPrivate(): Promise<{
    [T in SpaceReportPartSourceType]: EntityInstance<T>[]
  }> {
    return {
      file: await this.em.find(UserFile, { scope: 'private', user: this.user.id }),
      app: await this.em.find(App, { scope: 'private', user: this.user.id }),
      job: await this.em.find(Job, { scope: 'private', user: this.user.id }),
      asset: await this.em.find(Asset, { scope: 'private', user: this.user.id }),
      workflow: await this.em.find(Workflow, { scope: 'private', user: this.user.id }),
      user: await this.em.find(User, this.user.id),
      discussion: [],
    }
  }

  private async getEntitiesForSpace(scope: SpaceScope): Promise<{
    [T in SpaceReportPartSourceType]: EntityInstance<T>[]
  }> {
    const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
    const space = await this.getSpaceForUserValidated(spaceId)

    return {
      file: await this.em.find(UserFile, { scope }),
      app: await this.em.find(App, { scope }),
      job: await this.em.find(Job, { scope }),
      asset: await this.em.find(Asset, { scope }),
      workflow: await this.em.find(Workflow, { scope }),
      user: await this.em.find(User, {
        spaceMemberships: { spaces: { id: space.id }, active: true },
      }),
      discussion: await this.em.find(Discussion, { note: { scope } }),
    }
  }
}
