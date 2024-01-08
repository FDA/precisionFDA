import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { createGenerateSpaceReportBatchTasks } from '@shared/queue'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ArrayUtils } from '@shared/utils/array.utils'

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

    await createGenerateSpaceReportBatchTasks(reportBatches, this.user)

    return report
  }
}
