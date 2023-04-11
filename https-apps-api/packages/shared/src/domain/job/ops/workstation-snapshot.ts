import * as errors from '../../../errors'
import { queue } from '../../..'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import { UserOpsCtx } from '../../../types'
import { WorkstationService } from '..'
import { omit } from 'ramda'
import { WorkstationBaseOperation } from './workstation-base-operation'
import { TASK_TYPE } from '../../../queue/task.input'
import { createSyncWorkstationFilesTask } from '../../../queue'
import { JOB_STATE } from '../job.enum'
import { getServiceFactory } from '../../../services/service-factory'


export interface WorkstationSnapshotOperationParams {
  jobDxid: string
  code: string // Auth code from auth server
  key: string // Key for the pFDA CLI
  name: string
  terminate: boolean
}

export class WorkstationSnapshotOperation extends WorkstationBaseOperation<
UserOpsCtx,
WorkstationSnapshotOperationParams,
any
> {
  static getTaskType(): TASK_TYPE.WORKSTATION_SNAPSHOT {
    return TASK_TYPE.WORKSTATION_SNAPSHOT
  }

  static getBullJobId(jobDxid: string): string {
    return `${this.getTaskType()}.${jobDxid}`
  }

  static getJobDxidFromBullJobId(bullJobId: string): string {
    return bullJobId.replace(`${this.getTaskType()}.`, '')
  }

  async enqueue(input: WorkstationSnapshotOperationParams) {
    const job = await this.validatedJobWithWorkstationAPI(input.jobDxid)
    if (job.state !== JOB_STATE.RUNNING) {
      throw new errors.InvalidStateError(`WorkstationSnapshotOperation Error: job ${job.dxid} is not in running state`)
    }

    const queueData = {
      type: WorkstationSnapshotOperation.getTaskType(),
      payload: input,
      user: this.ctx.user,
    }  
    const jobId = WorkstationSnapshotOperation.getBullJobId(input.jobDxid)  
    return await queue.addToQueueEnsureUnique(queue.getFileSyncQueue(), queueData, jobId)
  }

  async run(input: WorkstationSnapshotOperationParams): Promise<any> {
    const log = this.ctx.log
    log.info({ ...omit(['code', 'key'], input) },
      'WorkstationSnapshotOperation: Start',
    )

    const job = await this.validatedJobWithWorkstationAPI(input.jobDxid)
    if (job.state !== JOB_STATE.RUNNING) {
      throw new errors.InvalidStateError(`WorkstationSnapshotOperation Error: job ${job.dxid} is not in running state`)
    }

    const notificationService = getServiceFactory().getNotificationService(this.ctx.em)

    try {
      const workstationService = await new WorkstationService(this.ctx, input.code).initWithJob(input.jobDxid)
      const terminate = input.terminate ?? false
      const res = await workstationService.snapshot(input.key, input.name, terminate)

      log.info({ res },
        'WorkstationSnapshotOperation: Received snapshot response',
      )

      if (res.result === 'success') {
        try {
          // Snapshot is created, now we should invoke workstation sync for the file to appear in My Home
          await createSyncWorkstationFilesTask({ dxid: job.dxid }, this.ctx.user)
        } catch (err) {
          log.info({ err },
            // Most likely a sync file operation already queued up or processing,
            // either because user invoked Snapshot twice quickly or they had clicked Sync Files
            'WorkstationSnapshotOperation: Unable to queue SyncWorkstationFiles',
          )
        }

        const message = input.terminate
          ? `Snapshot created for ${job.name}. The workstation will now terminate`
          : `Snapshot created for ${job.name}`
        notificationService.createNotification({
          message,
          meta: {
            linkTitle: 'View Execution',
            linkUrl: `/home/executions/${job.uid}`,
          },
          severity: SEVERITY.INFO,
          action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
          userId: this.ctx.user.id,
        })
      } else {
        notificationService.createNotification({
          message: `Error creating snapshot for ${job.name}: ${res.data}`,
          meta: {
            linkTitle: 'View Execution',
            linkUrl: `/home/executions/${job.uid}`,
          },
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
          userId: this.ctx.user.id,
        })
      }
      return res
    } catch (err) {
      const message = `Error creating snapshot for ${job.name}: ${err}`
      notificationService.createNotification({
        message,
        meta: {
          linkTitle: 'View Execution',
          linkUrl: `/home/executions/${job.uid}`,
        },
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
        userId: this.ctx.user.id,
      })
      return {
        error: {
          code: errors.ErrorCodes.WORKSTATION_API_ERROR,
          message,
        }
      }
    }
  }
}
