import type { EntityManager } from '@mikro-orm/core'
import { LockMode, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { promises as fs } from 'fs'
import path from 'path'
import type { UserFileCreateFacade } from '@pfda/https-apps-shared'
import { errors, spaceReport, ENUMS, notification } from '@pfda/https-apps-shared'

export class SpaceReportResultGenerateFacade {
  private readonly spaceReportService
  private readonly userFileCreateFacade
  private readonly em
  private readonly notificationService

  constructor(
    em: SqlEntityManager,
    spaceReportService: spaceReport.SpaceReportService,
    userFileCreateFacade: UserFileCreateFacade,
    notificationService: notification.NotificationService,
  ) {
    this.spaceReportService = spaceReportService
    this.userFileCreateFacade = userFileCreateFacade
    this.notificationService = notificationService
    this.em = em
  }

  async generate(reportId: number) {
    const report = await this.generateAndUploadReport(reportId)

    void this.notificationService.createNotification({
      severity: ENUMS.SEVERITY.INFO,
      userId: report.createdBy.id,
      message: `Report of space "${report.space.name}" successfully generated`,
      action: ENUMS.NOTIFICATION_ACTION.SPACE_REPORT_DONE,
      meta: {
        linkTitle: 'go to reports',
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

      const reportResult = await this.spaceReportService.generateResult(report)

      // const filePath = path.join(__dirname, `${this.getName(report)}.html`)
      // await fs.writeFile(filePath, reportResult)

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
    return `PFDA - Space ${report.space.id} report - ${report.createdAt.toISOString()}.html`
  }

  private getDescription(report: spaceReport.SpaceReport) {
    const generated = new Date(report.createdAt).toLocaleString()
    return `Report of a precisionFDA space ${report.space.name}, generatad on ${generated}`
  }
}
