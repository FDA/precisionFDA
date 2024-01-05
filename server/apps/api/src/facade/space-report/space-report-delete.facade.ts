import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { errors, userFile } from '@shared'
import { SpaceReportState } from '@shared/domain/space-report/model/space-report-state.type'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'

@Injectable()
export class SpaceReportDeleteFacade {
  private readonly DELETABLE_STATES: SpaceReportState[] = ['DONE', 'ERROR']

  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportService: SpaceReportService,
    private readonly nodesRemoveOperation: userFile.NodesRemoveOperation,
  ) {}

  async deleteSpaceReports(ids: number[]) {
    return await this.em.transactional(async () => {
      const reports = await this.spaceReportService.getReports(ids)

      if (reports.length !== ids.length) {
        throw new errors.NotFoundError('Space report not found')
      }

      if (reports.some((r) => !this.DELETABLE_STATES.includes(r.state))) {
        throw new errors.InvalidStateError('Cannot delete a report in non terminal state')
      }

      const spaceIds = new Set(reports.map((r) => r.space.id))
      const spaces = await this.spaceReportService.getSpacesForUser(Array.from(spaceIds))

      if (spaces.length !== spaceIds.size) {
        throw new errors.NotFoundError('Space not found')
      }

      const removedIds = await this.spaceReportService.deleteReports(reports)

      const resultFilesIds = reports.map((r) => r.resultFile?.id).filter((id) => id != null)

      await this.nodesRemoveOperation.execute({ ids: resultFilesIds, async: false })

      return removedIds
    })
  }
}
