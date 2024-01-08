import { EntityManager } from '@mikro-orm/core'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { User } from '@shared/domain/user/user.entity'
import { Task } from '@shared/queue/task.input'
import { Job as BullJob } from 'bull'
import { getChildLogger } from '../utils/logger'
import { JobHandler } from './job.handler'

class CheckChallengeJobsHandler implements JobHandler<Task> {
  private readonly em: EntityManager
  private readonly jobService: JobService

  constructor(em: EntityManager, jobService: JobService) {
    this.em = em
    this.jobService = jobService
  }

  async handle(bullJob: BullJob<Task>): Promise<void> {
    const requestId = String(bullJob.id)
    const logger = getChildLogger(requestId)

    logger.verbose(`CheckChallengeJobsHandler: running`)
    const challengeBotUser = await this.em
      .getRepository(User)
      .findOne({ dxuser: config.platform.challengeBotUser })
    if (challengeBotUser) {
      await this.checkChallengeBotJobs(challengeBotUser, logger)
    } else {
      logger.warn(
        'CheckChallengeJobsHandler: Challenge bot user not found, not starting challenge sync',
      )
    }
  }

  private async checkChallengeBotJobs(challengeBotUser: User, logger: Logger) {
    const jobs = await this.jobService.getNonTerminalJobs(challengeBotUser.id)
    if (jobs.length > 0) {
      await this.processJobs(challengeBotUser.id, jobs, logger)
    } else {
      logger.verbose('CheckChallengeJobsHandler: No non-terminal jobs found for challenge bot user')
    }
  }

  private async processJobs(challengeBotUserId: number, jobs: Job[], logger: Logger) {
    logger.verbose(
      'CheckChallengeJobsHandler: Found non-terminal users for challenge bot user, syncing outputs',
    )
    for (const job of jobs) {
      await this.jobService.syncOutputs(job.dxid, challengeBotUserId)
    }
  }
}

export { CheckChallengeJobsHandler }

