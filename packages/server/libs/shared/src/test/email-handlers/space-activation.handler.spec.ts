import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { SpaceActivationHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'

describe('SpaceActivationHandler', () => {
  const SPACE_ID = 1
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

  const createMockSpaceMembership = (
    id: number,
    user: User,
    spaceType: SPACE_TYPE,
    side: SPACE_MEMBERSHIP_SIDE,
  ) =>
    ({
      id,
      spaces: [
        {
          id: SPACE_ID,
          name: 'Test Space',
          type: spaceType,
        },
      ],
      user: {
        getEntity: () => user,
      },
      side,
      getSpaceMembershipSideAlias: () => 'reviewer',
    }) as unknown as SpaceMembership

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getSpaceActivationHandler = (spaceId: number, userId: number) =>
    new SpaceActivationHandler(EMAIL_TYPES.spaceActivation, { id: spaceId }, userOpsCtx, [userId])

  it('getNotificationKey', () => {
    const handler = getSpaceActivationHandler(SPACE_ID, USER_ID)
    expect(handler.getNotificationKey()).to.eq('space_activation')
  })

  it('determineReceivers', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(
      SPACE_ID,
      spaceOwnerUser,
      SPACE_TYPE.ADMINISTRATOR,
      SPACE_MEMBERSHIP_SIDE.HOST,
    )

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivationHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([spaceOwnerUser])
  })

  it('template should generate correct email template for ADMINISTRATOR space type and HOST side', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(
      SPACE_ID,
      spaceOwnerUser,
      SPACE_TYPE.ADMINISTRATOR,
      SPACE_MEMBERSHIP_SIDE.HOST,
    )

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivationHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(spaceOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.spaceActivation)
    expect(result.to).to.eq(spaceOwnerUser.email)
    expect(result.subject).to.eq('Action required to activate new space Test Space')
    expect(result.body).to.contain('creator')
    expect(result.body).to.contain('creator and approver')
    expect(result.body).to.contain('View Space Invitation')
  })

  it('template should generate correct email template for REVIEW space type', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(
      SPACE_ID,
      spaceOwnerUser,
      SPACE_TYPE.REVIEW,
      SPACE_MEMBERSHIP_SIDE.HOST,
    )

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivationHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(spaceOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.spaceActivation)
    expect(result.to).to.eq(spaceOwnerUser.email)
    expect(result.subject).to.eq('Action required to activate new space Test Space')
    expect(result.body).to.contain('host')
    expect(result.body).to.contain('reviewer and sponsor')
    expect(result.body).to.contain('View Space Invitation')
  })

  it('template should handle GUEST side correctly', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(
      SPACE_ID,
      spaceOwnerUser,
      SPACE_TYPE.REVIEW,
      SPACE_MEMBERSHIP_SIDE.GUEST,
    )

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivationHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(spaceOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.spaceActivation)
    expect(result.to).to.eq(spaceOwnerUser.email)
    expect(result.subject).to.eq('Action required to activate new space Test Space')
    expect(result.body).to.contain('sponsor')
    expect(result.body).not.to.contain('host and guest')
    expect(result.body).to.contain('View Space Invitation')
  })
})
