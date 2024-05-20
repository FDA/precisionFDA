/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai'
import { create, db } from '../../../src/test'

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
