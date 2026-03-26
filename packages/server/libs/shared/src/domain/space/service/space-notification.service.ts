import { Injectable } from '@nestjs/common'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  spaceCreatedTemplate,
  SpaceCreatedTemplateInput,
} from '@shared/domain/email/templates/mjml/space/space-created.template'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'

@Injectable()
export class SpaceNotificationService {
  constructor(
    private readonly emailQueueJobProducer: EmailQueueJobProducer,
    private readonly userContext: UserContext,
  ) {}

  async notifySpaceCreated(space: Space, user: User): Promise<void> {
    const emailInput: SpaceCreatedTemplateInput = {
      firstName: user?.firstName,
      space: {
        name: space.name,
        id: space.id,
      },
    }
    const body = buildEmailTemplate<SpaceCreatedTemplateInput>(spaceCreatedTemplate, emailInput)
    const email = user.email
    const emailTask: EmailSendInput = {
      emailType: EMAIL_TYPES.spaceCreated,
      to: email,
      subject: `[precisionFDA] Your Space was created: ${space.name}`,
      body,
    }

    await this.emailQueueJobProducer.createSendEmailTask(
      emailTask,
      this.userContext,
      `${space.id.toString()}-${user.email}`,
    )
  }
}
