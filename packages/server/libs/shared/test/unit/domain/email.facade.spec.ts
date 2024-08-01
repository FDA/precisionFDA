import { EmailFacade } from '@shared/domain/email/email.facade'
import { stub } from 'sinon'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { EMAIL_TYPES, EmailProcessInput } from '@shared/domain/email/email.config'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { expect } from 'chai'

describe('EmailFacade', () => {
  const userId = 10

  let emailFacade: EmailFacade
  const sendEmailStub = stub()
  const prepareEmailsStub = stub()

  let emailPrepareService: EmailPrepareService
  let emailSendService: EmailSendService

  beforeEach(async () => {
    emailPrepareService = {
      prepareEmails: prepareEmailsStub,
    } as unknown as EmailPrepareService
    emailSendService = {
      sendEmail: sendEmailStub,
    } as unknown as EmailSendService

    emailFacade = new EmailFacade(emailPrepareService, emailSendService)
  })

  context('sendEmail', () => {
    it('should send an email', async () => {
      const input = {
        input: {
          initUserId: userId,
          spaceId: 3,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.space_locked,
        },
        receiverUserIds: [],
        emailTypeId: EMAIL_TYPES.spaceChanged,
      } as unknown as EmailProcessInput

      const preparedEmail = {
        to: 'john.doe@email.com',
        subject: 'John Doe locked the space Space',
        emailType: EMAIL_TYPES.spaceChanged,
      }

      prepareEmailsStub.returns([preparedEmail])

      await emailFacade.sendEmail(input)

      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.firstArg).to.deep.eq(preparedEmail)
    })
  })
})
