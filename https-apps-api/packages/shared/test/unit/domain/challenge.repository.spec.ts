/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Challenge, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import { database } from '@pfda/https-apps-shared'
import { create, db } from 'shared/src/test'

describe('ChallengeRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let botUser: User
  let cardImage: UserFile
  let challenge: Challenge

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    botUser = create.userHelper.createChallengeBot(em)
    // log = getLogger()
    await em.flush()

    cardImage = create.filesHelper.create(em, { user: botUser })
    await em.flush()

    challenge = create.challengeHelper.create(em, { userAndAdmin: user }, { cardImageId: cardImage.uid })
    await em.flush()
  })

  it('findOneWithId', async () => {
    const repo = em.getRepository(Challenge) as ChallengeRepository
    const result = await repo.findOneWithId(challenge.id)
    expect(result).to.be.not.null()
    expect(result.name).to.equal(challenge.name)
  })

  it('findOneWithCardImageUid', async() => {
    const repo = em.getRepository(Challenge) as ChallengeRepository
    const result = await repo.findOneWithCardImageUid(cardImage.uid)
    expect(result).to.be.not.null()
    expect(result.name).to.equal(challenge.name)
  })
})
