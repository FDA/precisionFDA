import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { LicenseApprovalRequestHandler } from '@shared/domain/email/templates/handlers/license-approval-request.handler'
import { User } from '@shared/domain/user/user.entity'
import { License } from '@shared/domain/license/license.entity'

describe('LicenseApprovalRequestHandler', () => {
  const LICENSE_ID = 1
  const USER_ID = 2
  const message = 'approval message'

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

  const getLicenseApprovalRequestHandler = (licenseId: number, userId: number, message: string) =>
    new LicenseApprovalRequestHandler(
      EMAIL_TYPES.licenseApprovalRequest,
      { license_id: licenseId, user_id: userId, message },
      userOpsCtx,
      [],
    )

  const createMockUser = (
    id: number,
    email: string,
    firstName = 'John',
    lastName = 'Doe',
    organizationName = 'Org',
  ) =>
    ({
      id,
      firstName,
      lastName,
      email,
      organization: {
        getEntity: () => ({ name: organizationName }),
      },
    }) as unknown as User

  const createMockLicense = (id: number, user: User) =>
    ({
      id,
      title: 'Sample License',
      user: {
        getEntity: () => user,
      },
    }) as unknown as License

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  it('getNotificationKey should return correct notification key', () => {
    const handler = getLicenseApprovalRequestHandler(LICENSE_ID, USER_ID, message)
    expect(handler.getNotificationKey()).to.eq('license_approval_request')
  })

  it('determineReceivers should return the correct receivers', async () => {
    const requesterUser = createMockUser(USER_ID, 'requester@domain.com')
    const licenseOwnerUser = createMockUser(3, 'owner@domain.com')

    const license = createMockLicense(LICENSE_ID, licenseOwnerUser)

    emFindOneOrFailStub
      .withArgs(User, { id: USER_ID }, { populate: ['organization'] })
      .resolves(requesterUser)
    emFindOneOrFailStub
      .withArgs(License, { id: LICENSE_ID }, { populate: ['user'] })
      .resolves(license)

    const handler = getLicenseApprovalRequestHandler(LICENSE_ID, USER_ID, message)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([licenseOwnerUser])
  })

  it('template should generate correct email template', async () => {
    const requesterUser = createMockUser(USER_ID, 'requester@domain.com')
    const licenseOwnerUser = createMockUser(3, 'owner@domain.com')

    const license = createMockLicense(LICENSE_ID, licenseOwnerUser)

    emFindOneOrFailStub
      .withArgs(User, { id: USER_ID }, { populate: ['organization'] })
      .resolves(requesterUser)
    emFindOneOrFailStub
      .withArgs(License, { id: LICENSE_ID }, { populate: ['user'] })
      .resolves(license)

    const handler = getLicenseApprovalRequestHandler(LICENSE_ID, USER_ID, message)
    await handler.setupContext()

    const result = await handler.template(requesterUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.licenseApprovalRequest)
    expect(result.to).to.eq(requesterUser.email)
    expect(result.subject).to.eq(
      `${requesterUser.firstName} ${requesterUser.lastName} requested approval for license: ${license.title}`,
    )
    expect(result.body).to.contain('View Request')
    expect(result.body).to.contain('An approval has been requested for the license')
  })
})
