import { Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { SpaceReportBatchResultGenerateFacade } from '@shared/facade/space-report/space-report-batch-result-generate.facade'
import { SpaceReportErrorFacade } from '@shared/facade/space-report/space-report-error.facade'
import { SpaceReportResultGenerateFacade } from '@shared/facade/space-report/space-report-result-generate.facade'
import * as types from '@shared/queue/task.input'
import {
  GenerateSpaceReportBatchJob,
  GenerateSpaceReportResultJob,
  TASK_TYPE,
} from '@shared/queue/task.input'
import { ArrayUtils } from '@shared/utils/array.utils'
import { Job } from 'bull'
import { OnQueueFailedWithContext } from '../../../queues/decorator/on-queue-failed-with-context'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Processor(config.workerJobs.queues.spaceReport.name)
export class SpaceReportProcessor {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade,
    private readonly spaceReportResultGenerateFacade: SpaceReportResultGenerateFacade,
    private readonly spaceReportErrorFacade: SpaceReportErrorFacade,
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

  @OnQueueFailedWithContext()
  async onQueueFailed(job: Job, error: Error) {
    this.logger.error({ job, error }, 'Space report queue error')

    try {
      if (job.attemptsMade !== job.opts.attempts) {
        return
      }

      const type = job.name
      const payload = job.data?.payload

      if (type === TASK_TYPE.GENERATE_SPACE_REPORT_RESULT) {
        if (Number.isNaN(payload)) {
          return
        }

        await this.spaceReportErrorFacade.setSpaceReportError(payload)
        return
      }

      if (!Array.isArray(payload)) {
        return
      }

      const filteredPayload = payload.filter((i) => !Number.isNaN(i))

      if (ArrayUtils.isEmpty(filteredPayload)) {
        return
      }

      await this.spaceReportErrorFacade.setSpaceReportPartsError(filteredPayload)
    } catch (e) {
      this.logger.error(e, 'Failed setting ERROR state to space report')
    }
  }
}
