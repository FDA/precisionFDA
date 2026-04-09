import { Injectable, Logger } from '@nestjs/common'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import {
  CountersResponse,
  ScopeFilterContext,
  SpaceCountersResponse,
  SpaceScope,
} from '@shared/domain/counters/counters.types'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { JobService } from '@shared/domain/job/job.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { WorkflowSeriesService } from '@shared/domain/workflow-series/service/workflow-series.service'
import { HOME_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class CountersFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly userContext: UserContext,
    private readonly nodeService: NodeService,
    private readonly appSeriesService: AppSeriesService,
    private readonly jobService: JobService,
    private readonly dbClusterService: DbClusterService,
    private readonly workflowSeriesService: WorkflowSeriesService,
    private readonly spaceReportService: SpaceReportService,
    private readonly discussionService: DiscussionService,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
  ) {}

  /**
   * Get counters for all entity types based on scope
   */
  async getCounters(scope: HOME_SCOPE): Promise<CountersResponse> {
    this.logger.log(`Getting counters for scope: ${scope}`)

    const user = await this.userContext.loadEntity()
    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes: SpaceScope[] = accessibleSpaces.map(space => space.scope as SpaceScope)

    const context: ScopeFilterContext = { user, scope, spaceScopes }

    const [files, apps, assets, jobs, dbclusters, workflows, reports, discussions] = await Promise.all([
      this.nodeService.countFiles(context),
      this.appSeriesService.countByScope(context),
      this.nodeService.countAssets(context),
      this.jobService.countByScope(context),
      this.dbClusterService.countByScope(context),
      this.workflowSeriesService.countByScope(context),
      this.spaceReportService.countByScope(context),
      this.discussionService.countByScope(context),
    ])

    return {
      files,
      apps,
      assets,
      jobs,
      dbclusters,
      workflows,
      reports,
      discussions,
    }
  }

  /**
   * Get counters for a specific space.
   * Validates that the current user has access to the space.
   */
  async getSpaceCounters(spaceId: number): Promise<SpaceCountersResponse> {
    this.logger.log(`Getting counters for space: ${spaceId}`)

    const space = await this.spaceService.getAccessibleById(spaceId)
    if (!space) {
      throw new NotFoundError('Space does not exist or is not accessible')
    }

    const user = await this.userContext.loadEntity()

    // Reuse existing count services by passing a single-space ScopeFilterContext
    const context: ScopeFilterContext = {
      user,
      scope: HOME_SCOPE.SPACES,
      spaceScopes: [space.scope],
    }

    const [files, assets, apps, workflows, jobs, dbclusters, discussions, reports, members] = await Promise.all([
      this.nodeService.countFiles(context),
      this.nodeService.countAssets(context),
      this.appSeriesService.countByScope(context),
      this.workflowSeriesService.countByScope(context),
      this.jobService.countByScope(context),
      this.dbClusterService.countByScope(context),
      this.discussionService.countByScope(context),
      this.spaceReportService.countByScope(context),
      this.spaceMembershipService.countBySpace(spaceId),
    ])

    return {
      files,
      assets,
      apps,
      workflows,
      jobs,
      members,
      reports,
      discussions,
      dbclusters,
    }
  }
}
