import { Injectable } from '@nestjs/common'
import { CountStats } from '@shared/database/statistics.type'
import { OrganizationService } from '@shared/domain/org/service/organization.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { NodeService } from '@shared/domain/user-file/node.service'

@Injectable()
export class StatisticsFacade {
  constructor(
    private readonly userService: UserService,
    private readonly spaceService: SpaceService,
    private readonly fileService: NodeService,
    private readonly organizationService: OrganizationService,
  ) {}

  async getStatistics(): Promise<{
    usersCount: Awaited<CountStats>
    spacesCount: Awaited<CountStats>
    filesCount: Awaited<CountStats>
    orgsCount: Awaited<number>
  }> {
    const [usersCount, spacesCount, filesCount, orgsCount] = await Promise.all([
      this.userService.getStatistics(),
      this.spaceService.getStatistics(),
      this.fileService.getStatistics(),
      this.organizationService.getStatistics(),
    ])
    return {
      usersCount,
      spacesCount,
      filesCount,
      orgsCount,
    }
  }
}
