import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Event } from '@shared/domain/event/event.entity'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { FolderRemoveRecursiveOperation } from '@shared/domain/user-file/ops/folder-remove-recursive'
import { SyncFoldersInput } from '@shared/domain/user-file/user-file.input'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { create, db } from '@shared/test'
import { expect } from 'chai'

describe('folder events tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: any
  let userCtx: UserCtx
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
    const deleteOp = new FolderRemoveRecursiveOperation({
      em,
      log,
      user: userCtx,
    })

    let deleteFolderInput = { id: childFolder.id }
    await deleteOp.execute(deleteFolderInput)

    deleteFolderInput = { id: parentFolder.id }
    await deleteOp.execute(deleteFolderInput)

    const deleteChildEvent = await em.findOneOrFail(Event, {
      param1: '/foo/boo',
      type: EVENT_TYPES.FOLDER_DELETED,
    })
    const deleteChildData = JSON.parse(deleteChildEvent.data)
    expect(deleteChildData.path).to.equals('/foo/boo')
    expect(deleteChildData.id).to.equals(2)
    expect(deleteChildData.scope).to.equals('private')
    expect(deleteChildData.name).to.equals('boo')

    const deleteParentEvent = await em.findOneOrFail(Event, {
      param1: '/foo',
      type: EVENT_TYPES.FOLDER_DELETED,
    })
    const deleteParentData = JSON.parse(deleteParentEvent.data)
    expect(deleteParentData.path).to.equals('/foo')
    expect(deleteParentData.id).to.equals(1)
    expect(deleteParentData.scope).to.equals('private')
    expect(deleteParentData.name).to.equals('foo')
  })
})
