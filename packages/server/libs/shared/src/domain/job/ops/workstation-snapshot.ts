import { DxId } from '@shared/domain/entity/domain/dxid'
import { WorkstationService } from '@shared/domain/job/workstation.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { omit } from 'ramda'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../enums'
import * as errors from '../../../errors'
import { addToFileSyncQueueEnsureUnique } from '../../../queue'
import { TASK_TYPE } from '../../../queue/task.input'
import { UserOpsCtx } from '../../../types'
import { JOB_STATE } from '../job.enum'
import { WorkstationBaseOperation } from './workstation-base-operation'

export interface WorkstationSnapshotOperationParams {
  jobDxid: DxId<'job'>
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

  static getBullJobId(jobDxid: DxId<'job'>): string {
    return `${this.getTaskType()}.${jobDxid}`
  }

  async enqueue(input: WorkstationSnapshotOperationParams) {
    const job = await this.validatedJobWithWorkstationAPI(input.jobDxid)
    if (job.state !== JOB_STATE.RUNNING) {
      throw new errors.InvalidStateError(
        `WorkstationSnapshotOperation Error: job ${job.dxid} is not in running state`,
      )
    }

    const queueData = {
      type: WorkstationSnapshotOperation.getTaskType(),
      payload: input,
      user: this.ctx.user,
    }
    const jobId = WorkstationSnapshotOperation.getBullJobId(input.jobDxid)
    return await addToFileSyncQueueEnsureUnique(queueData, jobId)
  }

  async run(input: WorkstationSnapshotOperationParams): Promise<any> {
    const log = this.ctx.log
    log.log({ ...omit(['code', 'key'], input) }, 'Start')

    const job = await this.validatedJobWithWorkstationAPI(input.jobDxid)
    if (job.state !== JOB_STATE.RUNNING) {
      throw new errors.InvalidStateError(
        `WorkstationSnapshotOperation Error: job ${job.dxid} is not in running state`,
      )
    }

    const notificationService = new NotificationService(this.ctx.em)

    try {
      const workstationService = await new WorkstationService(this.ctx, input.code).initWithJob(
        input.jobDxid,
      )
      const terminate = input.terminate ?? false
      const res = await workstationService.snapshot(input.key, input.name, terminate)

      log.log({ res }, 'Received snapshot response')

      if (res.result === 'success') {
        const message = input.terminate
          ? `Snapshot created for ${job.name}. The workstation will now terminate`
          : `Snapshot created for ${job.name}`
        await notificationService.createNotification({
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
        await notificationService.createNotification({
          message: `Error creating snapshot for ${job.name}: ${res.error?.message}`,
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
      await notificationService.createNotification({
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
        },
      }
    }
  }
}
