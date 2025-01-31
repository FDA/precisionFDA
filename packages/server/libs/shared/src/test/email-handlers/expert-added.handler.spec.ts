import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { ExpertAddedHandler } from '@shared/domain/email/templates/handlers/expert-added.handler'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'

describe('ExpertAddedHandler', () => {
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

  const getExpertAddedHandler = (id?: number) => {
    return new ExpertAddedHandler(EMAIL_TYPES.expertAdded, { id }, userOpsCtx, receiverUserIds)
  }

  it('getNotificationKey', () => {
    const expertAddedHandler = getExpertAddedHandler(1)

    expect(expertAddedHandler.getNotificationKey()).to.eq('expert_added')
  })

  it('determineReceivers', async () => {
    const expertAddedHandler = getExpertAddedHandler(1)

    const user = {
      email: 'email',
      getEntity: () => user,
    } as unknown as User
    emFindOneOrFailStub.resolves({ user })

    await expertAddedHandler.setupContext()
    const receivers = await expertAddedHandler.determineReceivers()

    expect(receivers).to.eql([user])
  })

  it('template', async () => {
    const expertAddedHandler = getExpertAddedHandler(1)

    const user = {
      email: 'email',
      firstName: 'firstName',
      lastName: 'surname',
      getEntity: () => user,
    } as unknown as User
    emFindOneOrFailStub.resolves({ user })

    await expertAddedHandler.setupContext()
    const email = await expertAddedHandler.template(user)

    expect(email.emailType).to.eq(EMAIL_TYPES.expertAdded)
    expect(email.to).to.eq(user.email)
    expect(email.subject).to.eq('A new Expert Q&A Session was created for firstName surname')
    expect(email.body).to.contain('Expert Q&A Session has been created featuring firstName surname')
  })
})
