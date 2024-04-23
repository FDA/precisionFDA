import { UserOpsCtx } from "../../types"
import { PermissionError, SpaceNotFoundError } from "../../errors"
import { Space } from "./space.entity"


export const getSpaceIsAccessibleByContext = async (spaceId: number, ctx: UserOpsCtx): Promise<Space> => {
  const spaceRepo = ctx.em.getRepository(Space)
  const space = await spaceRepo.findOne({ id: spaceId })
  if (!space) {
    throw new SpaceNotFoundError()
  }
  return getSpaceIsAccessibleByUser(space, ctx.user.id)
}

export const getSpaceIsAccessibleByUser = (space: Space, userId: number): Space => {
  for (const spaceMembership of space.spaceMemberships) {
    if (spaceMembership.user.id === userId) {
      return space
    }
  }
  throw new PermissionError('Error: User does not have permissions to access this space')
}
