import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { Challenge, Space, User } from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { ChallengeOpenedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { UserOpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { database } from '@pfda/https-apps-shared'
import { CHALLENGE_STATUS } from '@pfda/https-apps-shared/src/domain/challenge/challenge.enum'
import { SPACE_MEMBERSHIP_ROLE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'

describe('challenge-opened.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let challenge: Challenge
  let space: Space
  let ctx: UserOpsCtx
  const config = EMAIL_CONFIG.challengeOpened

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email(), lastLogin: new Date() })
    anotherUser = create.userHelper.create(em, {
      email: generate.random.email(),
      lastLogin: new Date(),
    })
    challenge = create.challengeHelper.create(em, { userAndAdmin: user })
    space = create.spacesHelper.create(em, generate.space.group())
    create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )

    await em.flush()

    ctx = {
      em: database.orm().em.fork(true),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('loads challenge in any state', async () => {
      const input = { challengeId: challenge.id }
      const handler = new ChallengeOpenedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.challenge).to.exist()
      expect(challenge).to.have.property('status').that.is.not.equal(CHALLENGE_STATUS.OPEN)
    })
  })

  context('determineReceivers()', () => {
    it('return all active users as receivers (public challenge)', async () => {
      const input = { challengeId: challenge.id }
      const handler = new ChallengeOpenedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(3)
    })

    it('return users in given space (private challenge)', async () => {
      const privateChallenge = create.challengeHelper.create(
        em,
        { userAndAdmin: user },
        {
          scope: `space-${space.id}`,
        },
      )
      await em.flush()

      const input = { challengeId: privateChallenge.id }
      const handler = new ChallengeOpenedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(2)
      expect(receivers[0]).to.have.property('id', anotherUser.id)
    })
  })

  context('getNotificationKey()', () => {
    it('returns static value', () => {
      const input = { challengeId: challenge.id }
      const handler = new ChallengeOpenedEmailHandler(config.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('challenge_opened')
    })
  })
})
