import { stub } from 'sinon'
import { ExpertAddedHandler } from '@shared/domain/email/templates/handlers/expert-added.handler'
import { EmailClient } from '@shared/services/email-client'
import { ExpertRepository } from '@shared/domain/expert/expert.repository'
import { Organization } from '@shared/domain/org/org.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { Expert } from '@shared/domain/expert/expert.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

describe('ExpertAddedHandler', () => {
  const EXPERT_ID = 34
  const expertRepoFindOneOrFailStub = stub()
  const emailClientSendEmailStub = stub()

  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const expertRepo = {
    findOneOrFail: expertRepoFindOneOrFailStub,
  } as unknown as ExpertRepository

  const getHandler = () => {
    return new ExpertAddedHandler(expertRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    expertRepoFindOneOrFailStub.reset()
    expertRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.firstName = 'Skluzan'
      user.lastName = 'Tavic'
      user.email = 'test@email.com'
      const expert = new Expert(user)
      expertRepoFindOneOrFailStub
        .withArgs({ id: EXPERT_ID }, { populate: ['user'] })
        .resolves(expert)
      emailClientSendEmailStub.reset()

      const input = new ObjectIdInputDTO()
      input.id = EXPERT_ID
      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.expertAdded)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.deep.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq(
        `A new Expert Q&A Session was created for ${user.firstName} ${user.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `A new Expert Q&A Session has been created featuring ${user.firstName} ${user.lastName}.`,
      )
    })
  })
})
