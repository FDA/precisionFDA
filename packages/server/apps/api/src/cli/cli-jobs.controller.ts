import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { CliListJobDTO } from '@shared/domain/cli/dto/cli-list-jobs.dto'
import { CliScopeQueryDTO } from '@shared/domain/cli/dto/cli-scope-query.dto'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityScope } from '@shared/types/common'
import { CliJobScopeFacade } from '../facade/cli/cli-job-scope.facade'
import { CliListJobsFacade } from '../facade/cli/cli-list-jobs.facade'
import { CliTerminateJobFacade } from '../facade/cli/cli-terminate-job.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { UidValidationPipe } from '../validation/pipes/uid.pipe'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/jobs')
export class CliJobsController {
  constructor(
    private readonly cliJobScopeFacade: CliJobScopeFacade,
    private readonly cliTerminateJobFacade: CliTerminateJobFacade,
    private readonly cliListJobsFacade: CliListJobsFacade,
  ) {}

  @UseGuards(UserContextGuard)
  @Get('/:dxid/scope')
  async getJobScope(@Param('dxid') jobDxid: DxId<'job'>): Promise<{
    scope: EntityScope
  }> {
    return this.cliJobScopeFacade.getJobScope(jobDxid)
  }

  @UseGuards(UserContextGuard)
  @Get()
  async listJobs(@Query() query: CliScopeQueryDTO): Promise<CliListJobDTO[]> {
    return this.cliListJobsFacade.listJobs(query.scope)
  }

  @UseGuards(UserContextGuard)
  @Patch('/:uid/terminate')
  async terminateJob(@Param('uid', new UidValidationPipe({ entityType: 'job' })) jobUid: Uid<'job'>): Promise<void> {
    await this.cliTerminateJobFacade.terminateJob(jobUid)
  }
}
