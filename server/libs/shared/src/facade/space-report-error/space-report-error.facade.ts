import { SqlEntityManager } from '@mikro-orm/mysql'
import { ArrayUtils, ENUMS } from '../..'
import { NotificationService } from '../../domain/notification'
import { SpaceReportPart, SpaceReportService } from '../../domain/space-report'

export class SpaceReportErrorFacade {
  private readonly em
  private readonly spaceReportService
  private readonly notificationService
  constructor(
    em: SqlEntityManager,
    spaceReportService: SpaceReportService,
    notificationService: NotificationService,
  ) {
    this.em = em
    this.spaceReportService = spaceReportService
    this.notificationService = notificationService
  }

  async setSpaceReportError(id: number) {
    const report = await this.spaceReportService.setSpaceReportError(id)

    if (!report) {
      return
    }

    await this.notificationService.createNotification({
      severity: ENUMS.SEVERITY.ERROR,
      userId: report.createdBy.id,
      message: 'Space report generation failed',
      action: ENUMS.NOTIFICATION_ACTION.SPACE_REPORT_ERROR,
    })
  }

  async setSpaceReportPartsError(ids: number[]) {
    if (ArrayUtils.isEmpty(ids)) {
      return
    }

    await this.em.transactional(async () => {
      const part = await this.em.findOne(SpaceReportPart, ids)

      if (!part) {
        return
      }

      await Promise.all([
        this.spaceReportService.setSpaceReportPartsError(ids),
        this.setSpaceReportError(part.spaceReport.id),
      ])
    })
  }
}
