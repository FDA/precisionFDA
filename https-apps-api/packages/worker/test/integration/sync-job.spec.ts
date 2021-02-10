import { wrap } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User, Job, UserFile, Tag, Tagging, Folder } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/utils/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/utils/test/mocks'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FILES_LIST_RES_SNAPSHOT,
  FILES_LIST_RES_TEST_FOLDER,
  FOLDERS_LIST_RES,
} from '@pfda/https-apps-shared/src/utils/test/mock-responses'
import {
  FILE_STATE,
  FILE_STI_TYPE,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
import { fakes as localFakes } from '../utils/mocks'
import { stripEntityDates } from '../utils/expect-helper'

const createSyncJobTask = async (
  payload: CheckStatusJob['payload'],
  user: CheckStatusJob['user'],
) => {
  const defaultTestQueue = queue.getQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.TASKS.SYNC_JOB_STATUS,
    payload,
    user,
  })
}

describe('TASK: sync_job_status', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let app: App

  beforeEach(async () => {
    // probably not needed
    // await emptyDefaultQueue()
    await db.dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user })
    await em.flush()
    // reset fakes
    mocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(localFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('calls the platform API stub (db job state is idle)', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE },
    )
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
  })

  it('does not call the platform API stub (db job state is terminated)', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.DONE },
    )
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.notCalled).to.be.true()
    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
  })

  it('does not change our DB, local and remote state are the same', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE },
    )
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
    // const afterEm = em.fork()
    // const maybeUpdatedJob = await afterEm.findOne(Job, job.id)
    // console.log(job, maybeUpdatedJob, '!')
    // expect(maybeUpdatedJob).to.have.property('updatedAt').that.is.equal(job.updatedAt)
  })

  it('updates our DB, local state is IDLE, remote is TERMINATED', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
    )
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
    // no folders created in the job
    fakes.client.foldersListFake.returns({ ...FOLDERS_LIST_RES, folders: [] })
    // no files created in the job
    fakes.client.filesListFake.returns({ results: [], next: null })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
    // fetch new job
    const afterEm = em.fork()
    const updatedJob = await afterEm.findOne(Job, job.id)
    expect(updatedJob).to.have.property('state', JOB_STATE.TERMINATED)
    expect(updatedJob).to.have.property('updatedAt').that.is.not.equal(job.updatedAt)
    // fetch created event
    const events = await afterEm.createQueryBuilder('events').select('*').execute()
    expect(events).to.be.an('array').with.lengthOf(1)
    expect(stripEntityDates(events[0])).to.be.deep.equal({
      id: 1,
      type: 'Event::JobClosed',
      org_handle: user.organization.getProperty('handle'),
      dxuser: user.dxuser,
      param1: job.dxid,
      param2: app.dxid,
      param3: null,
      param4: null,
    })
  })

  context('files sync', () => {
    it('calls listFolders, listFiles, describeFiles with payload', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
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
      await createSyncJobTask(
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await prepareEm.flush()
      const tag = create.tagsHelper.create(prepareEm, { name: 'HTTPS File' })
      const rootFile = create.filesHelper.create(
        prepareEm,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE.CLOSED,
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

      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // custom stub return function based on folderPath
      fakes.client.filesListFake.callsFake(args => {
        if (args?.folder === '/') {
          return { results: [FILES_LIST_RES_ROOT.results[0]], next: null }
        }
        return { results: [], next: null }
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.filesDescFake.notCalled).to.be.true()
    })

    it('creates regular file in the database - root folder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
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
      await createSyncJobTask(
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

    it('creates regular file in the database - subfolder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
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
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      const foldersInDb = await em.find(Folder, {}, { populate: false, filters: ['folder'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      expect(foldersInDb).to.be.an('array').with.lengthOf(1)
      // // converted to JSON to remove user reference
      const resultFile = wrap(filesInDb[0]).toJSON()
      const resultFolder = wrap(foldersInDb[0]).toJSON()
      expect(resultFile).to.have.property('dxid', firstFileDxid)
      expect(resultFile).to.have.property('parentFolderId', resultFolder.id)
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

    it('creates snapshot file', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
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
      await createSyncJobTask(
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
      expect(taggings).to.be.an('array').with.lengthOf(2)
      expect(taggings.map(t => t.taggableId)).to.have.members([filesInDb[0].id, filesInDb[0].id])
      expect(taggings.map(t => t.tag.taggingCount)).to.have.members([1, 1])
    })
    // todo: create snapshot in a subfolder

    it('moves a file from root to subfolder', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE.CLOSED,
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

      await createSyncJobTask(
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
      expect(taggingsInDb).to.be.an('array').with.lengthOf(1)
      const resultTagging = wrap(taggingsInDb[0]).toJSON()
      expect(resultTagging).to.have.property('taggableId', resultFile.id)
      expect(resultTagging).to.have.property('tag')
      expect(resultTagging.tag).to.have.property('taggingCount', 1)
    })

    it('deletes regular file from the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE.CLOSED,
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
      await createSyncJobTask(
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          entityType: FILE_ORIGIN_TYPE.HTTPS,
          state: FILE_STATE.CLOSED,
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

      await createSyncJobTask(
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
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
      await createSyncJobTask(
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
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
      await createSyncJobTask(
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

    // old tests - for inspiration (:
    it.skip('creates two regular files with tags', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // first client.filesList() for all the files
      fakes.client.filesListFake.onCall(0).returns({
        results: FILES_LIST_RES_ROOT.results.slice(0, 2),
        next: null,
      })
      // second client.filesList() for snapshots subfolder
      fakes.client.filesListFake.onCall(1).returns({
        results: [],
        next: null,
      })
      fakes.client.filesDescFake.returns({
        results: FILES_DESC_RES.results.slice(0, 2),
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(
        UserFile,
        {},
        { populate: ['taggings.tag'], orderBy: { id: 'ASC' }, filters: ['userfile'] },
      )
      expect(filesInDb).to.be.an('array').with.lengthOf(2)
      // userfile id 1
      expect(filesInDb[0]).to.have.property('taggings')
      expect(filesInDb[0].taggings.getItems()).to.be.a('array').with.lengthOf(1)
      expect(filesInDb[0].taggings.getItems()[0]).to.have.property('tagId', 1)
      expect(filesInDb[0].taggings.getItems()[0]).to.have.property('taggerId', user.id)
      expect(filesInDb[0].taggings.getItems()[0]).to.have.property('taggableId', filesInDb[0].id)
      expect(filesInDb[0].taggings.getItems()[0]).to.have.property('taggableType', 'Node')
      expect(filesInDb[0].taggings.getItems()[0]).to.have.property('taggerType', 'User')
      // userfile id 2
      expect(filesInDb[1]).to.have.property('taggings')
      expect(filesInDb[1].taggings.getItems()).to.be.a('array').with.lengthOf(1)
      expect(filesInDb[1].taggings.getItems()[0]).to.have.property('tagId', 1)
      expect(filesInDb[1].taggings.getItems()[0]).to.have.property('taggerId', user.id)
      expect(filesInDb[1].taggings.getItems()[0]).to.have.property('taggableId', filesInDb[1].id)
      expect(filesInDb[1].taggings.getItems()[0]).to.have.property('taggableType', 'Node')
      expect(filesInDb[1].taggings.getItems()[0]).to.have.property('taggerType', 'User')
      // each file has one tag assigned
      // tag has the correct usage count
      const tag = await em.findOne(Tag, { id: 1 })
      expect(tag).to.have.property('taggingCount', 2)
    })

    it.skip('creates snapshot file in the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      const firstFileDxid = FILES_LIST_RES_ROOT.results[5].id
      fakes.client.filesListFake.returns({
        results: [FILES_LIST_RES_ROOT.results[5]],
        next: null,
      })
      fakes.client.filesDescFake.returns({
        results: [FILES_DESC_RES.results[5]],
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      // stiType has to be set explicitely (should go to the repository I guess)
      const filesInDb = await em.find(UserFile, {}, { populate: false, filters: ['userfile'] })
      expect(filesInDb).to.be.an('array').with.lengthOf(1)
      // converted to JSON to remove user reference
      const resultFile = wrap(filesInDb[0]).toJSON()
      expect(stripEntityDates(resultFile)).to.be.deep.equal({
        id: 1,
        dxid: firstFileDxid,
        uid: `${firstFileDxid}-1`,
        user: user.id,
        project: job.project,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
        parentFolderId: null,
        scopedParentFolderId: null,
        description: null,
        fileSize: FILES_DESC_RES.results[0].describe.size,
        name: FILES_DESC_RES.results[0].describe.name,
        state: 'closed',
        scope: 'private',
        entityType: FILE_TYPE.SNAPSHOT,
        stiType: FILE_STI_TYPE.USERFILE,
      })
    })

    it.skip('creates tags for both regular and snapshot file', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // all the files
      fakes.client.filesListFake.onCall(0).returns({
        results: [FILES_LIST_RES_ROOT.results[0], FILES_LIST_RES_ROOT.results[5]],
        next: null,
      })
      // snapshot files
      fakes.client.filesListFake.onCall(1).returns({
        results: [FILES_LIST_RES_ROOT.results[5]],
        next: null,
      })
      fakes.client.filesDescFake.returns({
        results: [FILES_DESC_RES.results[0], FILES_DESC_RES.results[5]],
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      // stiType has to be set explicitely (should go to the repository I guess)
      const filesInDb = await em.find(
        UserFile,
        {},
        { populate: ['taggings.tag'], filters: ['userfile'] },
      )
      expect(filesInDb).to.be.an('array').with.lengthOf(2)
      const regularFile = filesInDb.find(file => file.entityType === FILE_TYPE.REGULAR)
      const snapshotFile = filesInDb.find(file => file.entityType === FILE_TYPE.SNAPSHOT)
      expect(regularFile).to.not.be.undefined()
      expect(regularFile.taggings.count()).to.equal(1)
      expect(regularFile.taggings.getItems()[0].tag).to.have.property('id', 1)
      expect(regularFile.taggings.getItems()[0].tag).to.have.property('taggingCount', 1)

      expect(snapshotFile).to.not.be.undefined()
      expect(snapshotFile.taggings.count()).to.equal(1)
      expect(snapshotFile.taggings.getItems()[0].tag).to.have.property('id', 2)
      expect(snapshotFile.taggings.getItems()[0].tag).to.have.property('taggingCount', 1)
    })

    it.skip('removes file from local database if it is not at the platform', async () => {
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
      const firstFile = create.filesHelper.create(
        em,
        { user },
        {
          ...generate.userFile.simple(),
          parentType: PARENT_TYPE.JOB,
          parentId: job.id,
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
      // first client.filesList() for all the files
      fakes.client.filesListFake.onCall(0).returns({
        results: [],
        next: null,
      })
      // second client.filesList() for snapshots subfolder
      fakes.client.filesListFake.onCall(1).returns({
        results: [],
        next: null,
      })
      fakes.client.filesDescFake.returns({
        results: [],
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      // no new files
      expect(fakes.client.filesDescFake.notCalled).to.be.true()
      em.clear()
      const filesInDb = await em.find(UserFile, {})
      expect(filesInDb).to.be.an('array').with.lengthOf(0)
      const taggingsInDb = await em.find(Tagging, {})
      expect(taggingsInDb).to.be.an('array').with.lengthOf(0)
      const tagsInDb = await em.find(Tag, {})
      expect(tagsInDb).to.be.an('array').with.lengthOf(1)
      expect(tagsInDb[0]).to.have.property('taggingCount', 0)
    })
  })

  // test: check if removeRepeatable are called -> important
  context('error states', () => {
    it('removes task from queue when job is not found', async () => {
      const fakeJobId = `job-${generate.random.dxstr()}`
      await createSyncJobTask(
        { dxid: fakeJobId },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })

    it('removes task from queue when client API call errors', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      fakes.client.jobDescribeFake.rejects(new Error('boom'))
      await em.flush()
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })
  })
})
