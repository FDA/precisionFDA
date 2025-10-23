import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { stub } from 'sinon'
import { expect } from 'chai'
import { EventHelper } from '@shared/domain/event/event.helper'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db } from '@shared/test'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { Node } from '@shared/domain/user-file/node.entity'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'

describe('FolderService', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  const userId = 100
  const userContext = { id: userId } as UserContext

  const nodeHelperGetNodePathStub = stub()
  const eventHelperCreateFolderEventStub = stub()

  const nodeHelper = {
    getNodePath: nodeHelperGetNodePathStub,
  } as unknown as NodeHelper

  const eventHelper = {
    createFolderEvent: eventHelperCreateFolderEventStub,
  } as unknown as EventHelper

  const folderRepo = {} as unknown as FolderRepository

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, { id: userId })
    await em.flush()

    nodeHelperGetNodePathStub.reset()
    nodeHelperGetNodePathStub.throws()

    eventHelperCreateFolderEventStub.reset()
    eventHelperCreateFolderEventStub.throws()
  })

  it('Test create single folder', async () => {
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const folderName = 'folder1'
    nodeHelperGetNodePathStub.resolves(`/${folderName}`)
    eventHelperCreateFolderEventStub.reset()

    const folder = await folderService.createFolder(folderName, STATIC_SCOPE.PRIVATE, userId)
    expect(folder).to.be.not.null()

    const loadedFolder = await em.getRepository(Folder).findOneOrFail({ id: folder.id })
    expect(loadedFolder).to.be.not.null()
    expect(loadedFolder.name).to.be.equal(folderName)

    expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(`/${folderName}`)
  })

  it('Test create nested folder in private scope', async () => {
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    const folderName = 'folder1'

    nodeHelperGetNodePathStub.resolves(`/${parentFolder.name}/${folderName}`)
    eventHelperCreateFolderEventStub.reset()

    const folder = await folderService.createFolder(
      folderName,
      STATIC_SCOPE.PRIVATE,
      userId,
      { type: 'user', value: user },
      parentFolder.id,
    )
    expect(folder).to.be.not.null()

    const loadedFolder = await em.getRepository(Folder).findOneOrFail({ id: folder.id })
    expect(loadedFolder.name).to.be.equal(folderName)
    expect(loadedFolder.parentFolder.id).to.be.equal(parentFolder.id)
    expect(loadedFolder.parentType).to.be.equal(PARENT_TYPE.USER)
    expect(loadedFolder.parentId).to.be.equal(user.id)

    expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(
      `/${parentFolder.name}/${folderName}`,
    )
  })

  it('Test create nested folder in space scope', async () => {
    const spaceScope = 'space-1'
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: spaceScope },
    )
    await em.flush()
    const folderName = 'folder1'

    nodeHelperGetNodePathStub.resolves(`/${parentFolder.name}/${folderName}`)
    eventHelperCreateFolderEventStub.reset()

    const folder = await folderService.createFolder(
      folderName,
      spaceScope,
      userId,
      { type: 'user', value: user },
      parentFolder.id,
    )
    expect(folder).to.be.not.null()

    const loadedFolder = await em
      .getRepository(Folder)
      .findOneOrFail({ id: folder.id }, { populate: ['scopedParentFolder'] })
    expect(loadedFolder.name).to.be.equal(folderName)
    expect(loadedFolder.scopedParentFolder?.id).to.be.equal(parentFolder.id)
    expect(loadedFolder.parentType).to.be.equal(PARENT_TYPE.USER)
    expect(loadedFolder.parentId).to.be.equal(user.id)

    expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(
      `/${parentFolder.name}/${folderName}`,
    )
  })

  it('Test create folders in a path - private scope', async () => {
    const folder1Name = 'folder1'
    const folder2Name = 'folder2'
    const folder3Name = 'folder3'

    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const folderPath = `${folder1Name}/${folder2Name}/${folder3Name}`

    nodeHelperGetNodePathStub.callsFake((node: Node, _folders: string[] | undefined = []) => {
      switch (node.name) {
        case folder1Name:
          return `/${folder1Name}`
        case folder2Name:
          return `/${folder1Name}/${folder2Name}`
        case folder3Name:
          return `/${folder1Name}/${folder2Name}/${folder3Name}`
      }
    })
    eventHelperCreateFolderEventStub.reset()

    const folders = await folderService.createFoldersOnPath(
      folderPath,
      STATIC_SCOPE.PRIVATE,
      userId,
    )
    expect(folders.length).to.be.equal(3)

    const loadedFolders = await em
      .getRepository(Folder)
      .find({ name: { $in: [folder1Name, folder2Name, folder3Name] } })
    expect(loadedFolders.length).to.be.equal(3)

    const folder1 = loadedFolders.find((f) => f.name === folder1Name)
    expect(folder1?.parentFolder).to.be.undefined()

    const folder2 = loadedFolders.find((f) => f.name === folder2Name)
    expect(folder2?.parentFolder?.id).to.be.equal(folder1?.id)

    const folder3 = loadedFolders.find((f) => f.name === folder3Name)
    expect(folder3?.parentFolder?.id).to.be.equal(folder2?.id)

    expect(eventHelperCreateFolderEventStub.calledThrice).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(`/${folder1Name}`)
    expect(eventHelperCreateFolderEventStub.secondCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.secondCall.args[2]).to.equal(
      `/${folder1Name}/${folder2Name}`,
    )
    expect(eventHelperCreateFolderEventStub.thirdCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.thirdCall.args[2]).to.equal(
      `/${folder1Name}/${folder2Name}/${folder3Name}`,
    )
  })

  it('Test create folders in a path - reuse existing folders in space scope', async () => {
    const scope = 'space-1'
    const folder1Name = 'folder1'
    const folder2Name = 'folder2'
    const folder3Name = 'folder3'

    const folder1 = create.filesHelper.createFolder(em, { user }, { name: folder1Name, scope })
    await em.flush()
    const folder2 = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder1 },
      { name: folder2Name, scope },
    )
    await em.flush()

    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const folderPath = `${folder1Name}/${folder2Name}/${folder3Name}`
    nodeHelperGetNodePathStub.resolves(folderPath)
    eventHelperCreateFolderEventStub.reset()

    const folders = await folderService.createFoldersOnPath(folderPath, scope, userId)

    expect(folders.length).to.be.equal(3)
    expect(folders[0].id).to.be.equal(folder1.id)
    expect(folders[1].id).to.be.equal(folder2.id)

    const loadedFolders = await em.getRepository(Folder).find({})
    expect(loadedFolders.length).to.be.equal(3)
    expect(loadedFolders[0].id).to.be.equal(folder1.id)
    expect(loadedFolders[0].name).to.be.equal(folder1Name)

    expect(loadedFolders[1].id).to.be.equal(folder2.id)
    expect(loadedFolders[1].name).to.be.equal(folder2Name)

    expect(loadedFolders[2].name).to.be.equal(folder3Name)
    expect(loadedFolders[2].scope).to.be.equal(scope)

    expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(folderPath)
  })

  it('Test create folders in a path - reuse existing folders in private scope', async () => {
    const folder1Name = 'folder1'
    const folder2Name = 'folder2'
    const folder3Name = 'folder3'
    const folder1 = create.filesHelper.createFolder(
      em,
      { user },
      { name: folder1Name, scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    const folder2 = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder1 },
      { name: folder2Name, scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()

    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const folderPath = `${folder1Name}/${folder2Name}/${folder3Name}`
    nodeHelperGetNodePathStub.resolves(folderPath)
    eventHelperCreateFolderEventStub.reset()

    const folders = await folderService.createFoldersOnPath(
      folderPath,
      STATIC_SCOPE.PRIVATE,
      userId,
    )

    expect(folders.length).to.be.equal(3)
    expect(folders[0].id).to.be.equal(folder1.id)
    expect(folders[1].id).to.be.equal(folder2.id)

    const loadedFolders = await em.getRepository(Folder).find({})
    expect(loadedFolders.length).to.be.equal(3)
    expect(loadedFolders[0].id).to.be.equal(folder1.id)
    expect(loadedFolders[0].name).to.be.equal(folder1Name)

    expect(loadedFolders[1].id).to.be.equal(folder2.id)
    expect(loadedFolders[1].name).to.be.equal(folder2Name)

    expect(loadedFolders[2].name).to.be.equal(folder3Name)
    expect(loadedFolders[2].scope).to.be.equal(STATIC_SCOPE.PRIVATE)

    expect(eventHelperCreateFolderEventStub.calledOnce).to.be.true()
    expect(eventHelperCreateFolderEventStub.firstCall.args[0]).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(eventHelperCreateFolderEventStub.firstCall.args[2]).to.equal(folderPath)
  })

  it('Test create folders in a path - provide non existing userId -> error', async () => {
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)

    try {
      await folderService.createFoldersOnPath('tmp', STATIC_SCOPE.PRIVATE, 1)
      expect.fail('Should throw error')
    } catch (err) {
      expect(err.message).to.be.equal('User not found ({ id: 1 })')
    }
  })

  it('Test create folders in a path - null folder -> error', async () => {
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)

    try {
      // @ts-ignore
      await folderService.createFoldersOnPath(null, STATIC_SCOPE.PRIVATE, userId)
      expect.fail('Should throw error')
    } catch (err) {
      expect(err.message).to.be.equal('Path must not be empty')
    }
  })

  it('Test create folders in path - first folder is created by another user in private scope', async () => {
    const folder1Name = 'folder1'
    const folder2Name = 'folder2'
    const folder3Name = 'folder3'
    const folderService = new FolderService(em, userContext, folderRepo, nodeHelper, eventHelper)
    const folderPath = `${folder1Name}/${folder2Name}/${folder3Name}`

    nodeHelperGetNodePathStub.reset()
    eventHelperCreateFolderEventStub.reset()

    const user2 = create.userHelper.create(em, { id: 200 })
    await em.flush()
    create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: folder1Name, scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()

    await folderService.createFoldersOnPath(folderPath, STATIC_SCOPE.PRIVATE, userId)

    const loadedFolders = await em.getRepository(Folder).find({ name: folder1Name })

    expect(loadedFolders.length).to.be.equal(2)
    const user1Folder = loadedFolders.find((f) => f.user.id === userId)
    expect(user1Folder).to.be.not.null()
    const user2Folder = loadedFolders.find((f) => f.user.id === userId)
    expect(user2Folder).to.be.not.null()
  })
})
