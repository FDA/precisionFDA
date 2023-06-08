import { EntityManager, MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import pino from 'pino'
import { expect } from 'chai'
import { create, db } from '../../..'
import { Event, Node, User, UserFile, userFile } from '../../../../domain'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { EVENT_TYPES } from 'shared/src/domain/event/event.helper'
import { STATIC_SCOPE } from '../../../../enums'
import { SPACE_MEMBERSHIP_ROLE } from '../../../../domain/space-membership/space-membership.enum'
import { RemoveNodesInput } from '../../../../domain/user-file/user-file.input'
import { isValidScopeName } from '../../../../domain/space/space.helper'

describe('remove nodes tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: types.UserCtx
  const ids: number[] = []

  const createFileStructure = async(scope: string) => {
    // structure:
    // file1 - dxid1
    // folder1
    //   file2 - dxid2
    //   nested-folder1
    //     file3 - dxid3
    //     file4 - dxid2
    // file5 - dxid2

    if (isValidScopeName(scope)) {
      const space = create.spacesHelper.create(em, { name: 'space-name-1' })
      create.spacesHelper.addMember(em, {user, space})
    }

    const file1 = create.filesHelper.create(em, { user }, { name: 'file1', dxid: 'dxid1', scope })
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1', scope })
    await em.flush()
    const file2 = create.filesHelper.create(
      em,
      { user, parentFolder: folder1 },
      { name: 'file2', dxid: 'dxid2', uid: 'file-dxid2-1', scope },
    )
    const nestedFolder1 = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder1 },
      { name: 'nested--folder1', scope },
    )
    await em.flush()
    const file3 = create.filesHelper.create(
      em,
      { user, parentFolder: nestedFolder1 },
      { name: 'file3', dxid: 'dxid3', scope },
    )
    const file4 = create.filesHelper.create(
      em,
      { user, parent: file2 },
      { name: 'file4', dxid: 'dxid2', uid: 'file-dxid2-2', scope },
    )
    // this one shares dxid with file2 and should ensure that file on platform is not deleted
    create.filesHelper.create(em, { user }, { name: 'file5', dxid: 'dxid2', uid: 'file-dxid2-3', scope})
    await em.flush()

    // intentionally in shuffled order
    ids.push(file3.id)
    ids.push(nestedFolder1.id)
    ids.push(file2.id)
    ids.push(file4.id)
    ids.push(file1.id)
    ids.push(folder1.id)
  }

  const assertResults = async (scope: string) => {
    const file5 = await em.findOneOrFail(UserFile, { name: 'file5' })
    expect(file5).to.not.equal(null)

    const deletedNodes = await em.find(Node, { id: { $in: ids } })
    expect(deletedNodes.length).to.equal(0)

    // all events must be stored in given order
    const event1 = await em.findOneOrFail(Event, 1)
    expect(event1.type).to.equal(EVENT_TYPES.FILE_DELETED)
    expect(event1.param1).to.equal('/file1')
    expect(event1.param2).to.equal('dxid1')
    expect(event1.data).to.equal(`{"id":1,"scope":"${scope}","name":"file1","path":"/file1"}`)

    const event2 = await em.findOneOrFail(Event, 2)
    expect(event2.type).to.equal(EVENT_TYPES.FILE_DELETED)
    expect(event2.param1).to.equal('/folder1/file2')
    expect(event2.param2).to.equal('dxid2')
    expect(event2.data).to
      .equal(`{"id":3,"scope":"${scope}","name":"file2","path":"/folder1/file2"}`)

    const event3 = await em.findOneOrFail(Event, 3)
    expect(event3.type).to.equal(EVENT_TYPES.FILE_DELETED)
    expect(event3.param1).to.equal('/folder1/nested--folder1/file3')
    expect(event3.param2).to.equal('dxid3')
    expect(event3.data).to.equal(`{"id":5,"scope":"${scope}","name":"`
      + 'file3","path":"/folder1/nested--folder1/file3"}')

    const event4 = await em.findOneOrFail(Event, 4)
    expect(event4.type).to.equal(EVENT_TYPES.FILE_DELETED)
    expect(event4.param1).to.equal('/file4')
    expect(event4.param2).to.equal('dxid2')
    expect(event4.data).to
      .equal(`{"id":6,"scope":"${scope}","name":"file4","path":"/file4"}`)

    const event5 = await em.findOneOrFail(Event, 5)
    expect(event5.type).to.equal(EVENT_TYPES.FOLDER_DELETED)
    expect(event5.param1).to.equal('/folder1/nested--folder1')
    expect(event5.param2).to.equal(null)
    expect(event5.data).to.equal(`{"id":4,"scope":"${scope}","name":"nested--folder1","path":"/folder1/nested--folder1"}`)

    const event6 = await em.findOneOrFail(Event, 6)
    expect(event6.type).to.equal(EVENT_TYPES.FOLDER_DELETED)
    expect(event6.param1).to.equal('/folder1')
    expect(event6.param2).to.equal(null)
    expect(event6.data).to.equal(`{"id":2,"scope":"${scope}","name":"folder1","path":"/folder1"}`)
  }

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test remove nodes - private scope', async () => {
    await createFileStructure(STATIC_SCOPE.PRIVATE.toString())

    const op = new userFile.NodesRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ ids })
    em.clear()

    await assertResults(STATIC_SCOPE.PRIVATE.toString())
  })

  it('test remove nodes - public scope', async () => {
    await createFileStructure(STATIC_SCOPE.PUBLIC.toString())

    const op = new userFile.NodesRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ ids })
    em.clear()

    await assertResults(STATIC_SCOPE.PUBLIC.toString())
  })

  it('test remove nodes - space-1 scope', async () => {
    await createFileStructure('space-1')

    const op = new userFile.NodesRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ ids })
    em.clear()

    await assertResults('space-1')
  })

  it('test remove nodes - remove file created by a different user from a space', async () => {
    const space = create.spacesHelper.create(em, {name: 'test-space'})
    const user2 = create.userHelper.create(em, {dxuser: 'testuser'})
    await em.flush()
    create.spacesHelper.addMember(em, {user, space})
    const file = create.filesHelper.create(em, {user: user2}, {name: 'test-file.txt', scope: `space-${space.id}`})
    await em.flush()

    const op = new userFile.NodesRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    await op.execute({ ids: [file.id] } as RemoveNodesInput)

    const loadedFile = await em.findOne(Node, {id: file.id})
    expect(loadedFile).to.be.null()
  })

  it('test remove nodes - fail to remove file from space with VIEWER role', async () => {
    const space = create.spacesHelper.create(em, {name: 'test-space'})
    const user2 = create.userHelper.create(em, {dxuser: 'testuser'})
    await em.flush()
    create.spacesHelper.addMember(em, {user, space}, {role: SPACE_MEMBERSHIP_ROLE.VIEWER})
    const file = create.filesHelper.create(em, {user: user2}, {name: 'test-file.txt', scope: `space-${space.id}`})
    await em.flush()

    const op = new userFile.NodesRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ ids: [file.id] } as RemoveNodesInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.message).to
        .equal(`You have no permissions to remove '${file.name}'.`)
    }
  })

})
