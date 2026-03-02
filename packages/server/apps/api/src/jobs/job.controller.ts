import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { JobSetAPIKeyBodyDTO } from '@shared/domain/job/dto/job-set-api-key-body.dto'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { JobUidParamDTO } from '@shared/domain/job/dto/job-uid-param.dto'
import { WorkstationAliveBodyDTO } from '@shared/domain/job/dto/workstation-alive-body.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DxidValidationPipe } from '../validation/pipes/dxid.pipe'

@UseGuards(UserContextGuard)
@Controller('/jobs')
export class JobController {
  constructor(
    private readonly user: UserContext,
    private readonly jobSynchronizationService: JobSynchronizationService,
    private readonly jobService: JobService,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
    private readonly jobWorkstationFacade: JobWorkstationFacade,
  ) {}

  // ------------------------
  //    HTTPS Workstations
  // ------------------------
  @Patch('/:dxid/terminate')
  async terminateJob(@Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>): Promise<Job> {
    return await this.jobSynchronizationService.requestTerminateJob(dxid)
  }

  @Patch('/:dxid/syncJob')
  async syncJobStatus(@Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>): Promise<{
    message: string
  }> {
    await this.mainQueueJobProducer.createSyncJobStatusTask({ dxid }, this.user)
    return { message: 'Job sync task created' }
  }

  @ApiOperation({ summary: 'Check if the workstation is alive, only dev use' })
  @Patch('/:uid/alive')
  async checkAlive(@Param() params: JobUidParamDTO, @Body() body: WorkstationAliveBodyDTO): Promise<boolean> {
    return await this.jobService.checkAlive(params.uid, body.code)
  }

  @ApiOperation({ summary: 'Set CLI key for the workstation, internal call from Rails app' })
  @UseGuards(InternalRouteGuard)
  @Patch('/:uid/setAPIKey')
  async setApiKey(@Param() params: JobUidParamDTO, @Body() body: JobSetAPIKeyBodyDTO): Promise<void> {
    return await this.jobService.setAPIKey(params.uid, body)
  }

  @ApiOperation({ summary: 'Create a snapshot of the workstation, internal call from Rails app' })
  @UseGuards(InternalRouteGuard)
  @Patch('/:uid/snapshot')
  async createSnapshot(
    @Param() params: JobUidParamDTO,
    @Body() body: JobSnapshotBodyDTO,
  ): Promise<{ message: string }> {
    await this.jobWorkstationFacade.createWorkstationSnapshotTask(params.uid, body)

    return { message: `Snapshot for workstation ${params.uid} started` }
  }
}
