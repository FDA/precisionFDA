import { Job as BullJob } from 'bull'
import { config, job as jobDomain, queue, user } from '@shared'
import { getChildLogger } from '../utils'
import { JobHandler } from './job.handler'
import { EntityManager } from '@mikro-orm/core'
import pino from 'pino'

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

    logger.info(`CheckChallengeJobsHandler: running`)
    const challengeBotUser = await this.em.getRepository(user.User).findOne({ dxuser: config.platform.challengeBotUser })
    if (challengeBotUser) {
      await this.checkChallengeBotJobs(challengeBotUser, logger)
    } else {
      logger.warn('CheckChallengeJobsHandler: Challenge bot user not found, not starting challenge sync')
    }
  }

  private async checkChallengeBotJobs(challengeBotUser: user.User, logger: pino.Logger) {
    const jobs = await this.jobService.getNonTerminalJobs(challengeBotUser.id)
    if (jobs.length > 0) {
      await this.processJobs(challengeBotUser.id, jobs, logger)
    } else {
      logger.info('CheckChallengeJobsHandler: No non-terminal jobs found for challenge bot user')
    }
  }

  private async processJobs(challengeBotUserId: number, jobs: jobDomain.Job[], logger: pino.Logger) {
    logger.info('CheckChallengeJobsHandler: Found non-terminal users for challenge bot user, syncing outputs')
    for (const job of jobs) {
      await this.jobService.syncOutputs(job.dxid, challengeBotUserId)
    }
  }
}

export { CheckChallengeJobsHandler }

