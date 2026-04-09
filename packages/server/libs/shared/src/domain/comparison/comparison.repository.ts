import { FilterQuery } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'

export class ComparisonRepository extends AccessControlRepository<Comparison> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Comparison>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    return {
      $or: [{ user: user.id, scope: STATIC_SCOPE.PRIVATE }, { scope: STATIC_SCOPE.PUBLIC }],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Comparison>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
      ],
    }
  }
  async findComparisonsByUserFile(userFile: UserFile): Promise<Comparison[]> {
    return await this.find({ inputFiles: [userFile] })
  }
}
