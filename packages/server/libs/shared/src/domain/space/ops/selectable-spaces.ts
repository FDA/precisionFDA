import { Space } from '@shared/domain/space/space.entity'
import { UserOpsCtx } from '@shared/types'
import { BaseOperation } from '@shared/utils/base-operation'
import { SPACE_TYPE } from '../../space/space.enum'

/**
 * Operation checks if given space has confidential spaces and returns info
 * about corresponding space (plus potential confidential spaces).
 */
export class SelectableSpacesOperation extends BaseOperation<
UserOpsCtx,
number,
Space[]
> {
  async run(id: number): Promise<Space[]> {
    const em = this.ctx.em

    const space = await em.findOneOrFail(Space, { id })

    // is the space of correct type?
    if (!(space.type === SPACE_TYPE.REVIEW
      || space.type === SPACE_TYPE.VERIFICATION
      || space.type === SPACE_TYPE.GROUPS
      || space.type === SPACE_TYPE.GOVERNMENT
      || space.type === SPACE_TYPE.PRIVATE_TYPE)) {
      return []
    }

    // collect ids of confidential spaces + space id
    const confidentialSpaces = await em.find(Space, { spaceId: space.id })
    const spaceIds = confidentialSpaces.map(space => space.id)
    spaceIds.push(space.id)

    const spaceRepo = em.getRepository(Space)
    return await spaceRepo.findSpacesByIdAndUser(spaceIds, this.ctx.user.id)
  }
}
