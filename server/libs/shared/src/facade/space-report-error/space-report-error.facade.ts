import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { ArrayUtils, ENUMS } from '../..'
import { NotificationService } from '../../domain/notification'

export class SpaceReportErrorFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly notificationService: NotificationService,
  ) {}

  async setSpaceReportError(id: number) {
    const report = await this.em.transactional(async () => {
      const spaceReport = await this.em.findOneOrFail(SpaceReport, id)

      if (spaceReport.state === 'ERROR') {
        return null
      }

      spaceReport.state = 'ERROR'
      return spaceReport
    })

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
        await this.em.nativeUpdate(SpaceReportPart, { id: { $in: ids } }, { state: 'ERROR' }),
        this.setSpaceReportError(part.spaceReport.id),
      ])
    })
  }
}
