import { LockMode, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { Space } from '@shared/domain/space/space.entity'
import { getProjectDxid } from '@shared/domain/space/space.helper'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class SpaceReportResultGenerateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceReportService: SpaceReportService,
    private readonly userFileCreateFacade: UserFileCreateFacade,
    private readonly entityProvenanceService: EntityProvenanceService,
    private readonly userFileService: UserFileService,
  ) {}

  async generate(reportId: number) {
    const report = await this.em.transactional(async () => {
      const report = await this.em.findOne(SpaceReport, reportId, {
        lockMode: LockMode.PESSIMISTIC_WRITE,
      })

      if (report == null) {
        throw new NotFoundError(`Report with id ${reportId} does not exist`)
      }

      if (!['CREATED', 'ERROR'].includes(report.state)) {
        this.logger.warn(
          `Attempt to generate result for a report in invalid state. Current report state: "${report.state}"`,
        )

        return report
      }

      await this.em.populate(report, ['reportParts', 'createdBy'])

      const space = EntityScopeUtils.isSpaceScope(report.scope)
        ? await this.em.findOneOrFail(Space, EntityScopeUtils.getSpaceIdFromScope(report.scope))
        : null

      const file = await this.userFileCreateFacade.createFileWithContent(
        {
          scope: report.scope,
          project: await this.getProjectDxid(report, space),
          name: this.getName(report, space),
          content: await this.getReportResult(report),
          description: await this.getDescription(report, space),
        },
        false,
      )

      report.resultFile = Reference.create(file)
      report.state = 'CLOSING_RESULT_FILE'

      return report
    })

    const resultFile = await report.resultFile.load()

    if (resultFile?.state === 'open') {
      if (report.state !== 'CLOSING_RESULT_FILE') {
        throw new InvalidStateError(
          `Failed to generate a space report. Report result file is in an open state, but report is in an unexpected state. Current report state: "${report.state}"`,
        )
      }

      await this.userFileService.closeFile(resultFile.uid)
    }

    return report
  }

  private async getProjectDxid(report: SpaceReport, space?: Space) {
    if (!space) {
      return report.createdBy.getEntity().privateFilesProject
    }

    const membership = await this.em.findOne(SpaceMembership, {
      spaces: space.id,
      user: report.createdBy.id,
      active: true,
    })

    if (membership == null) {
      throw new NotFoundError(
        `The report creator with id "${report.createdBy.id}" no longer has an active membership in space id "${space.id}"`,
      )
    }

    return getProjectDxid(space, membership)
  }

  private getName(report: SpaceReport, space?: Space) {
    const createdAt = report.createdAt.toLocaleDateString()
    const extension = report.format.toLowerCase()
    const spaceTitle = space
      ? `Space ${space.id}`
      : `Private area (${report.createdBy.getEntity().fullName})`

    return `PFDA - ${spaceTitle} report - ${createdAt}.${extension}`
  }

  private async getDescription(report: SpaceReport, space?: Space) {
    const generated = new Date(report.createdAt).toLocaleString()

    if (space) {
      return `Report of a precisionFDA space ${space.name}, generated on ${generated}`
    }

    return `Report of precisionFDA private area of user ${
      report.createdBy.getEntity().fullName
    }, generated on ${generated}`
  }

  private async getReportResult(report: SpaceReport): Promise<string> {
    if (report.format === 'HTML') {
      const styles = await this.entityProvenanceService.getSvgStyles()

      return this.spaceReportService.generateResult(report as SpaceReport<'HTML'>, { styles })
    }

    return await this.spaceReportService.generateResult(report as SpaceReport<'JSON'>)
  }
}
