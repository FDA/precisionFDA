import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { ListJobsInput, PageJobs } from '@shared/domain/job/job.input'
import { DescribeJobOperation } from '@shared/domain/job/ops/describe'
import { ListJobsOperation } from '@shared/domain/job/ops/list'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { WorkstationService } from '@shared/domain/job/workstation.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createSyncJobStatusTask } from '@shared/queue'
import { UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils/base-schemas'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'
import {
  JobSetAPIKeyParams,
  JobSnapshotParams,
  WorkstationAliveParams,
  jobListQuerySchema,
  jobSetAPIKeyBodySchema,
  jobSnapshotBodySchema,
  workstationAliveBodySchema,
} from './job.schemas'
import { Job } from '@shared/domain/job/job.entity'
import { JobActionDTO } from '@shared/domain/job/dto/job-action.dto'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'

@UseGuards(UserContextGuard)
@Controller('/jobs')
export class JobController {
  constructor(
    private readonly user: UserContext,
    private readonly jobSynchronizationService: JobSynchronizationService,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  // not used at the moment
  @Get()
  async listJobs(
    @Query(new JsonSchemaPipe(jobListQuerySchema)) query: ListJobsInput,
  ): Promise<PageJobs> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new ListJobsOperation(opsCtx).execute({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      scope: query.scope ?? undefined,
      spaceId: query.spaceId ?? undefined,
    })
  }

  // not used at the moment
  @Get('/:dxid')
  async describeJob(@Param() param: JobActionDTO): Promise<Job> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new DescribeJobOperation(opsCtx).execute({ dxid: param.dxid })
  }

  // ------------------------
  //    HTTPS Workstations
  // ------------------------
  @Patch('/:dxid/terminate')
  async terminateJob(@Param() param: JobActionDTO): Promise<Job> {
    return await this.jobSynchronizationService.requestTerminateJob(param.dxid)
  }

  @Patch('/:dxid/syncJob')
  async syncJobStatus(@Param() param: JobActionDTO): Promise<{
    message: string
  }> {
    await createSyncJobStatusTask({ dxid: param.dxid }, this.user)
    return { message: 'Job sync task created' }
  }

  @Patch('/:jobDxId/checkAlive')
  async checkAlive(
    @Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>,
    @Body(new JsonSchemaPipe(workstationAliveBodySchema)) body: WorkstationAliveParams,
  ): Promise<boolean> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const workstationService = await new WorkstationService(opsCtx, body.code).initWithJob(dxid)

    return await workstationService.alive()
  }

  @UseGuards(InternalRouteGuard)
  @Patch('/:jobDxId/setAPIKey')
  async setApiKey(
    @Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>,
    @Body(new JsonSchemaPipe(jobSetAPIKeyBodySchema)) body: JobSetAPIKeyParams,
  ): Promise<void> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const workstationService = await new WorkstationService(opsCtx, body.code).initWithJob(dxid)

    return await workstationService.setAPIKey(body.key)
  }

  @Patch('/:jobDxId/snapshot')
  async createSnapshot(
    @Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) jobDxid: DxId<'job'>,
    @Body(new JsonSchemaPipe(jobSnapshotBodySchema)) body: JobSnapshotParams,
  ): Promise<{ message: string }> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const terminate = body.terminate ?? false
    const input = {
      ...body,
      jobDxid,
      terminate,
    }

    await new WorkstationSnapshotOperation(opsCtx).enqueue(input)

    return { message: `Snapshot for workstation ${input.jobDxid} started` }
  }
}
