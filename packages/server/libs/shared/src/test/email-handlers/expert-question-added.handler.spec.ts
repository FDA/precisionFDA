import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { UserOpsCtx } from '@shared/types'
import { Logger } from '@nestjs/common'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { ExpertQuestionAddedHandler } from '@shared/domain/email/templates/handlers/expert-question-added.handler'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'

describe('ExpertQuestionAddedHandler', () => {
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

  const user = {
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    getEntity: () => user,
  } as unknown as User

  beforeEach(() => {
    emFindOneOrFailStub.reset()
    emFindOneOrFailStub.throws()
  })

  const getExpertQuestionAddedHandler = (id: number) => {
    return new ExpertQuestionAddedHandler(
      EMAIL_TYPES.expertQuestionAdded,
      { id },
      userOpsCtx,
      receiverUserIds,
    )
  }

  const getExpertQuestion = () => {
    const expert = {
      user: {
        getEntity: () => user,
      },
    }
    return {
      id: 1,
      expert,
      body: 'expert-question-body',
    }
  }

  it('getNotificationKey', () => {
    const expertQuestionAddedHandler = getExpertQuestionAddedHandler(1)

    expect(expertQuestionAddedHandler.getNotificationKey()).to.eq('expert_question_added')
  })

  it('determineReceivers', async () => {
    const expertQuestionAddedHandler = getExpertQuestionAddedHandler(1)

    emFindOneOrFailStub
      .withArgs(ExpertQuestion, { id: 1 }, { populate: ['expert.user'] })
      .resolves(getExpertQuestion())

    await expertQuestionAddedHandler.setupContext()
    const receivers = await expertQuestionAddedHandler.determineReceivers()
    expect(receivers).to.deep.eq([user])
  })

  it('template', async () => {
    const expertQuestionAddedHandler = getExpertQuestionAddedHandler(1)

    emFindOneOrFailStub
      .withArgs(ExpertQuestion, { id: 1 }, { populate: ['expert.user'] })
      .resolves(getExpertQuestion())

    await expertQuestionAddedHandler.setupContext()
    const result = await expertQuestionAddedHandler.template(user)

    expect(result.emailType).to.eq(EMAIL_TYPES.expertQuestionAdded)
    expect(result.to).to.eq(user.email)
    expect(result.subject).to.eq('A new question was submitted by firstName lastName')
    expect(result.body).to.contain('expert-question-body')
    expect(result.body).to.contain('Submitted by: firstName lastName')
    expect(result.body).to.contain('A new question was asked in your Expert Q&A Session')
  })
})
