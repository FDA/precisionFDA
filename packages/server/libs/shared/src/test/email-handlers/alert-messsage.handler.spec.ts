import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { AlertMessageInputDTO } from '@shared/domain/email/dto/alert-message-input.dto'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EmailClient } from '@shared/services/email-client'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'

describe('AlertMessageHandler', () => {
  const userRepoFindStub = stub()
  const emailClientSendEmailStub = stub()

  const userRepo = {
    find: userRepoFindStub,
  } as unknown as UserRepository

  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  beforeEach(() => {
    userRepoFindStub.reset()
    userRepoFindStub.throws()

    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  const getAlertMessageHandler = () => {
    return new AlertMessageHandler(emailClient, userRepo)
  }

  describe('#sendEmail', () => {
    it('basic', async () => {
      emailClientSendEmailStub.reset()
      const receiverUserIds = [7, 8]
      const receivers = [
        { email: 'email7@email.com' } as User,
        { email: 'email8@email.com' } as User,
      ]
      userRepoFindStub.withArgs({ id: { $in: receiverUserIds } }).resolves(receivers)
      const inputDto = new AlertMessageInputDTO()
      inputDto.subject = 'test-subject'
      inputDto.message = 'test-message'
      inputDto.receiverUserIds = receiverUserIds

      const alertMessageHandler = getAlertMessageHandler()
      await alertMessageHandler.sendEmail(inputDto)

      expect(userRepoFindStub.calledOnce).to.be.true()
      expect(userRepoFindStub.firstCall.args).to.deep.equal([{ id: { $in: receiverUserIds } }])

      expect(emailClientSendEmailStub.calledTwice).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.equal(
        EMAIL_TYPES.alertMessage,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.deep.equal('test-subject')
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.deep.equal(receivers[0].email)
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain('test-message')
      expect(emailClientSendEmailStub.secondCall.args[0].emailType).to.equal(
        EMAIL_TYPES.alertMessage,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].subject).to.deep.equal('test-subject')
      expect(emailClientSendEmailStub.secondCall.args[0].to).to.deep.equal(receivers[1].email)
      expect(emailClientSendEmailStub.secondCall.args[0].body).to.contain('test-message')
    })
  })
})
