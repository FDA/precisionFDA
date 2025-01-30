import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

describe('SpaceActivatedHandler', () => {
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

  const createMockSpaceMembership = (id: number, user: User) =>
    ({
      id,
      spaces: [
        {
          id: SPACE_ID,
          name: 'Test Space',
        },
      ],
      user: {
        getEntity: () => user,
      },
    }) as unknown as SpaceMembership

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getSpaceActivatedHandler = (spaceId: number, userId: number) =>
    new SpaceActivatedHandler(EMAIL_TYPES.spaceActivated, { id: spaceId }, userOpsCtx, [userId])

  it('getNotificationKey', () => {
    const handler = getSpaceActivatedHandler(SPACE_ID, USER_ID)
    expect(handler.getNotificationKey()).to.eq('space_activated')
  })

  it('determineReceivers', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(SPACE_ID, spaceOwnerUser)

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivatedHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([spaceOwnerUser])
  })

  it('template', async () => {
    const spaceOwnerUser = createMockUser(3, 'owner@domain.com')
    const spaceMembership = createMockSpaceMembership(SPACE_ID, spaceOwnerUser)

    emFindOneOrFailStub
      .withArgs(SpaceMembership, { id: SPACE_ID }, { populate: ['user', 'spaces'] })
      .resolves(spaceMembership)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(spaceOwnerUser)

    const handler = getSpaceActivatedHandler(SPACE_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(spaceOwnerUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.spaceActivated)
    expect(result.to).to.eq(spaceOwnerUser.email)
    expect(result.subject).to.eq('Space Activated')
    expect(result.body).to.contain('View Space')
    expect(result.body).to.contain(
      'has been activated, and you can now start sharing data with members of the space.',
    )
  })
})
