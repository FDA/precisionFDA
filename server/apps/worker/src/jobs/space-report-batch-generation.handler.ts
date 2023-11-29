import type { SqlEntityManager } from '@mikro-orm/mysql'
import { database, job, spaceReport, provenance } from '@shared'
import type { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import type { GenerateSpaceReportBatchJob } from '@shared/queue/task.input'
import type { Job } from 'bull'
import { SpaceReportBatchResultGenerateFacade } from '../facade/space-report-batch-result-generate.facade'
import { getChildLogger } from '../utils'

class SpaceReportBatchGenerationHandler {
  private readonly spaceReportBatchResultGenerateFacade

  constructor(
    spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade,
  ) {
    this.spaceReportBatchResultGenerateFacade = spaceReportBatchResultGenerateFacade

  }

  async handle(bullJob: Job<GenerateSpaceReportBatchJob>) {
    const ids: number[] = bullJob.data.payload

    await this.spaceReportBatchResultGenerateFacade.generate(ids)
  }
}

export const spaceReportBatchGenerationHandler = async (bullJob: Job) => {
  const em = database.orm().em.fork({ useContext: true })

  const spaceReportService = spaceReport.SpaceReportService.getInstance(em)
  const entityProvenanceService: provenance.EntityProvenanceService = provenance.EntityProvenanceService.getInstance(em)
  const spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade = new SpaceReportBatchResultGenerateFacade(
    em,
    bullJob.data.user,
    spaceReportService,
    entityProvenanceService,
  )
  const handler = new SpaceReportBatchGenerationHandler(spaceReportBatchResultGenerateFacade)

  return await handler.handle(bullJob)
}
