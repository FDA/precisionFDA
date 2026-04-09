import { Injectable } from '@nestjs/common'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/cli-discussion.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CliListDiscussionsFacade {
  constructor(private readonly discussionService: DiscussionService) {}

  async listDiscussions(spaceId: number): Promise<CliDiscussionDTO[]> {
    const spaceScope = EntityScopeUtils.getScopeFromSpaceId(spaceId)
    const response = await this.discussionService.listDiscussions({ scope: spaceScope })

    return response.data.map((d: DiscussionDTO) => {
      return CliDiscussionDTO.mapToDTO(d)
    })
  }
}
