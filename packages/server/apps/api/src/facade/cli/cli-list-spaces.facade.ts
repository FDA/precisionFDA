import { FilterQuery } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CliListSpaceDTO } from '@shared/domain/cli/dto/cli-list-spaces.dto'
import { CliListSpacesQueryDTO } from '@shared/domain/cli/dto/cli-list-spaces-query.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Injectable()
export class CliListSpacesFacade {
  constructor(
    private readonly user: UserContext,
    private readonly spaceService: SpaceService,
  ) {}

  async listSpaces(query: CliListSpacesQueryDTO): Promise<CliListSpaceDTO[]> {
    const state = query.state ?? SPACE_STATE.ACTIVE

    const where: FilterQuery<Space> = { state }

    if (query.protected === true) {
      where.protected = true
    }

    if (query.types && query.types.length > 0) {
      where.type = { $in: query.types }
    }

    const spaces = await this.spaceService.listAccessible(where, {
      populate: ['spaceMemberships'],
    })

    return spaces.map(space => {
      const membership = space.spaceMemberships.getItems().find(m => m.user.id === this.user.id && m.active)
      return CliListSpaceDTO.fromEntity(space, membership)
    })
  }
}
