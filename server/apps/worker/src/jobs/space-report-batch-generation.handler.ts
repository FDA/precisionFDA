import { database, provenance, spaceReport } from '@shared'
import type { GenerateSpaceReportBatchJob } from '@shared/queue/task.input'
import type { Job } from 'bull'
import { SpaceReportBatchResultGenerateFacade } from '../facade/space-report-batch-result-generate.facade'

class SpaceReportBatchGenerationHandler {
  private readonly spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade

  constructor(spaceReportBatchResultGenerateFacade: SpaceReportBatchResultGenerateFacade) {
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
