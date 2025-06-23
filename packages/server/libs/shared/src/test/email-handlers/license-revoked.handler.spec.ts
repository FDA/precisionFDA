import { stub } from 'sinon'
import { expect } from 'chai'
import { LicenseRevokedHandler } from '@shared/domain/email/templates/handlers/license-revoked.handler'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseRepository } from '@shared/domain/accepted-license/accepted-license.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'
import { Organization } from '@shared/domain/org/org.entity'
import { License } from '@shared/domain/license/license.entity'
import { IdWithReceiversInputDTO } from '@shared/domain/email/dto/id-with-receivers-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'

describe('LicenseRevokedHandler', () => {
  const LICENSE_ID = 55
  const ACCEPTED_LICENSE_ID = 12
  const USER_ID = 34

  const emailClientSendEmailStub = stub()
  const acceptedLicenseRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const acceptedLicenseRepo = {
    findOneOrFail: acceptedLicenseRepoFindOneOrFailStub,
  } as unknown as AcceptedLicenseRepository
  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new LicenseRevokedHandler(acceptedLicenseRepo, userRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    acceptedLicenseRepoFindOneOrFailStub.reset()
    acceptedLicenseRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Krum'
      user.lastName = 'Pac'
      user.email = 'test@email.com'
      const license = new License(user)
      license.id = LICENSE_ID
      license.title = 'License Title'
      const acceptedLicense = new AcceptedLicense(license, user)
      acceptedLicense.id = ACCEPTED_LICENSE_ID

      const input = new IdWithReceiversInputDTO()
      input.id = ACCEPTED_LICENSE_ID
      input.receiverUserIds = [USER_ID]

      acceptedLicenseRepoFindOneOrFailStub
        .withArgs({ id: ACCEPTED_LICENSE_ID }, { populate: ['license'] })
        .returns(acceptedLicense)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).returns(user)
      emailClientSendEmailStub.reset()

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.licenseRevoked,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `Your license for ${license.title} has been revoked`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `License revoked for ${license.title}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'We regret to inform you that your license for',
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/licenses/${license.id}`,
      )
    })
  })
})
