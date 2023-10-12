import { SqlEntityManager } from '@mikro-orm/mysql'
import { errors, spaceReport, user as userDomain, userFile } from '@pfda/https-apps-shared'

export class SpaceReportDeleteFacade {
  private readonly em
  private readonly spaceReportService
  private readonly nodesRemoveOperation

  constructor(
    em: SqlEntityManager,
    spaceReportService: spaceReport.SpaceReportService,
    nodesRemoveOperation: userFile.NodesRemoveOperation,
  ) {
    this.em = em
    this.spaceReportService = spaceReportService
    this.nodesRemoveOperation = nodesRemoveOperation
  }

  async deleteSpaceReports(ids: number[], user: userDomain.User) {
    return await this.em.transactional(async () => {
      const reports = await this.spaceReportService.getReports(ids)

      if (reports.length !== ids.length) {
        throw new errors.NotFoundError('Space report not found')
      }

      const spaceIds = new Set(reports.map(r => r.space.id))
      const spaces = await this.spaceReportService.getSpacesForUser(Array.from(spaceIds), user)

      if (spaces.length !== spaceIds.size) {
        throw new errors.NotFoundError('Space not found')
      }

      const resultFilesIds = reports
        .map(r => r.resultFile?.id)
        .filter(id => id != null)

      const removedIds = await this.spaceReportService.deleteReports(reports)

      await this.nodesRemoveOperation.execute({ ids: resultFilesIds, async: false })

      return removedIds
    })
  }
}
