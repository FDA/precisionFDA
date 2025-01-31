import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { LicenseApprovedHandler } from '@shared/domain/email/templates/handlers/license-approved.handler'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

describe('LicenseApprovedHandler', () => {
  const LICENSE_ID = 1
  const USER_ID = 2

  const emFindOneOrFailStub = stub()
  const entityManager = {
    findOneOrFail: emFindOneOrFailStub,
  } as unknown as EntityManager

  const log = {
    log: stub(),
    error: stub(),
  } as unknown as Logger

  const userOpsCtx: UserOpsCtx = {
    em: entityManager,
    user: {
      id: 1,
      accessToken: 'accessToken',
      dxuser: 'dxuser',
    },
    log,
  }

  const createMockUser = (id: number, email: string, firstName = 'John', lastName = 'Doe') =>
    ({
      id,
      firstName,
      lastName,
      email,
    }) as unknown as User

  const createMockAcceptedLicense = (id: number, user: User) =>
    ({
      id,
      license: {
        getEntity: () => ({
          id: LICENSE_ID,
          title: 'Sample License',
          user: {
            getEntity: () => user,
          },
        }),
      },
    }) as unknown as AcceptedLicense

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getLicenseApprovedHandler = (licenseId: number, userId: number) =>
    new LicenseApprovedHandler(EMAIL_TYPES.licenseApproved, { id: licenseId }, userOpsCtx, [userId])

  it('getNotificationKey should return correct notification key', () => {
    const handler = getLicenseApprovedHandler(LICENSE_ID, USER_ID)
    expect(handler.getNotificationKey()).to.eq('license_approved')
  })

  it('determineReceivers should return the correct receivers', async () => {
    const licenseOwnerUser = createMockUser(3, 'owner@domain.com')
    const acceptedLicense = createMockAcceptedLicense(LICENSE_ID, licenseOwnerUser)

    emFindOneOrFailStub
      .withArgs(AcceptedLicense, { id: LICENSE_ID }, { populate: ['license'] })
      .resolves(acceptedLicense)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(licenseOwnerUser)

    const handler = getLicenseApprovedHandler(LICENSE_ID, USER_ID)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([licenseOwnerUser])
  })

  it('template should generate correct email template', async () => {
    const licenseOwnerUser = createMockUser(3, 'owner@domain.com')
    const acceptedLicense = createMockAcceptedLicense(LICENSE_ID, licenseOwnerUser)

    emFindOneOrFailStub
      .withArgs(AcceptedLicense, { id: LICENSE_ID }, { populate: ['license'] })
      .resolves(acceptedLicense)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(licenseOwnerUser)

    const handler = getLicenseApprovedHandler(LICENSE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(licenseOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.licenseApproved)
    expect(result.to).to.eq(licenseOwnerUser.email)
    expect(result.subject).to.eq(`You were approved for Sample License`)
    expect(result.body).to.contain('View Licensed Items')
    expect(result.body).to.contain('You may now')
  })
})
