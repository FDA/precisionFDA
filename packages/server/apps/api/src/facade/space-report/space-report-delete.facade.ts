import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportState } from '@shared/domain/space-report/model/space-report-state.type'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'

@Injectable()
export class SpaceReportDeleteFacade {
  private readonly DELETABLE_STATES: SpaceReportState[] = ['DONE', 'ERROR']

  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportService: SpaceReportService,
    private readonly userFileService: UserFileService,
    private readonly user: UserContext,
  ) {}

  async deleteSpaceReports(ids: number[]) {
    return await this.em.transactional(async () => {
      const reports = await this.spaceReportService.getReports(ids)

      if (reports.length !== ids.length) {
        throw new NotFoundError('Some space reports not found')
      }

      if (reports.some((r) => !this.DELETABLE_STATES.includes(r.state))) {
        throw new InvalidStateError('Cannot delete a report in non terminal state')
      }

      await this.validateReportsAccess(reports)

      const removedIds = await this.spaceReportService.deleteReports(reports)

      const resultFilesIds = reports.map((r) => r.resultFile?.id).filter((id) => id != null)

      await this.userFileService.removeNodes(resultFilesIds, false)

      return removedIds
    })
  }

  private async validateReportsAccess(reports: SpaceReport[]) {
    const spaceIds = new Set<number>()

    reports.forEach((report) => {
      if (EntityScopeUtils.isSpaceScope(report.scope)) {
        spaceIds.add(EntityScopeUtils.getSpaceIdFromScope(report.scope))
        return
      }

      if (report.createdBy.getEntity().id !== this.user.id) {
        throw new PermissionError('User does not have access to the report')
      }
    })

    const spaces = await this.spaceReportService.getSpacesForUser(Array.from(spaceIds))

    if (spaces.length !== spaceIds.size) {
      throw new NotFoundError('Space not found')
    }
  }
}
