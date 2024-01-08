/* eslint-disable @typescript-eslint/no-floating-promises */
import { CheckUserDbClustersOperation } from '@shared/domain/db-cluster/ops/check-user-dbs'
import { CheckUserJobsOperation } from '@shared/domain/job/ops/check-user-jobs'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { User } from '@shared/domain/user/user.entity'
import {
  createSyncFilesStateTask,
  findRepeatable,
  getMainQueue,
  removeRepeatableJob,
} from '@shared/queue'
import { BaseOperation } from '@shared/utils/base-operation'
import { isJobOrphaned } from '../../../queue/queue.utils'
import { UserCtx, UserOpsCtx } from '../../../types'
import { findUnclosedFilesOrAssets } from '../../user-file/user-file.helper'
import { UserDataConsistencyReportOperation } from './user-data-consistency-report'

const recreateFilesStateStatusSyncIfMissing = async (user: UserCtx, log: any): Promise<void> => {
  const bullJobId = SyncFilesStateOperation.getBullJobId(user.dxuser)
  const bullJob = await findRepeatable(bullJobId)
  if (!bullJob) {
    log.warn({
      dxusd: user.dxuser,
      bullJobId,
    }, 'CheckUserJobsOperation: FilesStateSyncTask missing, recreating it')
    await createSyncFilesStateTask(user)
  } else if (isJobOrphaned(bullJob)) {
    log.verbose({
      dxusd: user.dxuser,
      bullJob,
    }, 'CheckUserJobsOperation: FilesStateSyncTask found, but it is orphaned. '
       + 'Removing and recreating it')
    await removeRepeatableJob(bullJob, getMainQueue())
    await createSyncFilesStateTask(user)
  } else {
    log.verbose({
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

    const user = await em.getRepository(User).findDxuser(userCtx.dxuser)
    if (!user) {
      log.error({
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      }, 'UserCheckupOperation: User not found')
      return
    }

    log.verbose({
      id: userCtx.id,
      dxuser: userCtx.dxuser,
    }, 'UserCheckupOperation: Starting user checkup')

    log.verbose({
      lastDataCheckup: user.lastDataCheckup,
      now: new Date(),
    }, 'UserCheckupOperation: Checking if user needs a UserDataConsistencyReport')
    const doFullCheckup = UserDataConsistencyReportOperation.doesUserNeedFullCheckup(user)
    if (doFullCheckup) {
      await UserDataConsistencyReportOperation.enqueue(userCtx)
    }

    // If a user has open (unclosed) files in the pFDA database, and no
    // sync task is queued up
    const openFiles = await findUnclosedFilesOrAssets(em, userCtx.id)
    if (openFiles.length > 0) {
      log.verbose({
        dxuser: userCtx.dxuser,
        openFiles,
      }, 'UserCheckupOperation: User has open files')

      await recreateFilesStateStatusSyncIfMissing(this.ctx.user, log)
    }

    await new CheckUserJobsOperation(this.ctx as any).execute()
    await new CheckUserDbClustersOperation(this.ctx as any).execute()

    log.verbose({
      id: userCtx.id,
      dxuser: userCtx.dxuser,
    }, 'UserCheckupOperation: Completed user checkup')
  }
}
