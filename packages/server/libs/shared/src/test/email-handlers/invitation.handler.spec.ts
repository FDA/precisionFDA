import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { InvitationHandler } from '@shared/domain/email/templates/handlers/invitation.handler'
import { User } from '@shared/domain/user/user.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { config } from '@shared/config'

describe('InvitationHandler', () => {
  const INVITATION_ID = 1
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

  const createMockInvitation = (id: number, user: User) =>
    ({
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      address1: '123 Main St',
      address2: 'Apt 4B',
      phone: '1234567890',
      duns: '123456789',
      ip: '192.168.1.1',
      extras: {
        req_reason: 'Research',
        req_data: true,
        req_software: false,
        research_intent: true,
        clinical_intent: false,
        participate_intent: true,
        organize_intent: false,
      },
    }) as unknown as Invitation

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getInvitationHandler = (invitationId: number, userId: number) =>
    new InvitationHandler(EMAIL_TYPES.invitation, { id: invitationId }, userOpsCtx, [userId])

  it('getNotificationKey', () => {
    const handler = getInvitationHandler(INVITATION_ID, USER_ID)
    expect(handler.getNotificationKey()).to.eq('invitation')
  })

  it('determineReceivers', async () => {
    const invitationUser = createMockUser(3, 'user@domain.com')
    const invitation = createMockInvitation(INVITATION_ID, invitationUser)

    emFindOneOrFailStub.withArgs(Invitation, { id: INVITATION_ID }).resolves(invitation)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(invitationUser)

    const handler = getInvitationHandler(INVITATION_ID, USER_ID)
    await handler.setupContext()

    const receivers = await handler.determineReceivers()
    expect(receivers).to.eql([{ email: config.pfdaEmail } as User])

    if (config.env === 'production') {
      expect(receivers).to.include.deep.members([{ email: config.pfdaEmail } as User])
    }
  })

  it('template should generate correct email template', async () => {
    const invitationUser = createMockUser(3, 'user@domain.com', 'InvitFistName', 'InvitLastName')
    const invitation = createMockInvitation(INVITATION_ID, invitationUser)

    emFindOneOrFailStub.withArgs(Invitation, { id: INVITATION_ID }).resolves(invitation)

    emFindOneOrFailStub.withArgs(User, { id: USER_ID }).resolves(invitationUser)

    const handler = getInvitationHandler(INVITATION_ID, USER_ID)
    await handler.setupContext()

    const result = await handler.template(invitationUser)

    expect(result.emailType).to.eq(EMAIL_TYPES.invitation)
    expect(result.to).to.eq(invitationUser.email)
    expect(result.subject).to.eq(
      `New access request from ${invitationUser.firstName} ${invitationUser.lastName}`,
    )
    expect(result.body).to.contain(
      `Access Request for ${invitationUser.firstName} ${invitationUser.lastName}`,
    )
    expect(result.body).to.contain('192.168.1.1')
    expect(result.body).to.contain('Research')
  })
})
