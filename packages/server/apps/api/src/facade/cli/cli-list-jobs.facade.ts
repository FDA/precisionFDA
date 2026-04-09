import { FilterQuery } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CliListJobDTO } from '@shared/domain/cli/dto/cli-list-jobs.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { EntityScope } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class CliListJobsFacade {
  constructor(
    private readonly user: UserContext,
    private readonly jobService: JobService,
    private readonly spaceService: SpaceService,
  ) {}

  async listJobs(scope: EntityScope): Promise<CliListJobDTO[]> {
    let where: FilterQuery<Job>

    if (EntityScopeUtils.isSpaceScope(scope)) {
      const spaceId = EntityScopeUtils.getSpaceIdFromScope(scope)
      const space = await this.spaceService.getAccessibleById(spaceId)
      if (!space) {
        throw new NotFoundError(`Space ${spaceId} not found or not accessible`)
      }
      where = { scope }
    } else if (scope === STATIC_SCOPE.PUBLIC) {
      where = { scope: STATIC_SCOPE.PUBLIC }
    } else {
      const currentUser = await this.user.loadEntity()
      where = {
        user: currentUser.id,
        scope: STATIC_SCOPE.PRIVATE,
      }
    }

    const jobs = await this.jobService.listAccessible(where, {
      populate: ['user', 'app', 'properties', 'taggings.tag'],
      orderBy: { createdAt: 'DESC' },
    })

    return jobs.map(job => CliListJobDTO.fromEntity(job))
  }
}
