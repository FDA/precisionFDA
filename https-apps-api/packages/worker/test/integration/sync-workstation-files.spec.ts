import { wrap, EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User, UserFile, Tag, Tagging, Folder, Job } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FILES_LIST_RES_SNAPSHOT,
  FILES_LIST_RES_TEST_FOLDER,
  FOLDERS_LIST_RES,
  FOLDERS_LIST_RES_MEDIUM,
  FOLDERS_LIST_RES_LARGE,
} from '@pfda/https-apps-shared/src/test/mock-responses'
import {
  FILE_STATE_DX,
  FILE_STI_TYPE,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
import { fakes as localFakes } from '../utils/mocks'


const insertFoldersToDb = async (em, user, job: Job, folderCount: number, fileCountPerFolder: number) => {
  const folders = []
  for (let i=0; i<folderCount; i++) {
    const folder = create.filesHelper.createFolder(em, { user },
      { name: `folder-${i}`, parentId: job.id, project: job.project },
    )
    folders.push(folder)
  }
  await em.flush()
}

const createSyncWorkstationFilesTask = async (
  payload: CheckStatusJob['payload'],
  user: CheckStatusJob['user'],
) => {
  const defaultTestQueue = queue.getStatusQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.SYNC_WORKSTATION_FILES,
    payload,
    user,
  })
}

describe('TASK: sync_workstation_files', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    app = create.appHelper.createHTTPS(em, { user })
    await em.flush()
    // reset fakes
    mocksReset()
  })

  // Migrated from sync-job-spec.ts
  context('files sync', () => {
    it('calls listFolders, listFiles, describeFiles with payload', async () => {
      const job = create.jobHelper.create(em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.RUNNING })
      // not sure if the calls will be called in this order
      // might require a smarter handler (based on path return mock or something)
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/') {
          return FILES_LIST_RES_ROOT
        }
        if (args?.folder === '/.Notebook_snapshots') {
          return FILES_LIST_RES_SNAPSHOT
        }
        if (args?.folder === '/test-folder') {
          return FILES_LIST_RES_TEST_FOLDER
        }
        return { results: [], next: null }
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.foldersListFake.calledOnce).to.be.true()
      expect(fakes.client.filesListFake.callCount).to.equal(6)
      // filesDesc is removed
      expect(fakes.client.filesDescFake.notCalled).to.be.true()
      // todo: test payload of the calls
      // const listAllCallArgs = fakes.client.filesListFake.getCall(0).args[0]
      // expect(listAllCallArgs).to.have.keys(['accessToken', 'project'])
      // todo: and more
    })

    it('does not call describe endpoint if there are no new files', async () => {
      const prepareEm = em.fork()
      const job = create.jobHelper.create(
        prepareEm,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await prepareEm.flush()
      const tag = create.tagsHelper.create(prepareEm, { name: 'HTTPS File' })
      const rootFile = create.filesHelper.create(
        prepareEm,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE_DX.CLOSED,
          stiType: FILE_STI_TYPE.USERFILE,
          parentFolderId: null,
          // weird error with update
          // parent: wrap(job).toReference(),
          parentId: job.id,
          parentType: PARENT_TYPE.JOB,
          dxid: FILES_LIST_RES_ROOT.results[0].id,
          project: job.project,
          uid: `${FILES_LIST_RES_ROOT.results[0].id}-1`,
          fileSize: FILES_DESC_RES.results[0].describe.size,
          name: FILES_DESC_RES.results[0].describe.name,
        },
      )
      create.tagsHelper.createTagging(
        prepareEm,
        { tag },
        {
          userFile: rootFile,
          tagger: user,
        },
      )
      await prepareEm.flush()
      prepareEm.clear()
      em.clear()

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.RUNNING })
      // custom stub return function based on folderPath
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.filesDescFake.notCalled).to.be.true()
    })

    it('creates regular file in the database - root folder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      // first client.filesList() for all the files
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/'],
      })
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(UserFile, {}, { populate: false })
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      // // converted to JSON to remove user reference
      const resultFile = wrap(filesInDb[0]).toJSON()
      expect(resultFile).to.have.property('dxid', firstFileDxid)
      expect(resultFile).to.have.property('parentFolderId', null)
      expect(resultFile).to.have.property('parentId', job.id)
      expect(resultFile).to.have.property('parentType', PARENT_TYPE.JOB)
      expect(resultFile).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)
      expect(resultFile).to.have.property('stiType', FILE_STI_TYPE.USERFILE)

      const taggingsInDb = await em.find(Tagging, {}, { populate: ['tag'] })
      expect(taggingsInDb).to.be.an('array').with.lengthOf(1)
      const resultTagging = wrap(taggingsInDb[0]).toJSON()
      expect(resultTagging).to.have.property('taggableId', resultFile.id)
      expect(resultTagging).to.have.property('tag')
      expect(resultTagging.tag).to.have.property('name', 'HTTPS File')
      expect(resultTagging.tag).to.have.property('taggingCount', 1)
    })

    it('creates regular file in the database - and also subfolder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      // first client.filesList() for all the files
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/subfolder'],
      })
      // nothing in root
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/subfolder') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(foldersInDb).to.be.an('array').with.lengthOf(1)
      // converted to JSON to remove user reference
      const resultFile = wrap(filesInDb[0]).toJSON()
      const resultFolder = wrap(foldersInDb[0]).toJSON()
      expect(resultFile).to.have.property('dxid', firstFileDxid)
      expect(resultFile).to.have.property('parentFolderId', resultFolder.id)
      expect(resultFile).to.have.property('parentId', job.id)
      expect(resultFile).to.have.property('parentType', PARENT_TYPE.JOB)
      expect(resultFile).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)
      expect(resultFile).to.have.property('stiType', FILE_STI_TYPE.USERFILE)

      const taggingsInDb = await em.find(Tagging, {}, { populate: ['tag'] })
      expect(taggingsInDb).to.be.an('array').with.lengthOf(2)
      const fileTagging = wrap(
        taggingsInDb.find(tagging => tagging.taggableId === resultFile.id),
      ).toJSON()
      const folderTagging = wrap(
        taggingsInDb.find(tagging => tagging.taggableId === resultFolder.id),
      ).toJSON()
      expect(fileTagging).to.exist()
      expect(folderTagging).to.exist()
      expect(fileTagging).to.have.property('tag')
      expect(fileTagging.tag).to.have.property('name', 'HTTPS File')
      expect(fileTagging.tag).to.have.property('taggingCount', 2)

      expect(folderTagging).to.have.property('tag')
      expect(folderTagging.tag).to.have.property('name', 'HTTPS File')
      expect(folderTagging.tag).to.have.property('taggingCount', 2)
    })

    it('creates snapshot file', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // custom stub return function based on folderPath
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/.Notebook_snapshots') {
          return { results: [FILES_LIST_RES_SNAPSHOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(foldersInDb).to.be.an('array').with.lengthOf(2)
      const snapshotsFolder = foldersInDb.find(f => f.name === '.Notebook_snapshots')
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(filesInDb[0]).to.have.property('entityType', FILE_ORIGIN_TYPE.HTTPS)
      expect(filesInDb[0].parentFolderId).to.be.equal(snapshotsFolder.id)
      const taggings = await em.find(Tagging, {}, { populate: ['tag'] })
      expect(taggings).to.be.an('array').with.lengthOf(4)
      expect(taggings.map(t => t.taggableId)).to.have.members([
        filesInDb[0].id,
        filesInDb[0].id,
        ...foldersInDb.map(f => f.id),
      ])
      // two folder + one file = 3, the file is a snapshot = 1
      expect(taggings.map(t => t.tag.taggingCount)).to.have.members([1, 3, 3, 3])
    })
    // todo: create snapshot in a subfolder

    it('moves a file from root to subfolder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE_DX.CLOSED,
          stiType: FILE_STI_TYPE.USERFILE,
          parentFolderId: null,
          parentId: job.id,
          parentType: PARENT_TYPE.JOB,
          dxid: firstFileDxid,
          project: job.project,
          uid: `${firstFileDxid}-1`,
          fileSize: FILES_DESC_RES.results[0].describe.size,
          name: FILES_DESC_RES.results[0].describe.name,
        },
      )
      create.tagsHelper.createTagging(
        em,
        { tag },
        {
          userFile: firstFile,
          tagger: user,
        },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/test-folder') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()
      // todo: add assertions
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      const subfolder = foldersInDb.find(f => f.name === 'test-folder')
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      // // converted to JSON to remove user reference
      const resultFile = wrap(filesInDb[0]).toJSON()
      expect(resultFile).to.have.property('dxid', firstFileDxid)
      expect(resultFile).to.have.property('parentFolderId', subfolder.id)
      // tagging also correctly recreated
      const taggingsInDb = await em.find(Tagging, {}, { populate: ['tag'] })
      // one file, two folders
      expect(taggingsInDb).to.be.an('array').with.lengthOf(3)
      const resultTagging = wrap(taggingsInDb.find(t => t.taggableId === resultFile.id)).toJSON()
      expect(resultTagging).to.exist()
      expect(resultTagging).to.have.property('tag')
      expect(resultTagging.tag).to.have.property('taggingCount', 3)
    })

    it('deletes regular file from the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE_DX.CLOSED,
          stiType: FILE_STI_TYPE.USERFILE,
          parentFolderId: null,
          // weird error with update
          // parent: wrap(job).toReference(),
          parentId: job.id,
          parentType: PARENT_TYPE.JOB,
          dxid: firstFileDxid,
          project: job.project,
          uid: `${firstFileDxid}-1`,
          fileSize: FILES_DESC_RES.results[0].describe.size,
          name: FILES_DESC_RES.results[0].describe.name,
        },
      )
      create.tagsHelper.createTagging(
        em,
        { tag },
        {
          userFile: firstFile,
          tagger: user,
        },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      // first client.filesList() for all the files
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/'],
      })
      // nothing in root
      fakes.client.filesListFake.returns({
        results: [],
        next: null,
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      expect(foldersInDb).to.be.an('array').with.lengthOf(0)
      const usedTag = await em.findOne(Tag, { name: 'HTTPS File' }, { populate: ['taggings'] })

      expect(usedTag).to.have.property('taggingCount', 0)
      expect(usedTag).to.have.property('taggings')
      expect(usedTag.taggings.count()).to.equal(0)
    })

    it('updates filename', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE_DX.CLOSED,
          stiType: FILE_STI_TYPE.USERFILE,
          parentFolderId: null,
          parentId: job.id,
          parentType: PARENT_TYPE.JOB,
          dxid: firstFileDxid,
          project: job.project,
          uid: `${firstFileDxid}-1`,
          fileSize: FILES_DESC_RES.results[0].describe.size,
          name: FILES_DESC_RES.results[0].describe.name,
        },
      )
      create.tagsHelper.createTagging(
        em,
        { tag },
        {
          userFile: firstFile,
          tagger: user,
        },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/'],
      })
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/') {
          return {
            results: [
              {
                ...FILES_LIST_RES_ROOT.results[0],
                describe: {
                  id: FILES_LIST_RES_ROOT.results[0].id,
                  name: 'new-name',
                  size: 0,
                },
              },
            ],
            next: null,
          }
        }
        return { results: [], next: null }
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(filesInDb[0]).to.have.property('name', 'new-name')
    })

    it('deletes folder from the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      create.filesHelper.createFolder(
        em,
        { user },
        { name: 'b', parentId: job.id, project: job.project },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      // first client.filesList() for all the files
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/'],
      })
      // nothing in root
      fakes.client.filesListFake.returns({
        results: [],
        next: null,
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      expect(foldersInDb).to.be.an('array').with.lengthOf(0)
      // const usedTag = await em.findOne(Tag, { name: 'HTTPS File' }, { populate: ['taggings'] })

      // console.log(usedTag)
      // expect(usedTag).to.have.property('taggingCount', 0)
      // expect(usedTag).to.have.property('taggings')
      // expect(usedTag.taggings.count()).to.equal(0)
    })

    it('deletes folder and file from the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      const folder = create.filesHelper.createFolder(
        em,
        { user },
        { name: 'b', parentId: job.id, project: job.project },
      )
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      await em.flush()
      const file = create.filesHelper.create(
        em,
        { user },
        { name: 'c', parentFolderId: folder.id, parentId: job.id, project: job.project },
      )
      create.tagsHelper.createTagging(
        em,
        { tag },
        {
          userFile: file,
          tagger: user,
        },
      )
      await em.flush()

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      // first client.filesList() for all the files
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/'],
      })
      // nothing in root
      fakes.client.filesListFake.returns({
        results: [],
        next: null,
      })
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      expect(foldersInDb).to.be.an('array').with.lengthOf(0)
      const usedTag = await em.findOne(Tag, { name: 'HTTPS File' }, { populate: ['taggings'] })

      expect(usedTag).to.have.property('taggingCount', 0)
      expect(usedTag).to.have.property('taggings')
      expect(usedTag.taggings.count()).to.equal(0)
    })

    // See PFDA-2715 for why
    it('handles more than 32 remote folders', async () => {
      const job = create.jobHelper.create(em, { user, app },
        { ...generate.job.simple, state: JOB_STATE.RUNNING, project: user.privateFilesProject },
      )
      await em.flush()

      // Create a mock terminated job, with 33 folders and no files within the folders
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      fakes.client.foldersListFake.onCall(0).returns(FOLDERS_LIST_RES_LARGE)
      fakes.client.filesListFake.returns({
        results: [],
        next: null,
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()

      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'], orderBy: { name: 'ASC' } })
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      expect(foldersInDb).to.be.an('array').with.lengthOf(33)
      expect(foldersInDb.map((f: Folder) => f.name).slice(0,5)).to.have.ordered.members([
        'folder-0',
        'folder-1',
        'folder-10',
        'folder-11',
        'folder-12',
      ])
    })

    // Skipping this for now because it exceeds the timeout for a unit test
    it.skip('handles deletion of more than 10000 folders', async () => {
      const job = create.jobHelper.create(em, { user, app },
        { ...generate.job.simple, state: JOB_STATE.RUNNING, project: user.privateFilesProject },
      )
      await em.flush()

      await insertFoldersToDb(em, user, job, 10000, 1)

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      fakes.client.foldersListFake.onCall(0).returns(FOLDERS_LIST_RES)
      fakes.client.filesListFake.returns({
        results: [],
        next: null,
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()

      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'], orderBy: { name: 'ASC' } })
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      expect(foldersInDb).to.be.an('array').with.lengthOf(2)
      expect(foldersInDb.map((f: Folder) => f.name)).to.have.ordered.members([
        '.Notebook_snapshots',
        'test-folder',
      ])
    })

    // This is a conflict case that is not well handled by the system
    //   1. User creates a folder on pFDA, adds a file to that folder
    //   2. User also creates a folder with the same name on the platform, adds a file to that folder
    //   3. User terminates workstation and files are synchronized
    //
    it.skip('handles simultaneous creation of the same folder name in both platform and pFDA', async () => {
      const job = create.jobHelper.create(em, { user, app },
        { ...generate.job.simple, state: JOB_STATE.RUNNING, project: user.privateFilesProject },
      )
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      await em.flush()
      const folder = create.filesHelper.createFolder(em, { user },
        { name: 'foobar', parentId: job.id, project: job.project },
      )
      await em.flush()
      const file = create.filesHelper.create(em, { user },
        { name: 'stu', parentFolderId: folder.id, parentId: job.id, project: job.project },
      )
      create.tagsHelper.createTagging(em, { tag }, {
        userFile: file,
        tagger: user,
      })
      await em.flush()

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      fakes.client.foldersListFake.onCall(0).returns({
        id: FOLDERS_LIST_RES.id,
        folders: ['/', '/foobar'],
      })
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/foobar') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()

      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'], orderBy: { name: 'ASC' } })
      // In this case, where folders are created on both platform and PFDA there is a conflict,
      //
      expect(foldersInDb).to.be.an('array').with.lengthOf(1)
      expect(foldersInDb[0].id).to.be.equal(folder.id)
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(filesInDb[0].id).to.be.equal(file.id)
    })

    it('handles simultaneous files and folder insertion and deletion', async () => {
      const job = create.jobHelper.create(em, { user, app },
        { ...generate.job.simple, state: JOB_STATE.RUNNING, project: user.privateFilesProject },
      )
      await em.flush()

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.RUNNING })
      fakes.client.foldersListFake.returns(FOLDERS_LIST_RES_MEDIUM)
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/foo/bar/stu') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })

      // Do the first sync and create the list of folders with no files inside
      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      {
        const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'], orderBy: { name: 'ASC' } })
        const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
        expect(foldersInDb).to.be.an('array').with.lengthOf(5)
        expect(filesInDb).to.be.an('array').with.lengthOf(1)
      }

      // Do the second sync after user has deleted two folders /foo/bar and /foo/bar/stu (and its contents)
      // but added file additions to /foo
      const platformFolders = Object.assign({}, FOLDERS_LIST_RES_MEDIUM)
      // User deletes two folder via the workstation
      platformFolders.folders = platformFolders.folders.slice(0, -2)
      fakes.client.foldersListFake.returns(platformFolders)
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/foo') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })

      await createSyncWorkstationFilesTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      em.clear()

      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'], orderBy: { name: 'ASC' } })
      expect(foldersInDb).to.be.an('array').with.lengthOf(3)
      expect(foldersInDb[0].name).to.be.equal('.Notebook_snapshots')
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(filesInDb[0].name).to.be.equal('a')
    })
  })
})
