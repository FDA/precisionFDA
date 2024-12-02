import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { ChallengeProposalInput, EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EntityManager } from '@mikro-orm/mysql'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Logger } from '@nestjs/common'
import { UserOpsCtx } from '@shared/types'
import { config } from '@shared/config'
import { User } from '@shared/domain/user/user.entity'

describe('ChallengeProposalReceivedHandler', () => {
  let receiverUserIds: number[] = [1]

  const entityManager = {} as unknown as EntityManager
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

  const getChallengeProposalReceivedHandler = (input: ChallengeProposalInput) => {
    return new ChallengeProposalReceivedHandler(
      EMAIL_TYPES.challengeProposalReceived,
      input,
      userOpsCtx,
      receiverUserIds,
    )
  }

  it('getNotificationKey', () => {
    const challengeProposalReceivedHandler = getChallengeProposalReceivedHandler(
      {} as unknown as ChallengeProposalInput,
    )

    expect(challengeProposalReceivedHandler.getNotificationKey()).to.eq(
      'challenge_proposal_received',
    )
  })

  it('determineReceivers', async () => {
    const challengeProposalReceivedHandler = getChallengeProposalReceivedHandler(
      {} as unknown as ChallengeProposalInput,
    )

    const receivers = await challengeProposalReceivedHandler.determineReceivers()
    const expectedReceivers = config.challengeProposalRecipients.map(
      (receiverEmail) => ({ email: receiverEmail }) as User,
    )
    expect(receivers).to.deep.eq(expectedReceivers)
  })

  it('template', async () => {
    const input: ChallengeProposalInput = {
      name: 'input-name',
      email: 'input-email@email.com',
      organisation: 'input-organisation',
      specific_question: 'input-specific_question',
      specific_question_text: 'input-specific_question_text',
      data_details: 'input-data_details',
      data_details_text: 'input-data_details_text',
    }
    const receiver = {
      email: 'email@email.com',
    } as unknown as User
    const challengeProposalReceivedHandler = getChallengeProposalReceivedHandler(input)

    const result = await challengeProposalReceivedHandler.template(receiver)

    expect(result.emailType).to.eq(EMAIL_TYPES.challengeProposalReceived)
    expect(result.to).to.eq(receiver.email)
    expect(result.subject).to.eq(
      `ci_test New challenge proposal received from ${input.name} (${input.email})`,
    )
    expect(result.body).to.contain(input.organisation)
    expect(result.body).to.contain(input.specific_question)
    expect(result.body).to.contain(input.specific_question_text)
    expect(result.body).to.contain(input.data_details)
    expect(result.body).to.contain(input.data_details_text)
  })
})
