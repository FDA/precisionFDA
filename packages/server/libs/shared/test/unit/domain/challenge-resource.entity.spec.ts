import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { create, db, generate } from '../../../src/test'

describe('ChallengeResource tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let challenge: Challenge

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    challenge = create.challengeHelper.create(em, { userAndAdmin: user })
    await em.flush()
  })

  it('ChallengeResource with user, challenge and file', async () => {
    const file = create.filesHelper.create(em, { user }, { name: 'file1', description: 'I describe' })
    await em.flush()
    const challengeResource = create.challengeResourceHelper.create(em, { user, challenge, file }, { id: 5 })
    await em.flush()

    const result = await em.findOne(ChallengeResource, { id: challengeResource.id })
    expect(result.userFile).to.not.be.null()
    expect(result.userFile.getEntity().name).to.equal(file.name)

    expect(result.user).to.not.be.null()
    expect(result.user.getEntity().dxuser).to.equal(user.dxuser)

    expect(result.challenge).to.not.be.null()
    expect(result.challenge.getEntity().name).to.equal(challenge.name)

    // Test property getters
    expect(result.name).to.equal(file.name)
    expect(result.description).to.equal(file.description)
  })

  it('property getters without userFile returns undefined', async () => {
    const challengeResource = create.challengeResourceHelper.create(em, { user, challenge }, { id: 7 })
    await em.flush()

    const result = await em.findOne(ChallengeResource, { id: challengeResource.id })
    expect(result.name).to.equal(undefined)
    expect(result.description).to.equal(undefined)
  })
})
