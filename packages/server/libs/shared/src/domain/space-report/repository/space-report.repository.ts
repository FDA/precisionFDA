import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'

export class SpaceReportRepository extends BaseEntityRepository<SpaceReport> {
  async findByResultFileUid(fileUid: Uid<'file'>) {
    return await this.findOne({ resultFile: { uid: fileUid } })
  }
}
