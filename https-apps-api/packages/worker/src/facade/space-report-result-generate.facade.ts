import { LockMode, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import type { UserFileCreateFacade } from '@pfda/https-apps-shared'
import { ENUMS, errors, notification, spaceReport, provenance } from '@pfda/https-apps-shared'

export class SpaceReportResultGenerateFacade {
  private readonly spaceReportService
  private readonly userFileCreateFacade
  private readonly em
  private readonly notificationService
  private readonly entityProvenanceService

  constructor(
    em: SqlEntityManager,
    spaceReportService: spaceReport.SpaceReportService,
    userFileCreateFacade: UserFileCreateFacade,
    notificationService: notification.NotificationService,
    entityProvenanceService: provenance.EntityProvenanceService,
  ) {
    this.spaceReportService = spaceReportService
    this.userFileCreateFacade = userFileCreateFacade
    this.notificationService = notificationService
    this.em = em
    this.entityProvenanceService = entityProvenanceService
  }

  async generate(reportId: number) {
    const report = await this.generateAndUploadReport(reportId)

    void this.notificationService.createNotification({
      severity: ENUMS.SEVERITY.INFO,
      userId: report.createdBy.id,
      message: `Report of space "${report.space.name}" successfully generated`,
      action: ENUMS.NOTIFICATION_ACTION.SPACE_REPORT_DONE,
      meta: {
        linkTitle: 'Go to Reports',
        linkUrl: `/spaces/${report.space.id}/reports`,
      },
    })
  }

  private async generateAndUploadReport(reportId: number) {
    return await this.em.transactional(async tem => {
      const report = await tem.findOne(
        spaceReport.SpaceReport,
        { id: reportId, state: { $in: ['CREATED', 'ERROR'] } },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      )

      if (report == null) {
        throw new errors.NotFoundError(`Report with id ${reportId} does not exist or is in an invalid state`)
      }

      await tem.populate(report, ['reportParts', 'space', 'createdBy'])

      const provenanceStyles = await this.entityProvenanceService.getSvgStyles()
      const reportResult = await this.spaceReportService.generateResult(report, provenanceStyles)

      const file = await this.userFileCreateFacade.createFileWithContent({
        scope: report.space.scope,
        project: report.space.hostProject,
        name: this.getName(report),
        content: reportResult,
        description: this.getDescription(report),
      })

      report.resultFile = Reference.create(file)
      report.state = 'DONE'

      return report
    })
  }

  private getName(report: spaceReport.SpaceReport) {
    return `PFDA - Space ${report.space.id} report - ${report.createdAt.toLocaleDateString()}.html`
  }

  private getDescription(report: spaceReport.SpaceReport) {
    const generated = new Date(report.createdAt).toLocaleString()
    return `Report of a precisionFDA space ${report.space.name}, generatad on ${generated}`
  }
}
