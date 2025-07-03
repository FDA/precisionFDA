import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'

type SpaceGroupSpaceDTO = {
  id: number
  name: string
  type: string
  isActiveMember: boolean
}

export class SpaceGroupDTO {
  id: number
  name: string
  description: string
  spaces: SpaceGroupSpaceDTO[]

  static fromEntity(spaceGroup: SpaceGroup, userId: number): SpaceGroupDTO {
    return {
      id: spaceGroup.id,
      name: spaceGroup.name,
      description: spaceGroup.description,
      spaces: spaceGroup.spaces.map((space) => SpaceGroupDTO.spaceMap(space, userId)),
    }
  }

  private static spaceMap(space: Space, userId: number): SpaceGroupSpaceDTO {
    return {
      id: space.id,
      name: space.name,
      type: SPACE_TYPE[space.type].toLowerCase(),
      isActiveMember: !!space.spaceMemberships.find(
        (spaceMembership) => spaceMembership.active && spaceMembership.user.id === userId,
      ),
    }
  }
}
