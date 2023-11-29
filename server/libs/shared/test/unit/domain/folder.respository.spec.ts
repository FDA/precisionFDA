/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { create, db } from '@shared/test'
import { FILE_ORIGIN_TYPE, FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { Folder, User, UserFile } from '@shared/domain'
import { readJsonConfigFile } from 'typescript'

describe('FolderRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  // let log: any
  let user1: User
  let user2: User
  let files: UserFile[]
  let folders: Folder[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    // log = getLogger()
    await em.flush()

    files = []
    folders = []

    // Create a file tree for two users for testing
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user1 },
      { name: 'user1_folder1', entityType: FILE_ORIGIN_TYPE.HTTPS, project: user1.privateFilesProject },
    ))
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user1 },
      { name: 'user1_folder2', entityType: FILE_ORIGIN_TYPE.REGULAR },
    ))

    folders.push(create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: 'user2_folder1', entityType: FILE_ORIGIN_TYPE.REGULAR },
    ))
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: 'user2_folder2', entityType: FILE_ORIGIN_TYPE.HTTPS, project: user2.privateFilesProject },
    ))
    await em.flush()

    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file1', parentType: PARENT_TYPE.USER, parentId: user1.id, entityType: FILE_ORIGIN_TYPE.HTTPS }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file2', parentType: PARENT_TYPE.USER, parentId: user1.id, entityType: FILE_ORIGIN_TYPE.HTTPS }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file3', parentType: PARENT_TYPE.USER, parentId: user1.id }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file4', parentType: PARENT_TYPE.USER, parentId: user1.id, parentFolder: folders[0], entityType: FILE_ORIGIN_TYPE.HTTPS }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file5', parentType: PARENT_TYPE.USER, parentId: user1.id, parentFolder: folders[1] }))

    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file1', parentType: PARENT_TYPE.USER, parentId: user2.id }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file2', parentType: PARENT_TYPE.USER, parentId: user2.id, entityType: FILE_ORIGIN_TYPE.HTTPS }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file3', parentType: PARENT_TYPE.USER, parentId: user2.id, parentFolder: folders[2] }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file4', parentType: PARENT_TYPE.USER, parentId: user2.id, parentFolder: folders[3], entityType: FILE_ORIGIN_TYPE.HTTPS }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file5', parentType: PARENT_TYPE.USER, parentId: user2.id }))
    // Copy of the above file
    files.push(create.filesHelper.create(em, { user: user2 }, {
      name: 'user2_file5_copy',
      dxid: files[9].dxid,
      uid: `${files[9].dxid}-2`,
    }))
    await em.flush()
  })

  it('findForUser', async () => {
    const repo = em.getRepository(Folder)
    let result1 = await repo.findForUser({ userId: user1.id })
    expect(result1).to.have.length(2)
    expect(result1[0].name).to.equal('user1_folder1')
    expect(result1[1].name).to.equal('user1_folder2')

    let result2 = await repo.findForUser({ userId: user2.id })
    expect(result2).to.have.length(2)
    expect(result2[0].name).to.equal('user2_folder1')
    expect(result2[1].name).to.equal('user2_folder2')
  })

  it('findHTTPFolders and findAllHTTPSFoldersForUser', async () => {
    const repo = em.getRepository(Folder)
    let results = await repo.findAllHTTPSFoldersForUser({ userId: user1.id })
    expect(results).to.have.length(1)
    expect(results[0].name).to.equal('user1_folder1')
    expect(results[0].entityType).to.equal(FILE_ORIGIN_TYPE.HTTPS)

    results = await repo.findAllHTTPSFoldersForUser({ userId: user2.id })
    expect(results).to.have.length(1)
    expect(results[0].name).to.equal('user2_folder2')
    expect(results[0].entityType).to.equal(FILE_ORIGIN_TYPE.HTTPS)

    results = await repo.findAllHTTPSFolders()
    expect(results).to.have.length(2)
    expect(results[0].name).to.equal('user1_folder1')
    expect(results[0].entityType).to.equal(FILE_ORIGIN_TYPE.HTTPS)
    expect(results[0].user.getEntity().dxuser).to.equal(user1.dxuser)
    expect(results[1].name).to.equal('user2_folder2')
    expect(results[1].entityType).to.equal(FILE_ORIGIN_TYPE.HTTPS)
    expect(results[1].user.getEntity().dxuser).to.equal(user2.dxuser)
  })

  it('findAllPFDAOnlyFolders', async () => {
    const repo = em.getRepository(Folder)
    const results = await repo.findAllPFDAOnlyFolders()
    expect(results[0].isPFDAOnly()).to.be.true()
    expect(results[1].isPFDAOnly()).to.be.true()
    const names = results.map(x => x.name)
    expect(names).to.deep.equal(['user1_folder2', 'user2_folder1'])
  })

  it('findPFDAOnlyFoldersForUser', async () => {
    const repo = em.getRepository(Folder)
    const results = await repo.findPFDAOnlyFoldersForUser({ userId: user1.id })
    expect(results[0].isPFDAOnly()).to.be.true()
    const names = results.map(x => x.name)
    expect(names).to.deep.equal(['user1_folder2'])
  })
})
