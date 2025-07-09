import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { User } from '@shared/domain/user/user.entity'
import { Event } from '@shared/domain/event/event.entity'
import { create, db } from '@shared/test'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { expect } from 'chai'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import { STATIC_SCOPE } from '@shared/enums'
import { FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { stub } from 'sinon'
import { SCOPE } from '@shared/types/common'

describe('FolderService', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  const userId = 100
  const userContext = { id: userId } as UserContext

  const nodeRepoFindAccessibleStub = stub()

  const nodeRepo = {
    findAccessible: nodeRepoFindAccessibleStub,
  } as unknown as NodeRepository

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, { id: userId })
    await em.flush()

    nodeRepoFindAccessibleStub.reset()
    nodeRepoFindAccessibleStub.throws()
  })

  describe('#getFolderChildren', async () => {
    it('in space', async () => {
      nodeRepoFindAccessibleStub.reset()
      const folderService = new FolderService(em, userContext, nodeRepo)
      const scopes: SCOPE[] = ['space-1']
      const parentFolderId = 1

      await folderService.getFolderChildren({
        scopes,
        folderId: parentFolderId,
        types: [FILE_STI_TYPE.USERFILE],
      })
      expect(nodeRepoFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepoFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(1)
      expect(whereClause.$or[0].scope).to.eq(scopes[0])
      expect(whereClause.$or[0].scopedParentFolder).to.eq(parentFolderId)
      expect(whereClause.stiType).to.deep.eq({
        $in: [FILE_STI_TYPE.USERFILE],
      })
    })

    it('private', async () => {
      nodeRepoFindAccessibleStub.reset()
      const folderService = new FolderService(em, userContext, nodeRepo)

      const scopes: SCOPE[] = ['private']
      const parentFolderId = 2

      await folderService.getFolderChildren({ scopes, folderId: parentFolderId })

      expect(nodeRepoFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepoFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(1)
      expect(whereClause.$or[0].scope).to.eq(scopes[0])
      expect(whereClause.$or[0].parentFolder).to.eq(parentFolderId)
      expect(whereClause.$or[0].user).to.eq(user.id)
    })

    it('multiple scopes', async () => {
      nodeRepoFindAccessibleStub.reset()
      const folderService = new FolderService(em, userContext, nodeRepo)

      const scopes: SCOPE[] = ['private', 'space-1', 'space-2']
      const parentFolderId = 3

      await folderService.getFolderChildren({
        scopes,
        folderId: parentFolderId,
        types: [FILE_STI_TYPE.FOLDER],
      })

      expect(nodeRepoFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepoFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(3)

      const privateCondition = whereClause.$or[0]
      expect(privateCondition.scope).to.eq('private')
      expect(privateCondition.parentFolder).to.eq(parentFolderId)
      expect(privateCondition.user).to.eq(user.id)

      const space1Condition = whereClause.$or[1]
      expect(space1Condition.scope).to.eq('space-1')
      expect(space1Condition.scopedParentFolder).to.eq(parentFolderId)
      expect(space1Condition.user).to.be.undefined

      const space2Condition = whereClause.$or[2]
      expect(space2Condition.scope).to.eq('space-2')
      expect(space2Condition.scopedParentFolder).to.eq(parentFolderId)
      expect(space2Condition.user).to.be.undefined

      expect(whereClause.stiType).to.deep.eq({
        $in: [FILE_STI_TYPE.FOLDER],
      })
    })
  })

  it('Test create single folder', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)
    const folderName = 'folder1'

    const folder = await folderService.createFolder(folderName, STATIC_SCOPE.PRIVATE, userId)
    expect(folder).to.be.not.null()

    const loadedFolder = await em.getRepository(Folder).findOneOrFail({ id: folder.id })
    expect(loadedFolder).to.be.not.null()
    expect(loadedFolder.name).to.be.equal(folderName)

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal(`/${folderName}`)
  })

  it('Test create nested folder in private scope', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    const folderName = 'folder1'

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

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal(`/${parentFolder.name}/${folderName}`)
  })

  it('Test create nested folder in space scope', async () => {
    const spaceScope = 'space-1'
    const folderService = new FolderService(em, userContext, nodeRepo)
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: spaceScope },
    )
    await em.flush()
    const folderName = 'folder1'

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

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal(`/${parentFolder.name}/${folderName}`)
  })

  it('Test create folders in a path - private scope', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)
    const folderPath = 'folder1/folder2/folder3'

    const folders = await folderService.createFoldersOnPath(
      folderPath,
      STATIC_SCOPE.PRIVATE,
      userId,
    )
    expect(folders.length).to.be.equal(3)

    const loadedFolders = await em
      .getRepository(Folder)
      .find({ name: { $in: ['folder1', 'folder2', 'folder3'] } })
    expect(loadedFolders.length).to.be.equal(3)

    const folder1 = loadedFolders.find((f) => f.name === 'folder1')
    expect(folder1?.parentFolder).to.be.undefined()

    const folder2 = loadedFolders.find((f) => f.name === 'folder2')
    expect(folder2?.parentFolder?.id).to.be.equal(folder1?.id)

    const folder3 = loadedFolders.find((f) => f.name === 'folder3')
    expect(folder3?.parentFolder?.id).to.be.equal(folder2?.id)

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal('/folder1')
    expect(folderEvents[1].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[1].param1).to.equal('/folder1/folder2')
    expect(folderEvents[2].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[2].param1).to.equal(`/${folderPath}`)
  })

  it('Test create folders in a path - reuse existing folders in space scope', async () => {
    const scope = 'space-1'
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1', scope })
    await em.flush()
    const folder2 = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder1 },
      { name: 'folder2', scope },
    )
    await em.flush()

    const folderService = new FolderService(em, userContext, nodeRepo)
    const folderPath = 'folder1/folder2/folder3'

    const folders = await folderService.createFoldersOnPath(folderPath, scope, userId)

    expect(folders.length).to.be.equal(3)
    expect(folders[0].id).to.be.equal(folder1.id)
    expect(folders[1].id).to.be.equal(folder2.id)

    const loadedFolders = await em.getRepository(Folder).find({})
    expect(loadedFolders.length).to.be.equal(3)
    expect(loadedFolders[0].id).to.be.equal(folder1.id)
    expect(loadedFolders[0].name).to.be.equal('folder1')

    expect(loadedFolders[1].id).to.be.equal(folder2.id)
    expect(loadedFolders[1].name).to.be.equal('folder2')

    expect(loadedFolders[2].name).to.be.equal('folder3')
    expect(loadedFolders[2].scope).to.be.equal(scope)

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal('/folder1/folder2/folder3')
  })

  it('Test create folders in a path - reuse existing folders in private scope', async () => {
    const folder1 = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'folder1', scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    const folder2 = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder1 },
      { name: 'folder2', scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()

    const folderService = new FolderService(em, userContext, nodeRepo)
    const folderPath = 'folder1/folder2/folder3'

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
    expect(loadedFolders[0].name).to.be.equal('folder1')

    expect(loadedFolders[1].id).to.be.equal(folder2.id)
    expect(loadedFolders[1].name).to.be.equal('folder2')

    expect(loadedFolders[2].name).to.be.equal('folder3')
    expect(loadedFolders[2].scope).to.be.equal(STATIC_SCOPE.PRIVATE)

    const folderEvents = await em.getRepository(Event).find({})
    expect(folderEvents[0].type).to.equal(EVENT_TYPES.FOLDER_CREATED)
    expect(folderEvents[0].param1).to.equal('/folder1/folder2/folder3')
  })

  it('Test create folders in a path - provide non existing userId -> error', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)

    try {
      await folderService.createFoldersOnPath('tmp', STATIC_SCOPE.PRIVATE, 1)
      expect.fail('Should throw error')
    } catch (err) {
      expect(err.message).to.be.equal('User not found ({ id: 1 })')
    }
  })

  it('Test create folders in a path - null folder -> error', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)

    try {
      // @ts-ignore
      await folderService.createFoldersOnPath(null, STATIC_SCOPE.PRIVATE, userId)
      expect.fail('Should throw error')
    } catch (err) {
      expect(err.message).to.be.equal('Path must not be empty')
    }
  })

  it('Test create folders in path - first folder is created by another user in private scope', async () => {
    const folderService = new FolderService(em, userContext, nodeRepo)
    const folderPath = 'folder1/folder2/folder3'

    const user2 = create.userHelper.create(em, { id: 200 })
    await em.flush()
    create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: 'folder1', scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()

    await folderService.createFoldersOnPath(folderPath, STATIC_SCOPE.PRIVATE, userId)

    const loadedFolders = await em.getRepository(Folder).find({ name: 'folder1' })

    expect(loadedFolders.length).to.be.equal(2)
    const user1Folder = loadedFolders.find((f) => f.user.id === userId)
    expect(user1Folder).to.be.not.null()
    const user2Folder = loadedFolders.find((f) => f.user.id === userId)
    expect(user2Folder).to.be.not.null()
  })
})
