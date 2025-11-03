import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import * as eventHelper from '@shared/domain/event/event.helper'
import { Job } from '@shared/domain/job/job.entity'
import {
  buildIsOverMaxDuration,
  isStateActive,
  isStateTerminal,
} from '@shared/domain/job/job.helper'
import { JobRepository } from '@shared/domain/job/job.repository'
import { RequestTerminateJobOperation } from '@shared/domain/job/ops/terminate'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { CHALLENGE_BOT_USER_CONTEXT } from '@shared/domain/user-context/provider/challenge-bot-user-context.provider'
import { UserRepository } from '@shared/domain/user/user.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import * as queueHelper from '@shared/queue'

@Injectable()
export class ChallengeJobSynchronizationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userRepo: UserRepository,
    private readonly jobRepo: JobRepository,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT) private readonly challengeBotClient: PlatformClient,
    @Inject(CHALLENGE_BOT_USER_CONTEXT) private readonly challengeBotUserContext: UserContext,
  ) {}

  async checkChallengeJobs(): Promise<void> {
    this.logger.log('Running checkChallengeJobs')
    const challengeBotUser = await this.userRepo.findChallengeBot()
    const jobs = await this.jobRepo.findRunningJobsByUser({ userId: challengeBotUser.id })

    if (jobs.length > 0) {
      await this.em.transactional(async () => {
        this.logger.log(
          `Found ${jobs.length} non-terminal jobs for challenge bot user, syncing state`,
        )
        for (const job of jobs) {
          const platformJobData = await this.challengeBotClient.jobDescribe({
            jobDxId: job.dxid,
          })

          const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
          if (isStateActive(job.state) && isOverTerminateMaxDuration(job)) {
            await this.terminateJobOnPlatform(job)
            continue
          }

          if (isStateTerminal(platformJobData.state)) {
            this.logger.log(
              { remoteState: platformJobData.state },
              'Remote job state is terminal, will sync folders and files',
            )
            const eventEntity = await eventHelper.createJobClosed(
              challengeBotUser,
              job,
              platformJobData,
            )
            this.em.persist(eventEntity)
            await queueHelper.createSyncOutputsTask(
              { dxid: job.dxid },
              this.challengeBotUserContext,
            )
          }

          this.logger.log(
            {
              jobId: job.dxid,
              fromState: job.state,
              toState: platformJobData.state,
            },
            'Updating job state and metadata from platform',
          )

          job.describe = platformJobData
          job.state = platformJobData.state
        }
      })
    } else {
      this.logger.log('No non-terminal jobs found for challenge bot user')
    }
  }

  // TODO PFDA-6462 do this normally once we get rid of RequestTerminateJobOperation
  private async terminateJobOnPlatform(job: Job): Promise<void> {
    this.logger.log({ jobId: job.id, jobUid: job.uid }, 'Job marked as stale, trying to terminate')

    const terminateOp = new RequestTerminateJobOperation({
      log: this.logger,
      em: this.em,
      user: this.challengeBotUserContext,
    })
    await terminateOp.execute({ dxid: job.dxid })
  }
}
