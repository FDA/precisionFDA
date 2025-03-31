import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { FilterQuery } from '@mikro-orm/core'
import { STATIC_SCOPE } from '@shared/enums'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class DiscussionRepository extends AccessControlRepository<Discussion> {
  constructor(
    em: SqlEntityManager,
    private readonly user: UserContext, // need also the user db record (for accessible spaces)
  ) {
    // TODO XXXX_LUDVIK
    super(em, Discussion)
  }

  protected async getAccessibleWhere(): Promise<FilterQuery<Discussion>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    // const user = await this.em.findOneOrFail(User, { id: 7 })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Discussion>> {
    // const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const user = await this.em.findOneOrFail(User, { id: 7 })
    const accessibleSpaces = await user.editableSpaces() //TODO for discussions the rules should differ a bit - only admin/leads and authors can touch the discussion in spaces.
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
      },
    }
  }
}
