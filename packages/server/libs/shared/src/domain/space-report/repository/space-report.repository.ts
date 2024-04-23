import { EntityRepository } from '@mikro-orm/mysql'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'

export class SpaceReportRepository extends EntityRepository<SpaceReport> {
  async findByResultFileUid(fileUid: string) {
    return await this.findOne({ resultFile: { uid: fileUid } })
  }
}
