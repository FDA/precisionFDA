import { EntityManager } from '@mikro-orm/core'
import { Logger } from '@nestjs/common'
import { config, job as jobDomain, queue, user } from '@shared'
import { Job as BullJob } from 'bull'
import { getChildLogger } from '../utils'
import { JobHandler } from './job.handler'

class CheckChallengeJobsHandler implements JobHandler<queue.types.Task> {
  private readonly em: EntityManager
  private readonly jobService: jobDomain.JobService

  constructor(em: EntityManager, jobService: jobDomain.JobService) {
    this.em = em
    this.jobService = jobService
  }

  async handle(bullJob: BullJob<queue.types.Task>): Promise<void> {
    const requestId = String(bullJob.id)
    const logger = getChildLogger(requestId)

    logger.verbose(`CheckChallengeJobsHandler: running`)
    const challengeBotUser = await this.em
      .getRepository(user.User)
      .findOne({ dxuser: config.platform.challengeBotUser })
    if (challengeBotUser) {
      await this.checkChallengeBotJobs(challengeBotUser, logger)
    } else {
      logger.warn(
        'CheckChallengeJobsHandler: Challenge bot user not found, not starting challenge sync',
      )
    }
  }

  private async checkChallengeBotJobs(challengeBotUser: user.User, logger: Logger) {
    const jobs = await this.jobService.getNonTerminalJobs(challengeBotUser.id)
    if (jobs.length > 0) {
      await this.processJobs(challengeBotUser.id, jobs, logger)
    } else {
      logger.verbose('CheckChallengeJobsHandler: No non-terminal jobs found for challenge bot user')
    }
  }

  private async processJobs(challengeBotUserId: number, jobs: jobDomain.Job[], logger: Logger) {
    logger.verbose(
      'CheckChallengeJobsHandler: Found non-terminal users for challenge bot user, syncing outputs',
    )
    for (const job of jobs) {
      await this.jobService.syncOutputs(job.dxid, challengeBotUserId)
    }
  }
}

export { CheckChallengeJobsHandler }

