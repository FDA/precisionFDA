import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { JobStaleCheckDTO } from '@shared/domain/job/dto/job-stale-check.dto'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { buildIsOverMaxDuration } from '@shared/domain/job/job.helper'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class JobStaleCheckFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly jobService: JobService,
    private readonly emailService: EmailService,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  /**
   * Asynchronously checks for stale jobs and performs necessary actions.
   *
   * The method performs the following steps:
   * 1. Retrieves all running jobs.
   * 2. Logs and returns an empty array if no running jobs are found.
   * 3. Filters out the stale jobs and non-stale jobs based on a maximum duration threshold and logs the result.
   * 4. Generates and sends an email report to the admin user and a predefined email address, containing details of stale and non-stale jobs.
   * 5. Generates and sends individual email notifications to each job owner with details of their running jobs.
   *
   * @returns {Promise<void>} A promise that resolves when the stale job check and notification process is complete.
   */
  async checkAndNotifyStaleJobs(): Promise<void> {
    this.logger.log('Starting stale jobs check and notification process')
    const runningJobs = await this.jobService.findAllRunningJobs()
    if (runningJobs.length === 0) {
      this.logger.log({}, 'No running jobs found, skipping notification')
      return
    }

    const isOverMaxDuration = buildIsOverMaxDuration('notify')

    const jobsInfo = new Map<number, JobStaleCheckDTO>()
    await this.em.populate(runningJobs, ['user'])
    for (const job of runningJobs) {
      const jobLink = await this.entityLinkService.getUiLink(job)
      const simpleJob = SimpleJobDTO.fromEntity(job, jobLink)
      if (!jobsInfo.has(job.user.id)) {
        const user = job.user.getEntity()
        jobsInfo.set(job.user.id, {
          user: SimpleUserDTO.fromEntity(user),
          staleJobs: [],
          nonStaleJobs: [],
        })
      }
      if (isOverMaxDuration(job)) {
        jobsInfo.get(job.user.id).staleJobs.push(simpleJob)
      } else {
        jobsInfo.get(job.user.id).nonStaleJobs.push(simpleJob)
      }
    }

    await this.sendRunningJobsReportToAdmin(jobsInfo)
    await this.sendRunningJobsToOwners(jobsInfo)
    this.logger.log('Completed stale jobs check and notification process')
  }

  private async sendRunningJobsReportToAdmin(jobsInfo: Map<number, JobStaleCheckDTO>): Promise<void> {
    const input: TypedEmailBodyDto<EMAIL_TYPES.staleJobsReport> = {
      type: EMAIL_TYPES.staleJobsReport,
      input: {
        jobsInfo: Array.from(jobsInfo.values()),
        maxDuration: (config.workerJobs.syncJob.staleJobsTerminateAfter ?? -1).toString(),
      },
    }
    await this.emailService.sendEmail(input)
  }

  private async sendRunningJobsToOwners(jobsInfo: Map<number, JobStaleCheckDTO>): Promise<void> {
    for (const [, { user, staleJobs, nonStaleJobs }] of jobsInfo) {
      const input: TypedEmailBodyDto<EMAIL_TYPES.userRunningJobsReport> = {
        type: EMAIL_TYPES.userRunningJobsReport,
        input: {
          jobOwner: user,
          runningJobs: staleJobs.concat(nonStaleJobs),
        },
      }
      await this.emailService.sendEmail(input)
    }
  }
}
