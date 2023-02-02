import { entities } from '../..'
import { UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { Space } from '../../space'
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

    const space = await em.findOneOrFail(entities.Space, { id })

    // is the space in correct state?
    if (!(space.type === SPACE_TYPE.REVIEW
      || space.type === SPACE_TYPE.VERIFICATION
      || space.type === SPACE_TYPE.GROUPS
      || space.type === SPACE_TYPE.PRIVATE_TYPE)) {
      return []
    }

    // collect ids of confidential spaces + space id
    const confidentialSpaces = await em.find(entities.Space, { spaceId: space.id })
    const spaceIds = confidentialSpaces.map(space => space.id)
    spaceIds.push(space.id)

    const spaceRepo = em.getRepository(Space)
    const spaces = await spaceRepo.findSpacesByIdAndUser(spaceIds, this.ctx.user.id)

    return spaces
  }
}
