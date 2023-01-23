import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User, Folder, Job, UserFile, Asset } from '@pfda/https-apps-shared/src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import type {
  SyncFilesInFolderInput,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import {
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { userFile, database, getLogger, types } from '@pfda/https-apps-shared'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
} from '@pfda/https-apps-shared/src/test/mock-responses'

describe('syncFilesInFolder operation', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let job: Job
  let folder: Folder
  let log: any
  let userCtx: types.UserCtx
  let defaultInput: SyncFilesInFolderInput
  const project = 'project-foo'

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    job = create.jobHelper.create(em, { user })
    await em.flush()
    folder = create.filesHelper.createFolder(
      em,
      { user },
      {
        name: 'a',
        project,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
    defaultInput = {
      runAdd: true,
      runRemove: true,
      projectDxid: project,
      folderId: folder.id,
      scope: job.scope,
      parentId: job.id,
      parentType: PARENT_TYPE.JOB,
      entityType: FILE_ORIGIN_TYPE.HTTPS,
    }
    mocksReset()
  })

  it('does nothing when it finds no new files', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      {
        name: 'b',
        project,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 1))
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    // response shape
    expect(Object.keys(res)).to.have.members(['folder', 'folderPath', 'files'])
    expect(res.folder).to.have.property('id', subfolder.id)
    expect(res.folderPath).to.equal('/a/b')

    expect(fakes.client.filesListFake.calledOnce).to.be.true()
    expect(fakes.client.filesDescFake.notCalled).to.be.true()
    const nodesCount = await em.count(UserFile, {}, { filters: ['userfile'] })
    expect(nodesCount).to.be.equal(1)
  })

  it('returns new file', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const createdFileDesc = FILES_DESC_RES.results[1].describe
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      {
        name: 'b',
        project,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(1, 2))
    const input = { ...defaultInput, folderId: folder.id }
    const res = await op.execute(input)
    // in the folder these is only one file
    expect(res.folderPath).to.equal('/a')
    expect(res).to.have.property('files')
    expect(res.files.map(f => f.dxid)).to.have.members([createdFileDesc.id])
    expect(fakes.client.filesListFake.calledOnce).to.be.true()
    expect(res.files[0]).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)
  })

  it('creates one more new file in a subfolder', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const createdFileDesc = FILES_DESC_RES.results[1].describe
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      {
        name: 'b',
        project,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    // fixme: responses mismatch
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 2))
    fakes.client.filesDescFake
      .onCall(0)
      .returns({ results: FILES_DESC_RES.results.slice(1, 2), next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res.folderPath).to.equal('/a/b')
    expect(res.files.map(f => f.dxid)).to.have.members([createdFileDesc.id, file.dxid])
    expect(res.files.map(f => f.parentFolder.id)).to.have.members([subfolder.id, subfolder.id])
    expect(fakes.client.filesListFake.calledOnce).to.be.true()
    expect(fakes.client.filesDescFake.notCalled).to.be.true()
  })

  it('deletes file', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      { name: 'b', project },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake.onCall(0).returns([])
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res).to.have.property('files').that.has.lengthOf(0)
  })

  it('runs file name change', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      { name: 'b', project },
    )
    await em.flush()
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    // returns the same file but with a different name
    fakes.client.filesListFake.onCall(0).returns([
      {
        ...FILES_LIST_RES_ROOT[0],
        describe: {
          id: FILES_LIST_RES_ROOT[0].id,
          name: 'new-name',
          size: 0,
        },
      },
    ])
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res.files.map(f => f.dxid)).to.have.members([file.dxid])
    expect(res.files[0]).to.have.property('name', 'new-name')

    em.clear()
    const files = await em.find(UserFile, {}, { filters: ['userfile'] })
    expect(files).to.be.an('array').with.lengthOf(1)
    expect(files[0]).to.have.property('name', 'new-name')
    expect(files[0]).to.have.property('parentFolderId', subfolder.id)
  })

  it('deletes existing file and creates another', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const secondFileDxid = FILES_LIST_RES_ROOT[1].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      { name: 'b', project },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user },
      {
        name: 'c',
        project,
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(1, 2))
    fakes.client.filesDescFake
      .onCall(0)
      .returns({ results: FILES_DESC_RES.results.slice(1, 2), next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res.files.map(f => f.dxid)).to.have.members([secondFileDxid])
  })

  it('works with uploaded files as well', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const secondFileDxid = FILES_LIST_RES_ROOT[1].id
    // file was uploaded to the project manually
    const file = create.filesHelper.createUploaded(
      em,
      { user },
      {
        name: 'a',
        project,
        dxid: firstFileDxid,
        parentId: user.id,
        parentType: PARENT_TYPE.USER,
      },
    )
    const remoteFile = create.filesHelper.create(
      em,
      { user },
      {
        name: 'b',
        project,
        dxid: secondFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 2))
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, folderId: null }
    const res = await op.execute(input)
    // no additions and deletions should happen
    // op only returns HTTPS files
    expect(res.files.map(f => f.dxid)).to.have.members([secondFileDxid])
    expect(res.files.map(f => f.id)).to.have.members([remoteFile.id])
    const filesInDb = await em.find(UserFile, { user })
    // op did not operate with local files, did not recreate or delete it
    // even though the file was returned from the api call
    expect(filesInDb.map(f => f.id)).to.have.members([file.id, remoteFile.id])
  })

  it('works with uploaded files even in wrong subfolder', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const secondFileDxid = FILES_LIST_RES_ROOT[1].id
    // file was uploaded to the project manually
    const file = create.filesHelper.createUploaded(
      em,
      { user },
      {
        name: 'a',
        project,
        dxid: firstFileDxid,
        parentId: user.id,
        parentType: PARENT_TYPE.USER,
      },
    )
    const remoteFile = create.filesHelper.create(
      em,
      { user },
      {
        name: 'b',
        project,
        dxid: secondFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 2))
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    // operation runs for "/" and it still handles local file in a subfolder
    // because that is how it is represented right now remotely
    const input = { ...defaultInput, folderId: null }
    const res = await op.execute(input)
    // no additions and deletions should happen
    // op only returns HTTPS files
    expect(res.files.map(f => f.dxid)).to.have.members([secondFileDxid])
    expect(res.files.map(f => f.id)).to.have.members([remoteFile.id])
    const filesInDb = await em.find(UserFile, { user })
    // op did not operate with local files, did not recreate or delete it
    // even though the file was returned from the api call
    expect(filesInDb.map(f => f.id)).to.have.members([file.id, remoteFile.id])
  })

  it('works with local asset files as well', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    const secondFileDxid = FILES_LIST_RES_ROOT[1].id
    // file was uploaded to the project manually
    const file = create.filesHelper.createUploadedAsset(
      em,
      { user },
      {
        name: 'a',
        project,
        dxid: firstFileDxid,
        parentId: user.id,
        parentType: PARENT_TYPE.USER,
      },
    )
    await em.flush()
    const remoteFile = create.filesHelper.create(
      em,
      { user },
      {
        name: 'b',
        project,
        dxid: secondFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 2))
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    const input = { ...defaultInput, folderId: null }
    const res = await op.execute(input)
    // no additions and deletions should happen
    // op only returns HTTPS files
    expect(res.files.map(f => f.dxid)).to.have.members([secondFileDxid])
    expect(res.files.map(f => f.id)).to.have.members([remoteFile.id])
    const filesInDb = await em.find(UserFile, { user })
    const assetsInDb = await em.find(Asset, { user })
    // op did not operate with local files, did not recreate or delete it
    // even though the file was returned from the api call
    expect(filesInDb.map(f => f.id)).to.have.members([remoteFile.id])
    expect(assetsInDb.map(f => f.id)).to.have.members([file.id])
  })

  it('does nothing when it finds file with given dxid regardless of project', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT[0].id
    create.filesHelper.create(
      em,
      { user },
      {
        name: 'c',
        project: 'different-project',
        dxid: firstFileDxid,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
      },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns(FILES_LIST_RES_ROOT.slice(0, 1))
    const res = await op.execute(defaultInput)
    // response shape
    expect(Object.keys(res)).to.have.members(['folder', 'folderPath', 'files'])
    expect(res.folderPath).to.equal('/a')

    expect(fakes.client.filesListFake.calledOnce).to.be.true()
    expect(fakes.client.filesDescFake.notCalled).to.be.true()
    const nodesCount = await em.count(UserFile, {}, { filters: ['userfile'] })
    expect(nodesCount).to.be.equal(1)
  })

  // todo: deletes file when folder is deleted
  // todo: error states - folder does not exist etc, rollback happens
})
