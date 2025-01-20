import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'

describe('SpaceInvitationHandler', () => {
  const MEMBERSHIP_ID = 1
  const USER_ID = 2
  const ADMIN_ID = 3

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

  const getSpaceInvitationHandler = (membershipId: number, adminId: number) =>
    new SpaceInvitationHandler(EMAIL_TYPES.spaceInvitation, { membershipId, adminId }, userOpsCtx)

  const createMockUser = (
    id: number,
    email: string,
    firstName = 'John',
    lastName = 'Doe',
    dxuser = 'dxuser',
  ) =>
    ({
      id,
      firstName,
      lastName,
      email,
      dxuser,
      fullName: `${firstName} ${lastName}`,
    }) as unknown as User

  const createMockSpace = (id: number, name: string) =>
    ({
      id,
      name,
      spaceMemberships: {
        getItems: () => [
          {
            role: SPACE_MEMBERSHIP_ROLE.ADMIN,
            user: {
              getEntity: () => ({
                id: 3,
                fullName: 'Admin User',
                email: 'admin@domain.com',
              }),
            },
          },
        ],
      },
    }) as unknown as Space

  const createMockSpaceMembership = (id: number, user: User, space: Space) =>
    ({
      id,
      user: {
        getEntity: () => user,
      },
      spaces: [space],
      role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      side: SPACE_MEMBERSHIP_SIDE.HOST,
      getSpaceMembershipSideAlias: () => 'reviewer',
      getSpaceMembershipRoleAlias: () => 'Contributor',
    }) as unknown as SpaceMembership

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  it('getNotificationKey', () => {
    const handler = getSpaceInvitationHandler(MEMBERSHIP_ID, ADMIN_ID)
    expect(handler.getNotificationKey()).to.eq('space_invitation')
  })

  it('determineReceivers', async () => {
    const space = createMockSpace(1, 'Research Space')
    const user = createMockUser(USER_ID, 'user@domain.com')
    const adminUser = createMockUser(3, 'admin@domain.com', 'Admin', 'User')
    const membership = createMockSpaceMembership(MEMBERSHIP_ID, user, space)

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: MEMBERSHIP_ID }, { populate: ['spaces', 'user'] })
      .resolves(membership)
    emFindOneOrFailStub.withArgs(User, { id: adminUser.id }).resolves(adminUser)

    const handler = getSpaceInvitationHandler(MEMBERSHIP_ID, ADMIN_ID)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([user])
  })

  it('template should generate correct email template', async () => {
    const space = createMockSpace(1, 'Research Space')
    const user = createMockUser(USER_ID, 'user@domain.com')
    const adminUser = createMockUser(3, 'admin@domain.com', 'Admin', 'User')
    const membership = createMockSpaceMembership(MEMBERSHIP_ID, user, space)

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: MEMBERSHIP_ID }, { populate: ['spaces', 'user'] })
      .resolves(membership)
    emFindOneOrFailStub.withArgs(User, { id: adminUser.id }).resolves(adminUser)

    const handler = getSpaceInvitationHandler(MEMBERSHIP_ID, ADMIN_ID)
    await handler.setupContext()

    const result = await handler.template(user)

    expect(result.emailType).to.eq(EMAIL_TYPES.spaceInvitation)
    expect(result.to).to.eq(user.email)
    expect(result.subject).to.eq(
      `${adminUser.firstName} ${adminUser.lastName} added you to the space "Research Space"`,
    )
    expect(result.body).to.contain('View Space')
    expect(result.body).to.contain('Research Space')
    expect(result.body).to.contain('Role: <strong>Contributor</strong>')
    expect(result.body).to.contain('Side: <strong>reviewer</strong>')
  })
})
