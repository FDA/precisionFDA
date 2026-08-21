import { EntityManager, FilterQuery, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { EntityScope } from '@shared/types/common'
import { create, db } from '../../../src/test'

// Expose protected method for white-box unit testing
class TestableNodeRepository extends NodeRepository {
  getAccessibleWhereByScopePublic(
    scope?: HOME_SCOPE.SPACES | EntityScope,
    location?: string,
  ): Promise<FilterQuery<Node>> {
    return this.getAccessibleWhereByScope(scope, location)
  }
}

describe('NodeRepository.getAccessibleWhereByScope', () => {
  let em: EntityManager<MySqlDriver>
  let repo: TestableNodeRepository
  let userCtx: UserContext

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>

    const user = create.userHelper.create(em)
    await em.flush()

    repo = new TestableNodeRepository(em, Node)
    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: () => Promise.resolve(user),
    } as UserContext
  })

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    return userContextStorage.run(userCtx, fn)
  }

  it('returns { scope: public } when scope is public', async () => {
    const result = await run(() => repo.getAccessibleWhereByScopePublic(STATIC_SCOPE.PUBLIC))
    expect(result).to.deep.equal({ scope: STATIC_SCOPE.PUBLIC })
  })

  it('returns { user, scope: private } when scope is private', async () => {
    const result = await run(() => repo.getAccessibleWhereByScopePublic(STATIC_SCOPE.PRIVATE))
    expect(result).to.deep.equal({ user: userCtx.id, scope: STATIC_SCOPE.PRIVATE })
  })

  it('returns null when user is not found in the database', async () => {
    const missingCtx = { ...userCtx, id: 999999 } as UserContext
    const result = await userContextStorage.run(missingCtx, () =>
      repo.getAccessibleWhereByScopePublic(HOME_SCOPE.SPACES),
    )
    expect(result).to.be.null()
  })

  it('returns $in of all space scopes when scope is HOME_SCOPE.SPACES', async () => {
    const user = await em.findOne(User, { id: userCtx.id })
    const space1 = create.spacesHelper.create(em, { name: 'space-1' })
    const space2 = create.spacesHelper.create(em, { name: 'space-2' })
    create.spacesHelper.addMember(em, { space: space1, user })
    create.spacesHelper.addMember(em, { space: space2, user })
    await em.flush()

    const result = await run(() => repo.getAccessibleWhereByScopePublic(HOME_SCOPE.SPACES))
    expect(result).to.deep.equal({ scope: { $in: [space1.scope, space2.scope] } })
  })

  it('returns { scope } when the requested space scope is accessible', async () => {
    const user = await em.findOne(User, { id: userCtx.id })
    const space = create.spacesHelper.create(em, { name: 'my-space' })
    create.spacesHelper.addMember(em, { space, user })
    await em.flush()

    const result = await run(() => repo.getAccessibleWhereByScopePublic(space.scope))
    expect(result).to.deep.equal({ scope: space.scope })
  })

  it('returns null when the requested space scope is not accessible', async () => {
    const otherUser = create.userHelper.create(em)
    const space = create.spacesHelper.create(em, { name: 'other-space' })
    create.spacesHelper.addMember(em, { space, user: otherUser })
    await em.flush()

    const result = await run(() => repo.getAccessibleWhereByScopePublic(space.scope))
    expect(result).to.be.null()
  })

  it('returns all-accessible $or clause when scope is undefined', async () => {
    const user = await em.findOne(User, { id: userCtx.id })
    const space = create.spacesHelper.create(em, { name: 'my-space' })
    create.spacesHelper.addMember(em, { space, user })
    await em.flush()

    const result = await run(() => repo.getAccessibleWhereByScopePublic(undefined))
    expect(result).to.deep.equal({
      $or: [
        { user: userCtx.id, scope: STATIC_SCOPE.PRIVATE },
        { scope: STATIC_SCOPE.PUBLIC },
        { scope: { $in: [space.scope] } },
      ],
    })
  })
})
