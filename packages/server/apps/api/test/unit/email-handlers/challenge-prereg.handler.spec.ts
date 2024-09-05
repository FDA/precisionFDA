import { database } from '@shared/database'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { create, generate, db } from '@shared/test'
import { EMAIL_CONFIG } from '@shared/domain/email/email.config'
import { ChallengePreregEmailHandler } from '@shared/domain/email/templates/handlers/challenge-prereg.handler'
import { UserOpsCtx } from '@shared/types'
import { defaultLogger } from '@shared/logger'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

describe('challenge-prereg.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let challenge: Challenge
  let space: Space
  let ctx: UserOpsCtx
  const config = EMAIL_CONFIG.challengePrereg

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email(), lastLogin: new Date() })
    anotherUser = create.userHelper.create(em, {
      email: generate.random.email(),
      lastLogin: new Date(),
    })
    challenge = create.challengeHelper.create(
      em,
      { userAndAdmin: user },
      { status: CHALLENGE_STATUS.SETUP },
    )
    space = create.spacesHelper.create(em, generate.space.group())
    create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )

    await em.flush()

    ctx = {
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('loads challenge in any state (does not check it)', async () => {
      const input = { challengeId: challenge.id, name: challenge.name, scope: challenge.scope }
      const handler = new ChallengePreregEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.challenge).to.exist()
      expect(challenge)
        .to.have.property('status')
        .that.is.not.equal(CHALLENGE_STATUS.PRE_REGISTRATION)
    })
  })

  context('determineReceivers()', () => {
    it('return all active users as receivers (public challenge)', async () => {
      const input = { challengeId: challenge.id, name: challenge.name, scope: challenge.scope }
      const handler = new ChallengePreregEmailHandler(config.emailId, input, ctx)
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

      const input = {
        challengeId: privateChallenge.id,
        name: privateChallenge.name,
        scope: privateChallenge.scope,
      }
      const handler = new ChallengePreregEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(2)
      expect(receivers[0]).to.have.property('id', anotherUser.id)
    })
  })

  context('getNotificationKey()', () => {
    it('returns static value', () => {
      const input = { challengeId: challenge.id, name: challenge.name, scope: challenge.scope }
      const handler = new ChallengePreregEmailHandler(config.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('challenge_preregister')
    })
  })
})
