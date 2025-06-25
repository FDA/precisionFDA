import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { FilterQuery } from '@mikro-orm/core'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'

export class SpaceGroupRepository extends AccessControlRepository<SpaceGroup> {
  protected async getAccessibleWhere(): Promise<FilterQuery<SpaceGroup>> {
    if (await this.isAdmin()) {
      return {}
    }

    return {
      spaces: {
        spaceMemberships: {
          user: this.user.id,
          active: true,
        },
        hidden: false,
        state: { $ne: SPACE_STATE.DELETED },
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<SpaceGroup>> {
    return (await this.isAdmin()) ? {} : null
  }

  private isAdmin = async (): Promise<boolean> => {
    const user = await this.user.loadEntity()
    return (await user.isSiteAdmin()) || (await user.isReviewSpaceAdmin())
  }
}
