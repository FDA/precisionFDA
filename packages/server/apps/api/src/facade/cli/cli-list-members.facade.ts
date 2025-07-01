import { Injectable } from '@nestjs/common'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/cli-space-member.dto'

@Injectable()
export class CliListMembersFacade {
  constructor(private readonly spaceService: SpaceService) {}

  async listSpaceMembers(spaceId: number): Promise<CliSpaceMemberDTO[]> {
    const memberships = await this.spaceService.getSpaceMembers(spaceId)

    return await Promise.all(
      memberships.map((membership) => CliSpaceMemberDTO.fromEntity(membership)),
    )
  }
}
