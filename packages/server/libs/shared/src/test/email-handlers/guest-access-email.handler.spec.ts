import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { GuestAccessEmailHandler } from '@shared/domain/email/templates/handlers/guest-access-email.handler'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { config } from '@shared/config'

describe('GuestAccessEmailHandler', () => {
  let receiverUserIds: number[] = [1]
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

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getGuestAccessEmailHandler = (id: number) => {
    return new GuestAccessEmailHandler(
      EMAIL_TYPES.guestAccessEmail,
      { id },
      userOpsCtx,
      receiverUserIds,
    )
  }

  it('getNotificationKey', () => {
    const guestAccessEmailHandler = getGuestAccessEmailHandler(1)

    expect(guestAccessEmailHandler.getNotificationKey()).to.eq('guest_access_email')
  })

  it('determineReceivers', async () => {
    const guestAccessEmailHandler = getGuestAccessEmailHandler(1)

    const user = {
      email: 'email',
      getEntity: () => user,
    } as unknown as User
    const invitation = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      user: {
        getEntity: () => user,
      },
    }
    emFindOneOrFailStub.withArgs(Invitation, { id: 1 }, { populate: ['user'] }).resolves(invitation)

    await guestAccessEmailHandler.setupContext()
    const receivers = await guestAccessEmailHandler.determineReceivers()

    expect(receivers).to.deep.eq([{ email: invitation.email }])
  })

  it('template', async () => {
    const guestAccessEmailHandler = getGuestAccessEmailHandler(1)

    const user = {
      email: 'email',
      getEntity: () => user,
    } as unknown as User
    const invitation = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      user: {
        getEntity: () => user,
      },
    }
    emFindOneOrFailStub.withArgs(Invitation, { id: 1 }, { populate: ['user'] }).resolves(invitation)

    await guestAccessEmailHandler.setupContext()
    const result = await guestAccessEmailHandler.template(user)

    expect(result.emailType).to.eq(EMAIL_TYPES.guestAccessEmail)
    expect(result.to).to.eq(user.email)
    expect(result.bcc).to.eq(config.supportEmail)
    expect(result.subject).to.eq('Your precisionFDA access request')
    expect(result.body).to.contain('firstName')
    expect(result.body).to.contain('lastName')
    expect(result.body).to.contain('Invitation for Full Account Access on precisionFDA')
  })
})
