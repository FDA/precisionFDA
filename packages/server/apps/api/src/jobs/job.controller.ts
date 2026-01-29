import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Inject, Logger, Param, Patch, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { WorkstationService } from '@shared/domain/job/workstation.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createSyncJobStatusTask } from '@shared/queue'
import { UserOpsCtx } from '@shared/types'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DxidValidationPipe } from '../validation/pipes/dxid.pipe'
import { JobSetAPIKeyBodyDTO } from '@shared/domain/job/dto/job-set-api-key-body.dto'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { WorkstationAliveBodyDTO } from '@shared/domain/job/dto/workstation-alive-body.dto'
import { Job } from '@shared/domain/job/job.entity'
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

  // ------------------------
  //    HTTPS Workstations
  // ------------------------
  @Patch('/:dxid/terminate')
  async terminateJob(
    @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>,
  ): Promise<Job> {
    return await this.jobSynchronizationService.requestTerminateJob(dxid)
  }

  @Patch('/:dxid/syncJob')
  async syncJobStatus(
    @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>,
  ): Promise<{
    message: string
  }> {
    await createSyncJobStatusTask({ dxid }, this.user)
    return { message: 'Job sync task created' }
  }

  @Patch('/:dxid/checkAlive')
  async checkAlive(
    @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>,
    @Body() body: WorkstationAliveBodyDTO,
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
  @Patch('/:dxid/setAPIKey')
  async setApiKey(
    @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>,
    @Body() body: JobSetAPIKeyBodyDTO,
  ): Promise<void> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const workstationService = await new WorkstationService(opsCtx, body.code).initWithJob(dxid)

    return await workstationService.setAPIKey(body.key)
  }

  @Patch('/:dxid/snapshot')
  async createSnapshot(
    @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) jobDxid: DxId<'job'>,
    @Body() body: JobSnapshotBodyDTO,
  ): Promise<{ message: string }> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const input = {
      ...body,
      jobDxid,
    }

    await new WorkstationSnapshotOperation(opsCtx).enqueue(input)

    return { message: `Snapshot for workstation ${input.jobDxid} started` }
  }
}
