import { LockMode, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { getProjectDxid } from '@shared/domain/space/space.helper'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'

@Injectable()
export class SpaceReportResultGenerateFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportService: SpaceReportService,
    private readonly userFileCreateFacade: UserFileCreateFacade,
    private readonly notificationService: NotificationService,
    private readonly entityProvenanceService: EntityProvenanceService,
  ) {}

  async generate(reportId: number) {
    const report = await this.generateAndUploadReport(reportId)

    void this.notificationService.createNotification({
      severity: SEVERITY.INFO,
      userId: report.createdBy.id,
      message: `Report of space "${report.space.name}" successfully generated`,
      action: NOTIFICATION_ACTION.SPACE_REPORT_DONE,
      meta: {
        linkTitle: 'Go to Reports',
        linkUrl: `/spaces/${report.space.id}/reports`,
      },
    })
  }

  private async generateAndUploadReport(reportId: number) {
    return await this.em.transactional(async () => {
      const report = await this.em.findOne(
        SpaceReport,
        { id: reportId, state: { $in: ['CREATED', 'ERROR'] } },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      )

      if (report == null) {
        throw new NotFoundError(
          `Report with id ${reportId} does not exist or is in an invalid state`,
        )
      }

      await this.em.populate(report, ['reportParts', 'space', 'createdBy'])

      const provenanceStyles = await this.entityProvenanceService.getSvgStyles()
      const reportResult = await this.spaceReportService.generateResult(report, provenanceStyles)

      const membership = await this.em.findOne(SpaceMembership, {
        spaces: report.space.id,
        user: report.createdBy.id,
        active: true,
      })

      if (membership == null) {
        throw new NotFoundError(
          `The report creator with id "${report.createdBy.id}" no longer has an active membership in space id "${report.space.id}"`,
        )
      }

      const file = await this.userFileCreateFacade.createFileWithContent({
        scope: report.space.scope,
        project: getProjectDxid(report.space, membership),
        name: this.getName(report),
        content: reportResult,
        description: this.getDescription(report),
      })

      report.resultFile = Reference.create(file)
      report.state = 'DONE'

      return report
    })
  }

  private getName(report: SpaceReport) {
    return `PFDA - Space ${report.space.id} report - ${report.createdAt.toLocaleDateString()}.html`
  }

  private getDescription(report: SpaceReport) {
    const generated = new Date(report.createdAt).toLocaleString()
    return `Report of a precisionFDA space ${report.space.name}, generatad on ${generated}`
  }
}
