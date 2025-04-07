import { FilterQuery } from '@mikro-orm/core'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { AccessControlRepository } from '@shared/repository/access-control.repository'

export class ComparisonRepository extends AccessControlRepository<Comparison> {
  protected getAccessibleWhere(): Promise<FilterQuery<Comparison>> {
    throw new Error('Method not implemented.')
  }

  protected getEditableWhere(): Promise<FilterQuery<Comparison>> {
    throw new Error('Method not implemented.')
  }
  async findComparisonsByUserFile(userFile: UserFile) {
    return await this.find({ inputFiles: [userFile] })
  }
}
