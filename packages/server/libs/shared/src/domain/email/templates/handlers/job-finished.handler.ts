import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { pipe, uniqBy } from 'ramda'
import { EmailConfigItem } from '../../email.config'
import { jobFinishedTemplate } from '../mjml/job-finished.template'
import { buildFilterByUserSettings, buildIsNotificationEnabled } from '../../email.helper'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { Injectable } from '@nestjs/common'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EmailClient } from '@shared/services/email-client'
import { OpsCtx } from '@shared/types'
import { JobRepository } from '@shared/domain/job/job.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import {
  EmailTypeToContextMap,
  JobFinishedContext,
} from '@shared/domain/email/dto/email-type-to-context.map'
import { EmailTypeToTemplateInputMap } from '@shared/domain/email/dto/email-type-to-template-input.map'

@Injectable()
export class JobFinishedEmailHandler extends EmailHandler<EMAIL_TYPES.jobFinished> {
  protected emailType = EMAIL_TYPES.jobFinished as const
  protected inputDto = JobEventDTO
  protected getBody = jobFinishedTemplate

  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly userRepo: UserRepository,
    protected readonly jobRepo: JobRepository,
    protected readonly emailClient: EmailClient,
  ) {
    super(emailClient)
  }

  protected async getContextualData(
    input: JobEventDTO,
  ): Promise<EmailTypeToContextMap[EMAIL_TYPES.jobFinished]> {
    const job = await this.jobRepo.findOneOrFail({ id: input.jobId })
    return {
      input,
      job,
    }
  }

  protected async determineReceivers(context: JobFinishedContext): Promise<User[]> {
    if (context.job.isPublic()) {
      this.logger.log({ jobId: context.job.id }, 'Job is public, no one is notified')
      return []
    }
    // TODO PFDA-6311: other users if job runs in a space?
    if (context.job.isInSpace()) {
      this.logger.log({ jobId: context.job.id }, 'Job is in a space, todo')
      return []
    }
    // JOB IS PRIVATE
    const owner = await this.userRepo.findOneOrFail(
      { id: context.job.user.id },
      { populate: ['notificationPreference'] },
    )

    const ctx: OpsCtx = {
      em: this.em,
      log: this.logger,
    }
    const config: EmailConfigItem = {
      emailId: this.emailType,
      name: 'jobFinished',
      handlerClass: JobFinishedEmailHandler,
    }

    const isEnabledFn = buildIsNotificationEnabled('job_finished', ctx)
    const filterFn = buildFilterByUserSettings({ ...ctx, config }, isEnabledFn)
    const filterPipe = pipe(
      // User[] -> User[]
      filterFn,
      uniqBy((u: User) => u.id),
    )
    return filterPipe([owner])
  }

  protected getSubject(_receiver: User, context: JobFinishedContext): string {
    return `Execution ${context.job.name} finished`
  }

  protected getTemplateInput(
    receiver: User,
    context: JobFinishedContext,
  ): EmailTypeToTemplateInputMap[EMAIL_TYPES.jobFinished] {
    return {
      receiver,
      content: { job: { id: context.job.id, uid: context.job.uid, name: context.job.name } },
    }
  }
}
