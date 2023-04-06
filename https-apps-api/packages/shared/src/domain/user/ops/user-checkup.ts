/* eslint-disable @typescript-eslint/no-floating-promises */
import { BaseOperation } from '../../../utils/base-operation'
import { UserCtx, UserOpsCtx } from '../../../types'
import { SyncFilesStateOperation } from '../../user-file'
import { findUnclosedFilesOrAssets } from '../../user-file/user-file.helper'
import { queue, job, dbCluster } from '../../..'
import { isJobOrphaned } from '../../../queue/queue.utils'


const recreateFilesStateStatusSyncIfMissing = async (user: UserCtx, log: any): Promise<void> => {
  const bullJobId = SyncFilesStateOperation.getBullJobId(user.dxuser)
  const bullJob = await queue.findRepeatable(bullJobId)
  if (!bullJob) {
    log.warn({
      dxusd: user.dxuser,
      bullJobId,
    }, 'CheckUserJobsOperation: FilesStateSyncTask missing, recreating it')
    await queue.createSyncFilesStateTask(user)
  } else if (isJobOrphaned(bullJob)) {
    log.info({
      dxusd: user.dxuser,
      bullJob,
    }, 'CheckUserJobsOperation: FilesStateSyncTask found, but it is orphaned. '
       + 'Removing and recreating it')
    await queue.removeRepeatableJob(bullJob, queue.getMainQueue())
    await queue.createSyncFilesStateTask(user)
  } else {
    log.info({
      dxusd: user.dxuser,
      bullJob,
    }, 'CheckUserJobsOperation: FilesStateSyncTask found, everything is fine')
  }
}

// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
export class UserCheckupOperation extends BaseOperation<
UserOpsCtx,
never,
void
> {
  async run(): Promise<void> {
    const em = this.ctx.em
    const log = this.ctx.log
    const userCtx = this.ctx.user

    log.info({
      id: userCtx.id,
      dxuser: userCtx.dxuser,
    }, 'UserCheckupOperation: Starting user checkup')

    // If a user has open (unclosed) files in the pFDA database, and no
    // sync task is queued up
    const openFiles = await findUnclosedFilesOrAssets(em, userCtx.id)
    if (openFiles.length > 0) {
      log.info({
        dxuser: userCtx.dxuser,
        openFiles,
      }, 'UserCheckupOperation: User has open files')

      await recreateFilesStateStatusSyncIfMissing(this.ctx.user, log)
    }

    await new job.CheckUserJobsOperation(this.ctx as any).execute()
    await new dbCluster.CheckUserDbClustersOperation(this.ctx as any).execute()

    log.info({
      id: userCtx.id,
      dxuser: userCtx.dxuser,
    }, 'UserCheckupOperation: Completed user checkup')
  }
}
