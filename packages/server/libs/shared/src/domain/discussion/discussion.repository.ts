import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { AccessControlRepository } from '@shared/repository/access-control.repository'

@Injectable()
export default class DiscussionRepository extends AccessControlRepository<Discussion> {
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
