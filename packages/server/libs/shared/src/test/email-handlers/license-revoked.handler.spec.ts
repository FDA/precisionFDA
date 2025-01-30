import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { LicenseRevokedHandler } from '@shared/domain/email/templates/handlers/license-revoked.handler'
import { User } from '@shared/domain/user/user.entity'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

describe('LicenseRevokedHandler', () => {
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

  const getLicenseRevokedHandler = (licenseId: number, userId: number) =>
    new LicenseRevokedHandler(EMAIL_TYPES.licenseRevoked, { id: licenseId }, userOpsCtx, [userId])

  it('getNotificationKey should return correct notification key', () => {
    const handler = getLicenseRevokedHandler(LICENSE_ID, USER_ID)
    expect(handler.getNotificationKey()).to.eq('license_revoked')
  })

  it('determineReceivers should return the correct receivers', async () => {
    const licenseOwnerUser = createMockUser(3, 'owner@domain.com')
    const acceptedLicense = createMockAcceptedLicense(LICENSE_ID, licenseOwnerUser)

    emFindOneOrFailStub
      .withArgs(AcceptedLicense, { id: LICENSE_ID }, { populate: ['license'] })
      .resolves(acceptedLicense)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(licenseOwnerUser)

    const handler = getLicenseRevokedHandler(LICENSE_ID, USER_ID)
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

    const handler = getLicenseRevokedHandler(LICENSE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(licenseOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.licenseRevoked)
    expect(result.to).to.eq(licenseOwnerUser.email)
    expect(result.subject).to.eq(`Your license for Sample License has been revoked`)
    expect(result.body).to.contain('If you would like to request access to this license again')
    expect(result.body).to.contain('has been revoked by the license administrator.')
  })
})
