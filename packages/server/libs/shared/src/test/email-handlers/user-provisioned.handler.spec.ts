import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'
import { UserProvisionedDto } from '@shared/domain/email/dto/user-provisioned.dto'

describe('UserProvisionedHandler', () => {
  const entityManager = {} as unknown as EntityManager

  const userOpsCtx: UserOpsCtx = {
    em: entityManager,
    user: { id: 1, accessToken: 'test-token', dxuser: 'test-user' },
    log: { log: stub(), error: stub() } as unknown as Logger,
  }

  const receiverUserIds = [1]

  beforeEach(() => {})

  const getHandler = (dto: UserProvisionedDto) => {
    return new UserProvisionedHandler(EMAIL_TYPES.userProvisioned, dto, userOpsCtx, receiverUserIds)
  }

  it('getNotificationKey', () => {
    const dto: UserProvisionedDto = { firstName: 'aa', username: 'bb', email: 'email' }
    const handler = getHandler(dto)
    expect(handler.getNotificationKey()).to.eq('user_provisioned')
  })

  it('determineReceivers', async () => {
    const dto: UserProvisionedDto = { firstName: 'aa', username: 'bb', email: 'email' }
    const handler = getHandler(dto)

    const receivers = await handler.determineReceivers()
    expect(receivers[0].email).to.eq(dto.email)
  })

  it('template', async () => {
    const dto: UserProvisionedDto = {
      firstName: 'firstName',
      username: 'username',
      email: 'email@email.com',
    }
    const handler = getHandler(dto)

    const result = await handler.template({ email: dto.email } as User)

    expect(result.emailType).to.eq(EMAIL_TYPES.userProvisioned)
    expect(result.to).to.eq(dto.email)
    expect(result.body).to.contain(`Welcome to precisionFDA, ${dto.firstName}!`)
    expect(result.body).to.contain(dto.email)
    expect(result.body).to.contain(dto.username)
    expect(result.subject).to.eq(`Welcome to precisionFDA, ${dto.firstName}!`)
  })
})
