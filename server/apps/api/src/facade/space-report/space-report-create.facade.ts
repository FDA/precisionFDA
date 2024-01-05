import { Injectable } from '@nestjs/common'
import { ArrayUtils, config, queue, UserContext } from '@shared'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'

@Injectable()
export class SpaceReportCreateFacade {
  private readonly REPORT_PART_BATCH_SIZE = config.workerJobs.spaceReport.partBatchSize

  constructor(
    private readonly user: UserContext,
    private readonly spaceReportService: SpaceReportService,
  ) {
    this.spaceReportService = spaceReportService
  }

  async createSpaceReport(spaceId: number) {
    const report = await this.spaceReportService.createReport(spaceId)
    const partIds: number[] = report.reportParts.getItems().map((p) => p.id)
    const reportBatches = ArrayUtils.batchArray(partIds, this.REPORT_PART_BATCH_SIZE)

    await queue.createGenerateSpaceReportBatchTasks(reportBatches, this.user)

    return report
  }
}
