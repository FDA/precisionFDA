import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { TypedEmailBodyDto } from '@shared/domain/email/dto/typed-email-body.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { JobStaleCheckDTO } from '@shared/domain/job/dto/job-stale-check.dto'
import { SimpleJobDTO } from '@shared/domain/job/dto/simple-job.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { buildIsOverMaxDuration, isStateTerminal } from '@shared/domain/job/job.helper'
import { JobService } from '@shared/domain/job/job.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class JobStaleCheckFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly jobService: JobService,
    private readonly emailService: EmailService,
    private readonly entityLinkService: EntityLinkService,
    private readonly em: SqlEntityManager,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminPlatformClient: PlatformClient,
  ) {}

  async checkAndNotifyStaleJobs(): Promise<void> {
    this.logger.log('Starting stale jobs check and notification process')
    const runningJobs = await this.jobService.findAllRunningJobs()
    if (runningJobs.length === 0) {
      this.logger.log({}, 'No running jobs found, skipping notification')
      return
    }

    const isOverMaxDuration = buildIsOverMaxDuration('notify')

    const jobsInfo = new Map<number, JobStaleCheckDTO>()
    let hasStaleJobs = false
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
        hasStaleJobs = true
        jobsInfo.get(job.user.id).staleJobs.push(simpleJob)
      } else {
        jobsInfo.get(job.user.id).nonStaleJobs.push(simpleJob)
      }
    }

    if (!hasStaleJobs) {
      this.logger.log('No stale jobs found, skipping admin report')
      return
    }

    await this.sendRunningJobsReportToAdmin(jobsInfo)
    await this.synchronizeStaleJobs(runningJobs)
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

  /**
   * Synchronizes stale jobs past the termination threshold using the admin platform client.
   * This handles cases where the owning user's sync task is no longer active
   * (e.g. token expired and user will never log in again).
   */
  private async synchronizeStaleJobs(runningJobs: Job[]): Promise<void> {
    const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
    const staleJobs = runningJobs.filter(job => !isStateTerminal(job.state) && isOverTerminateMaxDuration(job))

    if (staleJobs.length === 0) {
      this.logger.log('No jobs past termination threshold, skipping admin synchronization')
      return
    }

    this.logger.log(
      { count: staleJobs.length },
      'Found jobs past termination threshold, synchronizing via admin client',
    )

    for (const job of staleJobs) {
      await this.synchronizeStaleJob(job)
    }
  }

  private async synchronizeStaleJob(job: Job): Promise<void> {
    let temporaryProjectAccess: string | undefined

    try {
      let platformJobData: JobDescribeResponse
      try {
        platformJobData = await this.adminPlatformClient.jobDescribe({
          jobDxId: job.dxid,
        })
      } catch (err) {
        if (!this.isUnauthorized(err)) {
          throw err
        }

        if (!temporaryProjectAccess) {
          temporaryProjectAccess = await this.ensureProjectAccess(job)
        }
        platformJobData = await this.adminPlatformClient.jobDescribe({
          jobDxId: job.dxid,
        })
      }

      this.logger.log(
        { jobId: job.id, jobDxid: job.dxid, platformState: platformJobData.state },
        'Received platform state for stale job',
      )

      if (isStateTerminal(platformJobData.state)) {
        this.logger.log(
          { jobId: job.id, jobDxid: job.dxid, state: platformJobData.state },
          'Stale job is already terminal on platform, updating local state',
        )
        wrap(job).assign({ describe: platformJobData, state: platformJobData.state }, { em: this.em })
        await this.em.flush()
        return
      }

      if (job.state === JOB_STATE.TERMINATING) {
        this.logger.log(
          { jobId: job.id, jobDxid: job.dxid },
          'Stale job is in terminating state locally but not yet terminal on platform, skipping re-termination',
        )
        return
      }

      this.logger.log(
        { jobId: job.id, jobDxid: job.dxid },
        'Stale job is still active on platform, requesting termination via admin client',
      )

      try {
        await this.adminPlatformClient.jobTerminate({ jobId: job.dxid })
      } catch (err) {
        if (!this.isUnauthorized(err)) {
          throw err
        }

        if (!temporaryProjectAccess) {
          temporaryProjectAccess = await this.ensureProjectAccess(job)
        }
        await this.adminPlatformClient.jobTerminate({ jobId: job.dxid })
      }

      job.state = JOB_STATE.TERMINATING
      await this.em.flush()
    } catch (err) {
      this.logger.error(
        { jobId: job.id, jobDxid: job.dxid, error: err },
        'Failed to synchronize stale job via admin client',
      )
    } finally {
      if (temporaryProjectAccess) {
        await this.adminPlatformClient.projectLeave({ projectDxid: temporaryProjectAccess })
      }
    }
  }

  private async ensureProjectAccess(job: Job): Promise<string | undefined> {
    if (!job.project) {
      return undefined
    }

    await this.adminPlatformClient.projectInvite(job.project, `user-${config.platform.adminUser}`, 'CONTRIBUTE')

    this.logger.log(
      { jobId: job.id, jobDxid: job.dxid, project: job.project },
      'Temporarily granted admin client project access for stale job synchronization',
    )

    return job.project
  }

  private isUnauthorized(error: unknown): boolean {
    const err = error as {
      props?: {
        clientStatusCode?: number
        clientResponse?: {
          error?: {
            type?: string
            message?: string
          }
        }
      }
    }

    const statusUnauthorized = err?.props?.clientStatusCode === 401
    const responseError = err?.props?.clientResponse?.error
    const permissionDeniedType = responseError?.type === 'PermissionDenied'
    const permissionDeniedViewMessage =
      typeof responseError?.message === 'string' &&
      responseError.message.includes('VIEW permission required in project-')

    return statusUnauthorized || (permissionDeniedType && permissionDeniedViewMessage)
  }
}
