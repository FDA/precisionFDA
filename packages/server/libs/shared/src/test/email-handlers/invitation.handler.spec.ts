import { stub } from 'sinon'
import { expect } from 'chai'
import { InvitationHandler } from '@shared/domain/email/templates/handlers/invitation.handler'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { config } from '@shared/config'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { EmailClient } from '@shared/services/email-client'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

describe('InvitationHandler', () => {
  const INVITATION_ID = 30

  const emailClientSendEmailStub = stub()
  const invitationRepoFindOneOrFailStub = stub()

  const invitationRepo = {
    findOneOrFail: invitationRepoFindOneOrFailStub,
  } as unknown as InvitationRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new InvitationHandler(invitationRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    invitationRepoFindOneOrFailStub.reset()
    invitationRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const invitation = new Invitation()
      invitation.id = INVITATION_ID
      invitation.firstName = 'Horst'
      invitation.lastName = 'Furtmustahl'
      invitation.email = 'test@email.com'
      invitation.address1 = 'address1'
      invitation.address2 = 'address2'
      invitation.phone = '1234567890'
      invitation.duns = '123456789'
      invitation.extras = {
        req_reason: 'req_reason',
        req_data: 'req_data',
        req_software: 'req_software',
        research_intent: true,
        clinical_intent: true,
        participate_intent: true,
        organize_intent: true,
      }
      invitation.ip = 'ip-124'

      invitationRepoFindOneOrFailStub.withArgs({ id: INVITATION_ID }).resolves(invitation)
      emailClientSendEmailStub.reset()

      const input = new ObjectIdInputDTO()
      input.id = INVITATION_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.invitation)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(config.pfdaEmail)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `New access request from ${invitation.firstName} ${invitation.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.firstName)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.lastName)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.address1)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.address2)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.phone)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.duns)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.duns)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(invitation.duns)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        invitation.extras.req_reason,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        invitation.extras.req_data,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        invitation.extras.req_software,
      )
    })
  })
})
