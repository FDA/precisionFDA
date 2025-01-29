import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'

describe('AlertMessageHandler', () => {
  let receiverUserIds: number[] = [1]
  const emFindStub = stub()

  const entityManager = {
    find: emFindStub,
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
    emFindStub.reset()
    emFindStub.throws()
  })

  const getAlertMessageHandler = (subject?: string, message?: string) => {
    return new AlertMessageHandler(
      EMAIL_TYPES.alertMessage,
      { subject, message },
      userOpsCtx,
      receiverUserIds,
    )
  }

  it('getNotificationKey', () => {
    const alertMessageHandler = getAlertMessageHandler('subject', 'message')

    expect(alertMessageHandler.getNotificationKey()).to.eq('alert_message')
  })

  it('determineReceivers', async () => {
    const alertMessageHandler = getAlertMessageHandler('subject', 'message')

    const user = {
      email: 'email',
    } as unknown as User
    emFindStub.withArgs(User, { id: { $in: receiverUserIds } }).resolves([user])

    const receivers = await alertMessageHandler.determineReceivers()
    expect(receivers).to.deep.eq([user])
  })

  it('template', async () => {
    const alertMessageHandler = getAlertMessageHandler('subject', 'message')

    const receiver = {
      email: 'email',
    } as unknown as User

    const result = await alertMessageHandler.template(receiver)

    expect(result.emailType).to.eq(EMAIL_TYPES.alertMessage)
    expect(result.to).to.eq(receiver.email)
    expect(result.body).to.contain('message')
    expect(result.subject).to.eq('subject')
  })
})
