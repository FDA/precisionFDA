import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { FilterQuery } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'

export default class WorkflowRepository extends AccessControlRepository<Workflow> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Workflow>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Workflow>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const editableSpaces = await user.editableSpaces()
    const scopes = editableSpaces.map((space) => space.scope)

    // TODO PFDA-6222: define rules for site-admins

    return {
      $or: [
        { user: user.id, scope: STATIC_SCOPE.PRIVATE },
        { user: user.id, scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: scopes } },
      ],
    }
  }
}
