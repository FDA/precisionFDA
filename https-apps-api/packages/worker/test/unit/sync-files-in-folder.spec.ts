import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User, Folder, Job, UserFile } from '@pfda/https-apps-shared/src/domain'
import { userFile, database, getLogger, types } from '@pfda/https-apps-shared'
import { create, db } from '@pfda/https-apps-shared/src/utils/test'
import type { SyncFilesInFolderInput } from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import { FILE_TYPE, PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/utils/test/mocks'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
} from '@pfda/https-apps-shared/src/utils/test/mock-responses'

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
    em = database.orm().em
    user = create.userHelper.create(em)
    job = create.jobHelper.create(em, { user })
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
      projectDxid: project,
      folderId: folder.id,
      scope: job.scope,
      parentId: job.id,
      parentType: PARENT_TYPE.JOB,
      entityType: FILE_TYPE.REGULAR,
    }
    mocksReset()
  })

  it('does nothing when it finds no new files', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parent: folder },
      { name: 'b', project, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      { name: 'c', project, dxid: firstFileDxid, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns({ results: FILES_LIST_RES_ROOT.results.slice(0, 1), next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    // response shape
    expect(Object.keys(res)).to.have.members(['folder', 'folderPath', 'toAdd', 'toRemove'])
    expect(res.folder).to.have.property('id', subfolder.id)
    expect(res.folderPath).to.equal('/a/b')

    expect(fakes.client.filesListFake.calledOnce).to.be.true()
    expect(fakes.client.filesDescFake.notCalled).to.be.true()
    const nodesCount = await em.count(UserFile, {}, { filters: ['userfile'] })
    expect(nodesCount).to.be.equal(1)
  })

  it('returns new file dxid', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
    const createdFileDesc = FILES_DESC_RES.results[1].describe
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parent: folder },
      { name: 'b', project, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      { name: 'c', project, dxid: firstFileDxid, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns({ results: FILES_LIST_RES_ROOT.results.slice(1, 2), next: null })
    const input = { ...defaultInput, folderId: folder.id }
    const res = await op.execute(input)
    // in the folder these is only one file
    expect(res.folderPath).to.equal('/a')
    expect(res).to.have.property('toAdd').that.has.members([createdFileDesc.id])
    expect(res).to.have.property('toRemove').that.has.lengthOf(0)
    expect(fakes.client.filesListFake.calledOnce).to.be.true()
  })

  it('creates one more new file in a subfolder', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
    const createdFileDesc = FILES_DESC_RES.results[1].describe
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parent: folder },
      { name: 'b', project, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      { name: 'c', project, dxid: firstFileDxid, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns({ results: FILES_LIST_RES_ROOT.results.slice(0, 2), next: null })
    fakes.client.filesDescFake
      .onCall(0)
      .returns({ results: FILES_DESC_RES.results.slice(1, 2), next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res.folderPath).to.equal('/a/b')
    expect(res).to.have.property('toAdd').that.has.members([createdFileDesc.id])
    expect(res).to.have.property('toRemove').that.has.lengthOf(0)
    expect(fakes.client.filesListFake.calledOnce).to.be.true()
  })

  it('deletes existing file', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parent: folder },
      { name: 'b', project },
    )
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      { name: 'c', project, dxid: firstFileDxid, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake.onCall(0).returns({ results: [], next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res).to.have.property('toRemove').that.has.members([file.dxid])
    expect(res).to.have.property('toAdd').that.has.lengthOf(0)
  })

  it('deletes existing file and creates another', async () => {
    const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
    const secondFileDxid = FILES_LIST_RES_ROOT.results[1].id
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parent: folder },
      { name: 'b', project },
    )
    const file = create.filesHelper.create(
      em,
      { user, parentFolder: subfolder },
      { name: 'c', project, dxid: firstFileDxid, parentId: job.id, parentType: PARENT_TYPE.JOB },
    )
    await em.flush()
    const op = new userFile.SyncFilesInFolderOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    fakes.client.filesListFake
      .onCall(0)
      .returns({ results: FILES_LIST_RES_ROOT.results.slice(1, 2), next: null })
    fakes.client.filesDescFake
      .onCall(0)
      .returns({ results: FILES_DESC_RES.results.slice(1, 2), next: null })
    const input = { ...defaultInput, folderId: subfolder.id }
    const res = await op.execute(input)
    expect(res).to.have.property('toRemove').that.has.members([file.dxid])
    expect(res).to.have.property('toAdd').that.has.members([secondFileDxid])
  })

  // todo: deletes file when folder is deleted
  // todo: other files (created by user) are left out/not deleted
  // todo: error states - folder does not exist etc, rollback happens
})
