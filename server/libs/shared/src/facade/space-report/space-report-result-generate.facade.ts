import { LockMode, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { getProjectDxid } from '@shared/domain/space/space.helper'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { UserFileCreateFacade } from '@shared/facade/file-create/user-file-create.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class SpaceReportResultGenerateFacade {
  @ServiceLogger()
  private readonly log: Logger

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
        this.log.warn(
          `Attempt to generate result for a report in invalid state. Current report state: "${report.state}"`,
        )

        return report
      }

      await this.em.populate(report, ['reportParts', 'space', 'createdBy'])

      const provenanceStyles = await this.entityProvenanceService.getSvgStyles()
      const reportResult = await this.spaceReportService.generateResult(report, provenanceStyles)

      const membership = await this.em.findOne(SpaceMembership, {
        spaces: report.space.id,
        user: report.createdBy.id,
        active: true,
      })

      if (membership == null) {
        throw new NotFoundError(
          `The report creator with id "${report.createdBy.id}" no longer has an active membership in space id "${report.space.id}"`,
        )
      }

      const file = await this.userFileCreateFacade.createFileWithContent(
        {
          scope: report.space.scope,
          project: getProjectDxid(report.space, membership),
          name: this.getName(report),
          content: reportResult,
          description: this.getDescription(report),
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

  private getName(report: SpaceReport) {
    return `PFDA - Space ${report.space.id} report - ${report.createdAt.toLocaleDateString()}.html`
  }

  private getDescription(report: SpaceReport) {
    const generated = new Date(report.createdAt).toLocaleString()
    return `Report of a precisionFDA space ${report.space.name}, generatad on ${generated}`
  }
}
