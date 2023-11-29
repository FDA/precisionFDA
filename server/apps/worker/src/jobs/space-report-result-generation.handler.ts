import { SqlEntityManager } from '@mikro-orm/mysql'
import { database, spaceReport, UserFileCreateFacade, platform, userFile, notification, provenance } from '@shared'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import type { GenerateSpaceReportResultJob } from '@shared/queue/task.input'
import type { Job } from 'bull'
import { SpaceReportResultGenerateFacade } from '../facade/space-report-result-generate.facade'
import { getChildLogger } from '../utils'

class SpaceReportResultGenerationHandler {
  private readonly generateFacade

  constructor(generateFacade: SpaceReportResultGenerateFacade) {
    this.generateFacade = generateFacade
  }

  async handle(bullJob: Job<GenerateSpaceReportResultJob>) {
    const reportId: number = bullJob.data.payload

    return await this.generateFacade.generate(reportId)
  }
}

export const spaceReportResultGenerationHandler = async (bullJob: Job<GenerateSpaceReportResultJob>) => {
  const requestId = String(bullJob.id)
  const log = getChildLogger(requestId)

  const ctx: WorkerOpsCtx<UserOpsCtx> = {
    em: database.orm().em.fork({ useContext: true }) as SqlEntityManager,
    log,
    user: bullJob.data.user,
    job: bullJob,
  }

  const spaceReportService = spaceReport.SpaceReportService.getInstance(ctx.em)
  const platformFileService = platform.PlatformFileService.getInstance(ctx)
  const userFileService = userFile.UserFileService.getInstance(ctx.em)
  const userFileCreateFacade = new UserFileCreateFacade(ctx.user, platformFileService, userFileService)
  const notificationService = new notification.NotificationService(ctx.em.fork({ useContext: true }))
  const entityProvenanceService = provenance.EntityProvenanceService.getInstance(ctx.em)
  const generateFacade = new SpaceReportResultGenerateFacade(
    ctx.em,
    spaceReportService,
    userFileCreateFacade,
    notificationService,
    entityProvenanceService,
  )
  const handler = new SpaceReportResultGenerationHandler(generateFacade)

  return await handler.handle(bullJob)
}
