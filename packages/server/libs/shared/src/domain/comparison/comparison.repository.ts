import { EntityRepository } from '@mikro-orm/mysql'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

export class ComparisonRepository extends EntityRepository<Comparison> {
  async findComparisonsByUserFile(userFile: UserFile) {
    return await this.find({ inputFiles: [userFile] })
  }
}
