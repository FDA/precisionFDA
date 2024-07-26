import { CheckUserDbClustersOperation } from '@shared/domain/db-cluster/ops/check-user-dbs'
import { CheckUserJobsOperation } from '@shared/domain/job/ops/check-user-jobs'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { User } from '@shared/domain/user/user.entity'
import {
  addToFileSyncQueueEnsureUnique,
  createSyncFilesStateTask,
  findRepeatable,
  getMainQueue,
  removeRepeatableJob,
} from '@shared/queue'
import { BaseOperation } from '@shared/utils/base-operation'
import { isJobOrphaned } from '../../../queue/queue.utils'
import { UserCtx, UserOpsCtx } from '../../../types'
import { findUnclosedFilesOrAssets } from '../../user-file/user-file.helper'
import { config } from '@shared/config'
import { Job } from 'bull'
import { Task, TASK_TYPE } from '@shared/queue/task.input'

const recreateFilesStateStatusSyncIfMissing = async (user: UserCtx, log: any): Promise<void> => {
  const bullJobId = SyncFilesStateOperation.getBullJobId(user.dxuser)
  const bullJob = await findRepeatable(bullJobId)
  if (!bullJob) {
    log.warn(
      {
        dxusd: user.dxuser,
        bullJobId,
      },
      'CheckUserJobsOperation: FilesStateSyncTask missing, recreating it',
    )
    await createSyncFilesStateTask(user)
  } else if (isJobOrphaned(bullJob)) {
    log.log(
      {
        dxusd: user.dxuser,
        bullJob,
      },
      'FilesStateSyncTask found, but it is orphaned. ' +
        'Removing and recreating it',
    )
    await removeRepeatableJob(bullJob, getMainQueue())
    await createSyncFilesStateTask(user)
  } else {
    log.log(
      {
        dxusd: user.dxuser,
        bullJob,
      },
      'FilesStateSyncTask found, everything is fine',
    )
  }
}

// TODO move to private when migrate to DI
export const doesUserNeedFullCheckup = (user: User): boolean => {
  const lastCheckupTime = user.lastDataCheckup ? user.lastDataCheckup.getTime() : 0
  const now = new Date().getTime()
  // N.B. getTime return milliseconds, config settings are in seconds
  return now - lastCheckupTime > config.workerJobs.userDataConsistencyReport.repeatSeconds * 1000
}

const enqueue = async (userCtx: UserCtx): Promise<Job<Task>> => {
  const queueData = {
    type: TASK_TYPE.USER_DATA_CONSISTENCY_REPORT,
    user: userCtx,
  }
  const jobId = `${TASK_TYPE.USER_DATA_CONSISTENCY_REPORT}.${userCtx.dxuser}`
  return await addToFileSyncQueueEnsureUnique(queueData, jobId)
}

// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
export class UserCheckupOperation extends BaseOperation<UserOpsCtx, never, void> {
  async run(): Promise<void> {
    const em = this.ctx.em
    const log = this.ctx.log
    const userCtx = this.ctx.user

    const user = await em.getRepository(User).findDxuser(userCtx.dxuser)
    if (!user) {
      log.error(
        {
          id: userCtx.id,
          dxuser: userCtx.dxuser,
        },
        'User not found',
      )
      return
    }

    log.log(
      {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      },
      'Starting user checkup',
    )

    log.log(
      {
        lastDataCheckup: user.lastDataCheckup,
        now: new Date(),
      },
      'Checking if user needs a UserDataConsistencyReport',
    )
    const doFullCheckup = doesUserNeedFullCheckup(user)
    if (doFullCheckup) {
      await enqueue(userCtx)
    }

    // If a user has open (unclosed) files in the pFDA database, and no
    // sync task is queued up
    const openFiles = await findUnclosedFilesOrAssets(em, userCtx.id)
    if (openFiles.length > 0) {
      log.log(
        {
          dxuser: userCtx.dxuser,
          openFiles,
        },
        'User has open files',
      )

      await recreateFilesStateStatusSyncIfMissing(this.ctx.user, log)
    }

    await new CheckUserJobsOperation(this.ctx as any).execute()
    await new CheckUserDbClustersOperation(this.ctx as any).execute()

    log.log(
      {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      },
      'Completed user checkup',
    )
  }
}
