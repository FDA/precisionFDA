import { stub } from 'sinon'
import { expect } from 'chai'
import { LicenseApprovedHandler } from '@shared/domain/email/templates/handlers/license-approved.handler'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { Organization } from '@shared/domain/org/organization.entity'
import { IdWithReceiversInputDTO } from '@shared/domain/email/dto/id-with-receivers-input.dto'
import { License } from '@shared/domain/license/license.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'

describe('LicenseApprovedHandler', () => {
  const ACCEPTED_LICENSE_ID = 10
  const LICENSE_ID = 1
  const USER_ID = 2

  const emailClientSendEmailStub = stub()
  const licenseAcceptedRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const licenseAcceptedRepo = {
    findOneOrFail: licenseAcceptedRepoFindOneOrFailStub,
  } as unknown as AcceptedLicenseRepository
  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new LicenseApprovedHandler(licenseAcceptedRepo, userRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    licenseAcceptedRepoFindOneOrFailStub.reset()
    licenseAcceptedRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.firstName = 'Ali'
      user.lastName = 'Menty'
      user.email = 'test@email.com'
      const license = new License(user)
      license.title = 'Test License'
      license.id = LICENSE_ID
      const acceptedLicense = new AcceptedLicense(license, user)

      licenseAcceptedRepoFindOneOrFailStub
        .withArgs({ id: ACCEPTED_LICENSE_ID }, { populate: ['license'] })
        .resolves(acceptedLicense)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).resolves(user)
      emailClientSendEmailStub.reset()

      const input = new IdWithReceiversInputDTO()
      input.id = ACCEPTED_LICENSE_ID
      input.receiverUserIds = [USER_ID]

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.licenseApproved,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `You were approved for ${license.title}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Dear ${user.firstName} ${user.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'We are happy to inform you that the license request for',
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/licenses/${license.id}-test-license/items`,
      )
    })
  })
})
