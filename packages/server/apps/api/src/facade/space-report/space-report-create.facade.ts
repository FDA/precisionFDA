import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SpaceReportCreateDto } from '@shared/domain/space-report/model/space-report-create.dto'
import { SpaceReportQueueJobProducer } from '@shared/domain/space-report/producer/space-report-queue-job.producer'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ArrayUtils } from '@shared/utils/array.utils'

@Injectable()
export class SpaceReportCreateFacade {
  private readonly REPORT_PART_BATCH_SIZE = config.workerJobs.spaceReport.partBatchSize

  constructor(
    private readonly user: UserContext,
    private readonly spaceReportService: SpaceReportService,
    private readonly spaceReportQueueJobProducer: SpaceReportQueueJobProducer,
  ) {
    this.spaceReportService = spaceReportService
  }

  async createSpaceReport(createDto: SpaceReportCreateDto) {
    const report = await this.spaceReportService.createReport(createDto)
    const partIds: number[] = report.reportParts.getItems().map((p) => p.id)
    const reportBatches = ArrayUtils.batchArray(partIds, this.REPORT_PART_BATCH_SIZE)

    await this.spaceReportQueueJobProducer.createBatchTasks(reportBatches, this.user)

    return report
  }
}
