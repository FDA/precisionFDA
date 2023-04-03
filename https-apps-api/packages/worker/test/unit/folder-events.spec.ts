import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { User } from '@pfda/https-apps-shared/src/domain'
import { Event } from '@pfda/https-apps-shared/src/domain/event'
import { userFile, database, getLogger, types } from '@pfda/https-apps-shared'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { EVENT_TYPES } from '@pfda/https-apps-shared/src/domain/event/event.helper'
import { expect } from 'chai'
import { SyncFoldersInput } from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import { PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'

describe('folder events tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: any
  let userCtx: types.UserCtx
  let defaultInput: Omit<SyncFoldersInput, 'remoteFolderPaths'>
  const project = 'project-foo'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    defaultInput = {
      scope: 'private',
      projectDxid: project,
      parentType: PARENT_TYPE.JOB,
      parentId: 1,
    }
  })

  it('test FolderRemoveRecursiveOperation to create an DeleteFolder event ', async () => {
    // create folder tree
    const parentFolder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    await em.flush()
    const childFolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder },
      { name: 'boo', project },
    )
    await em.flush()

    // delete folder
    const deleteOp = new userFile.FolderRemoveRecursiveOperation({
      em,
      log,
      user: userCtx,
    })

    let deleteFolderInput = { id: childFolder.id }
    await deleteOp.execute(deleteFolderInput)

    deleteFolderInput = { id: parentFolder.id }
    await deleteOp.execute(deleteFolderInput)

    const deleteChildEvent = await em.findOneOrFail(
      Event,
      { param1: '/foo/boo', type: EVENT_TYPES.FOLDER_DELETED },
    )
    const deleteChildData = JSON.parse(deleteChildEvent.data)
    expect(deleteChildData.path).to.equals('/foo/boo')
    expect(deleteChildData.id).to.equals(2)
    expect(deleteChildData.scope).to.equals('private')
    expect(deleteChildData.name).to.equals('boo')

    const deleteParentEvent = await em.findOneOrFail(
      Event,
      { param1: '/foo', type: EVENT_TYPES.FOLDER_DELETED },
    )
    const deleteParentData = JSON.parse(deleteParentEvent.data)
    expect(deleteParentData.path).to.equals('/foo')
    expect(deleteParentData.id).to.equals(1)
    expect(deleteParentData.scope).to.equals('private')
    expect(deleteParentData.name).to.equals('foo')
  })

  it('test SyncFoldersOperation to create CreateFolder and DeleteFolder events', async () => {
    // create three folders
    const op = new userFile.SyncFoldersOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })
    const input1 = { ...defaultInput, remoteFolderPaths: ['/a', '/a/b', '/a/b/a'] }
    const res1 = await op.execute(input1)
    expect(res1).to.be.an('array').with.lengthOf(3)
    await em.findOneOrFail(Event, { param1: '/a', type: EVENT_TYPES.FOLDER_CREATED })
    await em.findOneOrFail(Event, { param1: '/a/b', type: EVENT_TYPES.FOLDER_CREATED })
    await em.findOneOrFail(Event, { param1: '/a/b/a', type: EVENT_TYPES.FOLDER_CREATED })

    // create folder and delete one folder
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    await em.flush()
    const input2 = { ...defaultInput, remoteFolderPaths: ['/bar'] }
    const res2 = await op.execute(input2)
    expect(res2).to.be.an('array').with.lengthOf(1)
    expect(res2[0]).to.have.property('id').that.is.not.equal(folder.id)
    expect(res2[0]).to.have.property('name', 'bar')
    await em.findOneOrFail(Event, { param1: '/foo', type: EVENT_TYPES.FOLDER_DELETED })
    await em.findOneOrFail(Event, { param1: '/bar', type: EVENT_TYPES.FOLDER_CREATED })
  })
})