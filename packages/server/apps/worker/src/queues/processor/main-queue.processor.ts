import { Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { FOLLOW_UP_ACTION } from '@shared/domain/user-file/user-file.input'
import { createRunFollowUpActionJobTask } from '@shared/queue'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { FollowUpDecider } from '../../domain/user-file/follow-up-decider'
import { dbClusterSyncHandler } from '../../jobs/db-cluster-sync.handler'
import { jobStatusHandler } from '../../jobs/job-status.handler'
import { ProcessWithContext } from '../decorator/process-with-context'
import { BaseQueueProcessor } from './base-queue.processor'

@Processor(config.workerJobs.queues.default.name)
export class MainQueueProcessor extends BaseQueueProcessor {
  constructor(
    private readonly logger: Logger,
    private readonly user: UserContext,
    private readonly userFileService: UserFileService,
    private readonly challengeService: ChallengeService,
    private readonly dataPortalService: DataPortalService,
    private readonly followUpDecider: FollowUpDecider,
    private readonly spaceReportService: SpaceReportService,
  ) {
    super()
  }

  @ProcessWithContext(TASK_TYPE.SYNC_FILES_STATE)
  async syncFilesState(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new SyncFilesStateOperation(ctx).execute(input)
    })
  }

  @ProcessWithContext(TASK_TYPE.SYNC_JOB_STATUS)
  async syncJobStatus(job: Job) {
    await jobStatusHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_DBCLUSTER_STATUS)
  async syncDbClusterStatus(job: Job) {
    await dbClusterSyncHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_FILE_STATE)
  async syncFileState(job: Job) {
    const input = job.data.payload
    this.logger.log(`synchronizing file ${input.fileUid}`)
    const result = await this.userFileService.synchronizeFile(
      input.fileUid,
      input.isChallengeBotFile,
    )
    this.logger.log(`synchronizeFile result: ${result}`)

    if (!result) {
      throw new Error(
        `File ${input.fileUid} not ready for synchronizing, trigger repeat of the job by throwing error`,
      )
    } else {
      const followUpAction = await this.followUpDecider.decideNextAction(input.fileUid)
      if (followUpAction) {
        this.logger.log(`creating follow up action`, input)
        await createRunFollowUpActionJobTask(
          {
            uid: input.fileUid,
            followUpAction: followUpAction,
          },
          this.user,
        )
      }
    }
  }

  @ProcessWithContext(TASK_TYPE.CLOSE_FILE)
  async closeFile(job: Job) {
    const payload = job.data.payload
    await this.userFileService.closeFile(payload.fileUid, payload.followUpAction)
  }

  @ProcessWithContext(TASK_TYPE.FOLLOW_UP_ACTION)
  async followUpAction(job: Job) {
    const input = job.data.payload
    const actionsMap: Record<FOLLOW_UP_ACTION, () => Promise<void>> = {
      UPDATE_DATA_PORTAL_IMAGE_URL: () => this.dataPortalService.updateCardImageUrl(input.uid),
      UPDATE_CHALLENGE_IMAGE_URL: () => this.challengeService.updateCardImageUrl(input.uid),
      UPDATE_CHALLENGE_RESOURCE_URL: () => this.challengeService.updateResourceUrl(input.uid),
      COMPLETE_SPACE_REPORT: () => this.spaceReportService.completeReportForResultFile(input.uid),
    }

    const method = actionsMap[input.followUpAction.toString()]
    await method()
  }
}
