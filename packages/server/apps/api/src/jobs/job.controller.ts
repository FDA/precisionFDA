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
import { ListJobsInput } from '@shared/domain/job/job.input'
import { DescribeJobOperation } from '@shared/domain/job/ops/describe'
import { ListJobsOperation } from '@shared/domain/job/ops/list'
import { RequestTerminateJobOperation } from '@shared/domain/job/ops/terminate'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { WorkstationService } from '@shared/domain/job/workstation.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createSyncJobStatusTask } from '@shared/queue'
import { UserOpsCtx } from '@shared/types'
import { schemas } from '@shared/utils/base-schemas'
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

@UseGuards(UserContextGuard)
@Controller('/jobs')
export class JobController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  // not used at the moment
  @Get()
  async listJobs(@Query(new JsonSchemaPipe(jobListQuerySchema)) query: ListJobsInput) {
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
  @Get('/:jobDxId')
  async describeJob(@Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new DescribeJobOperation(opsCtx).execute({ dxid })
  }

  // ------------------------
  //    HTTPS Workstations
  // ------------------------
  @Patch('/:jobDxId/terminate')
  async terminateJob(@Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new RequestTerminateJobOperation(opsCtx).execute({ dxid })
  }

  @Patch('/:jobDxId/syncJob')
  async syncJobStatus(@Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>) {
    await createSyncJobStatusTask({ dxid }, this.user)
    return { message: 'Job sync task created' }
  }

  @Patch('/:jobDxId/checkAlive')
  async checkAlive(
    @Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>,
    @Body(new JsonSchemaPipe(workstationAliveBodySchema)) body: WorkstationAliveParams,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const workstationService = await new WorkstationService(opsCtx, body.code).initWithJob(dxid)

    return await workstationService.alive()
  }

  @Patch('/:jobDxId/setAPIKey')
  async setApiKey(
    @Param('jobDxId', new JsonSchemaPipe(schemas.dxidProp)) dxid: DxId<'job'>,
    @Body(new JsonSchemaPipe(jobSetAPIKeyBodySchema)) body: JobSetAPIKeyParams,
  ) {
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
  ) {
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
