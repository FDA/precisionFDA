import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import * as types from '@shared/queue/task.input'
import { GenerateSpaceReportBatchJob, GenerateSpaceReportResultJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { SpaceReportBatchResultGenerateFacade } from '../../../facade/space-report/space-report-batch-result-generate.facade'
import { SpaceReportResultGenerateFacade } from '../../../facade/space-report/space-report-result-generate.facade'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'

@Processor(config.workerJobs.queues.spaceReport.name)
export class SpaceReportProcessor {
  constructor(
    private readonly spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade,
    private readonly spaceReportResultGenerateFacade: SpaceReportResultGenerateFacade,
  ) {}

  @ProcessWithContext(types.TASK_TYPE.GENERATE_SPACE_REPORT_BATCH)
  async generateSpaceReportBatch(job: Job<GenerateSpaceReportBatchJob>) {
    const ids: number[] = job.data.payload

    await this.spaceReportBatchResultGenerateFacade.generate(ids)
  }

  @ProcessWithContext(types.TASK_TYPE.GENERATE_SPACE_REPORT_RESULT)
  async generateSpaceReportResult(job: Job<GenerateSpaceReportResultJob>) {
    const reportId: number = job.data.payload

    return await this.spaceReportResultGenerateFacade.generate(reportId)
  }
}
