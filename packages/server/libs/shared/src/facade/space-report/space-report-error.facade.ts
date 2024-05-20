import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ArrayUtils } from '@shared/utils/array.utils'

@Injectable()
export class SpaceReportErrorFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly notificationService: NotificationService,
  ) {}

  async setSpaceReportError(id: number) {
    const report = await this.em.transactional(async () => {
      const spaceReport = await this.em.findOneOrFail(SpaceReport, id)

      if (['ERROR', 'DONE'].includes(spaceReport.state)) {
        return null
      }

      spaceReport.state = 'ERROR'
      return spaceReport
    })

    if (!report) {
      return
    }

    await this.notificationService.createNotification({
      severity: SEVERITY.ERROR,
      userId: report.createdBy.id,
      message: 'Space report generation failed',
      action: NOTIFICATION_ACTION.SPACE_REPORT_ERROR,
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
