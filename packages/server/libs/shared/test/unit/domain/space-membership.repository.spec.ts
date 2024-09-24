import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'

describe('SpaceMembershipRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)

    // just create few spaces so that following ones id doesn't start from 1
    create.spacesHelper.create(em, { name: 'dummy-space' })
    create.spacesHelper.create(em, { name: 'dummy-space' })
    create.spacesHelper.create(em, { name: 'dummy-space' })
    await em.flush()
  })

  it('findActiveSpaceIdsByUserId', async () => {
    const repo = em.getRepository(SpaceMembership)
    const space1 = create.spacesHelper.create(em, { name: 'space1' })
    const space2 = create.spacesHelper.create(em, { name: 'space2' })
    const space3 = create.spacesHelper.create(em, { name: 'space3' })
    await em.flush()

    create.spacesHelper.addMember(em, { user, space: space1 })
    create.spacesHelper.addMember(em, { user, space: space2 })
    create.spacesHelper.addMember(em, { user, space: space3 })

    await em.flush()

    const result = await repo.findActiveSpaceIdsByUserId(user.id)
    expect(result.length).to.eq(3)
    expect(result).to.have.members([space1.id, space2.id, space3.id])
  })
})
