import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { HOME_SCOPE } from '@shared/enums'
import {
  CountersResponse,
  ScopeFilterContext,
  SpaceScope,
} from '@shared/domain/counters/counters.types'
import { NodeService } from '@shared/domain/user-file/node.service'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import { JobService } from '@shared/domain/job/job.service'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { WorkflowSeriesService } from '@shared/domain/workflow-series/service/workflow-series.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'

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
  ) {}

  /**
   * Get counters for all entity types based on scope
   */
  async getCounters(scope: HOME_SCOPE): Promise<CountersResponse> {
    this.logger.log(`Getting counters for scope: ${scope}`)

    const user = await this.userContext.loadEntity()
    const accessibleSpaces = await user.accessibleSpaces()
    const spaceScopes: SpaceScope[] = accessibleSpaces.map((space) => space.scope as SpaceScope)

    const context: ScopeFilterContext = { user, scope, spaceScopes }

    const [files, apps, assets, jobs, dbclusters, workflows, reports, discussions] =
      await Promise.all([
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
}
