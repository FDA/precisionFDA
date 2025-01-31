import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { CheckUserDbClustersOperation } from '@shared/domain/db-cluster/ops/check-user-dbs'
import { CheckUserJobsOperation } from '@shared/domain/job/ops/check-user-jobs'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { findUnclosedFilesOrAssets } from '@shared/domain/user-file/user-file.helper'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { findRepeatable, getMainQueue, removeRepeatableJob } from '@shared/queue'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { isJobOrphaned } from '@shared/queue/queue.utils'
import { UserOpsCtx, WorkerOpsCtx } from '@shared/types'
import { Job } from 'bull'

// Check jobs for a given user, to be run when user logs in to clean up
// old states that are stuck because sync jobs are missing.
@Injectable()
export class UserCheckupFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async runCheckup(job: Job): Promise<void> {
    const user = await this.em.getRepository(User).findDxuser(this.user.dxuser)
    if (!user) {
      this.logger.error(
        {
          id: this.user.id,
          dxuser: this.user.dxuser,
        },
        'User not found',
      )
      return
    }

    this.logger.log(
      {
        id: this.user.id,
        dxuser: this.user.dxuser,
      },
      'Starting user checkup',
    )

    this.logger.log(
      {
        lastDataCheckup: user.lastDataCheckup,
        now: new Date(),
      },
      'Checking if user needs a UserDataConsistencyReport',
    )
    const doFullCheckup = this.doesUserNeedFullCheckup(user)
    if (doFullCheckup) {
      await this.fileSyncQueueJobProducer.createUserDataConsistencyReportJobTask()
    }

    // If a user has open (unclosed) files in the pFDA database, and no
    // sync task is queued up
    const openFiles = await findUnclosedFilesOrAssets(this.em, this.user.id)
    if (openFiles.length > 0) {
      this.logger.log(
        {
          dxuser: this.user.dxuser,
          openFiles,
        },
        'User has open files',
      )

      await this.recreateFilesStateStatusSyncIfMissing()
    }

    const ctx = { em: this.em, user: this.user, log: this.logger, job } as WorkerOpsCtx<UserOpsCtx>
    await new CheckUserJobsOperation(ctx).execute()
    await new CheckUserDbClustersOperation(ctx).execute()

    this.logger.log(
      {
        id: this.user.id,
        dxuser: this.user.dxuser,
      },
      'Completed user checkup',
    )
  }

  private doesUserNeedFullCheckup(user: User): boolean {
    const lastCheckupTime = user.lastDataCheckup ? user.lastDataCheckup.getTime() : 0
    const now = new Date().getTime()
    // N.B. getTime return milliseconds, config settings are in seconds
    return now - lastCheckupTime > config.workerJobs.userDataConsistencyReport.repeatSeconds * 1000
  }

  private async recreateFilesStateStatusSyncIfMissing(): Promise<void> {
    const bullJobId = SyncFilesStateOperation.getBullJobId(this.user.dxuser)
    const bullJob = await findRepeatable(bullJobId)
    if (!bullJob) {
      this.logger.warn(
        {
          dxusd: this.user.dxuser,
          bullJobId,
        },
        'FilesStateSyncTask missing, recreating it',
      )
      await this.mainQueueJobProducer.createSyncFilesStateTask(this.user)
    } else if (isJobOrphaned(bullJob)) {
      this.logger.log(
        {
          dxusd: this.user.dxuser,
          bullJob,
        },
        'FilesStateSyncTask found, but it is orphaned. ' + 'Removing and recreating it',
      )
      await removeRepeatableJob(bullJob, getMainQueue())
      await this.mainQueueJobProducer.createSyncFilesStateTask(this.user)
    } else {
      this.logger.log(
        {
          dxusd: this.user.dxuser,
          bullJob,
        },
        'FilesStateSyncTask found, everything is fine',
      )
    }
  }
}
