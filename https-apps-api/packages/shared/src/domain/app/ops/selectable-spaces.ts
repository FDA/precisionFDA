import { entities } from '../..'
import { UidInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { Space } from '../../space'
import { SPACE_TYPE } from '../../space/space.enum'
import { getIdFromScopeName, isValidScopeName } from '../../space/space.helper'
import { App } from '../app.entity'

export class SelectableSpacesOperation extends BaseOperation<
UserOpsCtx,
UidInput,
Space[]
> {
  async run(input: UidInput): Promise<Space[]> {
    const em = this.ctx.em
    const currentApp: App = await em.findOneOrFail(entities.App, { uid: input.uid })

    // does it have valid scope (starts with space-)?
    if (!isValidScopeName(currentApp.scope)) {
      return []
    }

    const scopeId = getIdFromScopeName(currentApp.scope)
    const appSpace = await em.findOneOrFail(entities.Space, { id: scopeId })

    // is the space in correct state?
    if (!(appSpace.type === SPACE_TYPE.REVIEW
      || appSpace.type === SPACE_TYPE.VERIFICATION
      || appSpace.type === SPACE_TYPE.GROUPS
      || appSpace.type === SPACE_TYPE.ADMINISTRATOR
      || appSpace.type === SPACE_TYPE.PRIVATE_TYPE)) {
      return []
    }

    // collect ids of confidential spaces + space id
    const confidentialSpaces = await em.find(entities.Space, { spaceId: appSpace.id })
    const spaceIds = confidentialSpaces.map(space => space.id)
    spaceIds.push(appSpace.id)

    const spaceRepo = em.getRepository(Space)
    const spaces = await spaceRepo.findSpacesByIdAndUser(spaceIds, this.ctx.user.id)

    return spaces
  }
}
