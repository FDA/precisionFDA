import { ArrayUtils, config, queue, spaceReport, user as userDomain } from '@shared'
import type { UserOpsCtx } from '@shared/types'

export class SpaceReportCreateFacade {
  private readonly REPORT_PART_BATCH_SIZE = config.workerJobs.spaceReport.partBatchSize

  private readonly spaceReportService: spaceReport.SpaceReportService
  private readonly ctx: UserOpsCtx

  constructor(userCtx: UserOpsCtx, spaceReportService: spaceReport.SpaceReportService) {
    this.ctx = userCtx
    this.spaceReportService = spaceReportService
  }

  async createSpaceReport(spaceId: number) {
    const user: userDomain.User = this.ctx.em.getReference(userDomain.User, this.ctx.user.id)
    const report = await this.spaceReportService.createReport(spaceId, user)
    const partIds: number[] = report.reportParts.getItems().map(p => p.id)
    const reportBatches = ArrayUtils.batchArray(partIds, this.REPORT_PART_BATCH_SIZE)

    await queue.createGenerateSpaceReportBatchTasks(reportBatches, this.ctx.user)

    return report
  }
}
