import { stub } from 'sinon'
import { expect } from 'chai'
import { User } from '@shared/domain/user/user.entity'
import { ExpertQuestionAddedHandler } from '@shared/domain/email/templates/handlers/expert-question-added.handler'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { ExpertQuestionRepository } from '@shared/domain/expert-question/expert-question.repository'
import { EmailClient } from '@shared/services/email-client'
import { Organization } from '@shared/domain/org/org.entity'
import { Reference } from '@mikro-orm/core'
import { Expert } from '@shared/domain/expert/expert.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

describe('ExpertQuestionAddedHandler', () => {
  const EXPERT_QUESTION_ID = 10

  const emailClientSendEmailStub = stub()
  const expertQuestionRepoFindOneOrFailStub = stub()

  const expertQuestionRepo = {
    findOneOrFail: expertQuestionRepoFindOneOrFailStub,
  } as unknown as ExpertQuestionRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): ExpertQuestionAddedHandler => {
    return new ExpertQuestionAddedHandler(expertQuestionRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    expertQuestionRepoFindOneOrFailStub.reset()
    expertQuestionRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const expertUser = new User(organization)
      expertUser.firstName = 'Battery'
      expertUser.lastName = 'Voltas'
      expertUser.email = 'test@email.com'
      const authorUser = new User(organization)
      authorUser.firstName = 'Čumi'
      authorUser.lastName = 'Sfusaku'
      authorUser.email = 'cumi.sfusaku@email.com'
      const expert = new Expert(expertUser)
      const expertQuestion = new ExpertQuestion()
      expertQuestion.id = EXPERT_QUESTION_ID
      expertQuestion.body = 'body'
      expertQuestion.expert = Reference.create(expert)
      expertQuestion.user = Reference.create(authorUser)

      expertQuestionRepoFindOneOrFailStub
        .withArgs({ id: EXPERT_QUESTION_ID }, { populate: ['expert.user', 'user'] })
        .resolves(expertQuestion)
      const input = new ObjectIdInputDTO()
      input.id = EXPERT_QUESTION_ID
      emailClientSendEmailStub.reset()

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.expertQuestionAdded,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(expertUser.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `A new question was submitted by ${authorUser.firstName} ${authorUser.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'A new question was asked in your Expert Q&A Session',
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Submitted by: ${authorUser.firstName} ${authorUser.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(expertQuestion.body)
    })
  })
})
