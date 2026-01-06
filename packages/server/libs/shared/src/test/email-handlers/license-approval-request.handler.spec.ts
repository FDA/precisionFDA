import { stub } from 'sinon'
import { expect } from 'chai'
import { LicenseApprovalRequestHandler } from '@shared/domain/email/templates/handlers/license-approval-request.handler'
import { EmailClient } from '@shared/services/email-client'
import { LicenseRepository } from '@shared/domain/license/license.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { License } from '@shared/domain/license/license.entity'
import { Organization } from '@shared/domain/org/organization.entity'
import { User } from '@shared/domain/user/user.entity'
import { LicenseApprovalRequestDTO } from '@shared/domain/email/dto/license-approval-request.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'

describe('LicenseApprovalRequestHandler', () => {
  const USER_ID = 33
  const LICENSE_ID = 45

  const emailClientSendEmailStub = stub()
  const licenseRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const licenseRepo = {
    findOneOrFail: licenseRepoFindOneOrFailStub,
  } as unknown as LicenseRepository
  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new LicenseApprovalRequestHandler(licenseRepo, userRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    licenseRepoFindOneOrFailStub.reset()
    licenseRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Dostalos'
      user.lastName = 'Popapulis'
      user.email = 'test@email.com'
      const license = new License(user)
      license.title = 'Test License'
      license.id = LICENSE_ID

      emailClientSendEmailStub.reset()
      licenseRepoFindOneOrFailStub
        .withArgs({ id: LICENSE_ID }, { populate: ['user'] })
        .resolves(license)
      userRepoFindOneOrFailStub
        .withArgs({ id: USER_ID }, { populate: ['organization'] })
        .resolves(user)

      const input = new LicenseApprovalRequestDTO()
      input.license_id = LICENSE_ID
      input.user_id = USER_ID
      input.message = 'Hello, I would like to request approval for this license.'

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.licenseApprovalRequest,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `${user.firstName} ${user.lastName} requested approval for license: ${license.title}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'An approval has been requested for the license',
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/licenses/${license.id}`,
      )
    })
  })
})
