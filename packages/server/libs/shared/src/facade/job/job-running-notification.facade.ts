import { Injectable, Logger } from '@nestjs/common'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class JobRunningNotificationFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly jobService: JobService,
    private readonly emailService: EmailService,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  async notifyOwnersOfRunningJobs(): Promise<void> {
    this.logger.log('Starting running jobs owner notification process')
    const runningJobs = await this.jobService.findAllRunningJobs()
    if (runningJobs.length === 0) {
      this.logger.log({}, 'No running jobs found, skipping owner notification')
      return
    }

    const jobsByOwner = new Map<number, { user: SimpleUserDTO; jobs: SimpleJobDTO[] }>()
    for (const job of runningJobs) {
      const jobLink = await this.entityLinkService.getUiLink(job)
      const simpleJob = SimpleJobDTO.fromEntity(job, jobLink)
      if (!jobsByOwner.has(job.user.id)) {
        const user = job.user.getEntity()
        jobsByOwner.set(job.user.id, {
          user: SimpleUserDTO.fromEntity(user),
          jobs: [],
        })
      }
      jobsByOwner.get(job.user.id).jobs.push(simpleJob)
    }

    for (const [, { user, jobs }] of jobsByOwner) {
      const input: TypedEmailBodyDto<EMAIL_TYPES.userRunningJobsReport> = {
        type: EMAIL_TYPES.userRunningJobsReport,
        input: {
          jobOwner: user,
          runningJobs: jobs,
        },
      }
      await this.emailService.sendEmail(input)
    }
    this.logger.log('Completed running jobs owner notification process')
  }
}
