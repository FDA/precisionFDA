import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { SpaceMemberDTO } from '@shared/domain/space-membership/dto/space-member.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'

@Injectable()
export class SpaceMembershipListApiFacade {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly spaceService: SpaceService,
  ) {}

  async listSpaceMembers(spaceId: number): Promise<SpaceMemberDTO[]> {
    const memberships = await this.spaceService.getSpaceMembers(spaceId)

    await this.em.populate(memberships, ['user'])
    return memberships.map((membership) => SpaceMemberDTO.fromEntity(membership))
  }
}
