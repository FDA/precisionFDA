import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { Folder, Tagging, User } from '@pfda/https-apps-shared/src/domain'
import { userFile, database, getLogger, types } from '@pfda/https-apps-shared'
import { create, db } from '@pfda/https-apps-shared/src/test'
import type { SyncFoldersInput } from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from 'shared/src/domain/user-file/user-file.enum'

describe('syncFolders operation', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: any
  let userCtx: types.UserCtx
  let defaultInput: Omit<SyncFoldersInput, 'remoteFolderPaths'>
  const project = 'project-foo'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    await em.clear()
    userCtx = { ...user, accessToken: 'foo' }
    defaultInput = {
      scope: 'private',
      projectDxid: project,
      // todo: create a job in db
      parentType: PARENT_TYPE.JOB,
      parentId: 1,
    }
  })

  it('creates a folder', async () => {
    const op = new userFile.SyncFoldersOperation({
      // parentFolder init issues
      em: database.orm().em.fork(),
      // em,
      log,
      user: userCtx,
    })

    const input = { ...defaultInput, remoteFolderPaths: ['/foo'] }
    const res = await op.execute(input)
    // todo: complete test of DB entry shape
    expect(res).to.be.an('array').with.lengthOf(1)
    expect(res[0]).to.have.property('name', 'foo')
    expect(res[0]).to.have.property('parentFolderId', undefined)
    expect(res[0]).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)

    const loaded_from_db = await em.findOneOrFail(Folder, res[0].id)
    expect(loaded_from_db).to.have.property('name', 'foo')
    expect(loaded_from_db).to.have.property('parentFolderId', null)
    expect(loaded_from_db).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)
  })

  it('creates two subfolders with the same name', async () => {
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    await em.flush()
    const op = new userFile.SyncFoldersOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, remoteFolderPaths: ['/foo', '/foo/bar', '/foo/bar/bar'] }
    const res = await op.execute(input)
    expect(res).to.be.an('array').with.lengthOf(3)
    // foo
    const local = res.find(f => f.id === folder.id)
    expect(local).to.exist()
    // // foo/bar
    const subfolder = res.find(f => f.name === 'bar' && f.parentFolderId === folder.id)
    expect(subfolder).to.exist()
    expect(subfolder.parentFolderId).to.be.equal(local.id)
    // // foo/bar/bar
    const subfolder2 = res.find(f => f.name === 'bar' && f.parentFolderId !== folder.id)
    expect(subfolder2).to.exist()
    expect(subfolder2.parentFolderId).to.be.equal(subfolder.id)
  })

  it('creates folders with the same name', async () => {
    const op = new userFile.SyncFoldersOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, remoteFolderPaths: ['/a', '/a/b', '/a/b/a'] }
    const res = await op.execute(input)
    expect(res).to.be.an('array').with.lengthOf(3)
  })

  it('removes a subfolder', async () => {
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
    await em.flush()
    const subfolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'bar', project, parentFolderId: folder.id },
    )
    await em.flush()
    // add taggings to both
    create.tagsHelper.createTagging(em, { tag }, { folder, tagger: user })
    create.tagsHelper.createTagging(em, { tag }, { folder: subfolder, tagger: user })
    await em.flush()

    const op = new userFile.SyncFoldersOperation({
      em,
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, remoteFolderPaths: ['/foo'] }
    const res = await op.execute(input)
    expect(res).to.be.an('array').with.lengthOf(1)
    expect(res[0]).to.have.property('id', folder.id)
    em.clear()
    const taggingsInDb = await em.find(Tagging, {}, { populate: ['tag'] })
    expect(taggingsInDb).to.have.lengthOf(1)
    expect(taggingsInDb[0]).to.have.property('taggableId', folder.id)
    expect(taggingsInDb[0].tag).to.have.property('taggingCount', 1)
  })

  it('removes two nested subfolders', async () => {
    const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    await em.flush()
    const sub = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'bar', project, parentFolderId: folder.id },
    )
    await em.flush()
    const sub2 = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'baz', project, parentFolderId: sub.id },
    )
    await em.flush()
    create.tagsHelper.createTagging(em, { tag }, { folder, tagger: user })
    create.tagsHelper.createTagging(em, { tag }, { folder: sub, tagger: user })
    create.tagsHelper.createTagging(em, { tag }, { folder: sub2, tagger: user })
    await em.flush()

    const op = new userFile.SyncFoldersOperation({
      em,
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, remoteFolderPaths: ['/foo'] }
    const res = await op.execute(input)
    expect(res).to.be.an('array').with.lengthOf(1)
    expect(res[0]).to.have.property('id', folder.id)
  })

  it('creates a folder and deletes a folder', async () => {
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'foo', project })
    await em.flush()
    const op = new userFile.SyncFoldersOperation({
      em,
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, remoteFolderPaths: ['/bar'] }
    const res = await op.execute(input)
    expect(res).to.be.an('array').with.lengthOf(1)
    expect(res[0]).to.have.property('id').that.is.not.equal(folder.id)
    expect(res[0]).to.have.property('name', 'bar')
  })
})
