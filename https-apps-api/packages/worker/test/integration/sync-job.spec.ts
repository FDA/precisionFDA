import { wrap, EntityManager } from '@mikro-orm/core'
import { DateTime } from 'luxon'
import { database, queue, errors } from '@pfda/https-apps-shared'
import { App, User, Job, UserFile, Tag, Tagging, Folder } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FOLDERS_LIST_RES,
} from '@pfda/https-apps-shared/src/test/mock-responses'
import {
  FILE_STI_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { SyncJobOperation } from '@pfda/https-apps-shared/src/domain/job'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { fakes as localFakes, mocksReset as localMocksReset } from '../utils/mocks'
import { stripEntityDates } from '../utils/expect-helper'
import { errorsFactory } from '../utils/errors-factory'
import { NOTIFICATION_ACTION, SEVERITY } from '@pfda/https-apps-shared/src/enums'

describe('SyncJobOperation BullJobId', () => {
  it('creates correct bullJob ids', async () => {
    const jobDxid = 'job-1234567'
    const bullJobId = SyncJobOperation.getBullJobId(jobDxid)
    expect(bullJobId).to.equal('sync_job_status.job-1234567')
  })

  it('parses bullJob ids correctly', async () => {
    const bullJobId = 'sync_job_status.job-G9jb79Q0qp9yX9G51fykB5VP'
    const jobDxid = SyncJobOperation.getJobDxidFromBullJobId(bullJobId)
    expect(jobDxid).to.equal('job-G9jb79Q0qp9yX9G51fykB5VP')
  })
})

const createSyncJobTask = async (
  payload: CheckStatusJob['payload'],
  user: CheckStatusJob['user'],
) => {
  const defaultTestQueue = queue.getMainQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.SYNC_JOB_STATUS,
    payload,
    user,
  })
}

describe('TASK: sync_job_status', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    // probably not needed
    // await emptyDefaultQueue()
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    app = create.appHelper.createHTTPS(em, { user })
    await em.flush()
    // reset fakes
    mocksReset()
    localMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
    await em.flush()
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })

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
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })

    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()

    // Check no notification
    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
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
    expect(fakes.queue.createSyncWorkstationFilesTask.notCalled).to.be.true()

    // Check no notification
    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
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
    expect(fakes.queue.createSyncWorkstationFilesTask.notCalled).to.be.true()
    // const afterEm = em.fork()
    // const maybeUpdatedJob = await afterEm.findOne(Job, job.id)
    // console.log(job, maybeUpdatedJob, '!')
    // expect(maybeUpdatedJob).to.have.property('updatedAt').that.is.equal(job.updatedAt)
  })

  it('updates our DB, local state is IDLE, remote is TERMINATED', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
    )
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
    // no folders created in the job
    fakes.client.foldersListFake.returns({ ...FOLDERS_LIST_RES, folders: [] })
    // no files created in the job
    fakes.client.filesListFake.returns([])
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
    // TODO(samuel) fix entity manager type
    const events = await (afterEm as any as SqlEntityManager).createQueryBuilder('events').select('*').execute()
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
      data: null,
    })

    // Check workstation sync job is queued
    expect(fakes.queue.createSyncWorkstationFilesTask.calledOnce).to.be.true()

    // Check notification
    expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    const notificationArg = fakes.notificationService.createNotification.args[0][0]
    expect(notificationArg.action).to.equal(NOTIFICATION_ACTION.JOB_TERMINATED)
    expect(notificationArg.severity).to.equal(SEVERITY.INFO)
    expect(notificationArg.meta.linkTitle).to.equal('View Execution')
    expect(notificationArg.meta.linkUrl).to.include(job.uid)
  })

  it('sends a warning email to user if job is failed', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.RUNNING, project: user.privateFilesProject },
    )
    await em.flush()

    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.FAILED })
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )

    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
    expect(fakes.queue.createEmailSendTaskFake.calledOnce).to.be.true()

    const [email, userCtx] = fakes.queue.createEmailSendTaskFake.getCall(0).args
    expect(email).to.have.property('to', user.email)
    expect(email).to.have.property('subject', `Execution "${job.name}" failed`)
    expect(userCtx).to.have.property('id', user.id)

    // Check notification
    expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    const notificationArg = fakes.notificationService.createNotification.args[0][0]
    expect(notificationArg.action).to.equal(NOTIFICATION_ACTION.JOB_FAILED)
    expect(notificationArg.severity).to.equal(SEVERITY.ERROR)
    expect(notificationArg.meta.linkTitle).to.equal('View Execution')
    expect(notificationArg.meta.linkUrl).to.include(job.uid)
  })

  context('stale job', () => {
    it('calls job termination client call when job is running for too long', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      job.createdAt = DateTime.now().minus({ days: 3, minutes: 1 }).toJSDate()
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })

      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
      expect(fakes.client.jobTerminateFake.calledOnce).to.be.true()
      // assuming email notif. was already sent
      expect(fakes.queue.createEmailSendTaskFake.notCalled).to.be.true()
      expect(fakes.queue.createSyncWorkstationFilesTask.notCalled).to.be.true()
    })

    it('sends email to job owner when job is running for too long', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      job.createdAt = DateTime.now().minus({ days: 2, minutes: 1 }).toJSDate()
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })

      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.createEmailSendTaskFake.calledOnce).to.be.true()
      const [email, userCtx] = fakes.queue.createEmailSendTaskFake.getCall(0).args
      expect(email).to.have.property('to', user.email)
      expect(email).to.have.property(
        'subject',
        `precisionFDA Workstation ${job.name} will terminate in 24 hours`,
      )
      expect(userCtx).to.have.property('id', user.id)
      // not called - the interval for email is shorter
      expect(fakes.client.jobTerminateFake.notCalled).to.be.true()
    })
  })

  context('files sync', () => {
    // old tests - for inspiration (:
    it.skip('creates two regular files with tags', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // first client.filesList() for all the files
      fakes.client.filesListFake.onCall(0).returns(
        FILES_LIST_RES_ROOT.results.slice(0, 2),
      )
      // second client.filesList() for snapshots subfolder
      fakes.client.filesListFake.onCall(1).returns([])
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      // @ts-expect-error Fix - ts says that array has smaller length
      const firstFileDxid = FILES_LIST_RES_ROOT.results[5].id
      fakes.client.filesListFake.returns(
      // @ts-expect-error Fix - ts says that array has smaller length
        [FILES_LIST_RES_ROOT.results[5]])
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
        parentFolder: null,
        scopedParentFolder: null,
        description: null,
        fileSize: FILES_DESC_RES.results[0].describe.size,
        name: FILES_DESC_RES.results[0].describe.name,
        state: 'closed',
        scope: 'private',
        // TODO(samuel) refactor this into FILE_ORIGIN_TYPE as defined in user-file.entity
        // @ts-expect-error FILE_TYPE enum does not exist
        entityType: FILE_TYPE?.SNAPSHOT,
        stiType: FILE_STI_TYPE.USERFILE,
      })
    })

    it.skip('creates tags for both regular and snapshot file', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // all the files
      fakes.client.filesListFake.onCall(0).returns(
        // @ts-expect-error FILE_TYPE enum does not exist
        [FILES_LIST_RES_ROOT.results[0], FILES_LIST_RES_ROOT.results[5]])
      // snapshot files
      fakes.client.filesListFake.onCall(1).returns(
        // @ts-expect-error FILE_TYPE enum does not exist
        [FILES_LIST_RES_ROOT.results[5]])
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
      // @ts-expect-error FILE_TYPE enum does not exist
      const regularFile = filesInDb.find(file => file.entityType === FILE_TYPE.REGULAR)
      // @ts-expect-error FILE_TYPE enum does not exist
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
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.privateFilesProject },
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
      fakes.client.filesListFake.onCall(0).returns([])
      // second client.filesList() for snapshots subfolder
      fakes.client.filesListFake.onCall(1).returns([])
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

    it('it handles InvalidAuthentication - ExpiredToken gracefully', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      await em.flush()
      fakes.client.jobDescribeFake.rejects(errorsFactory.createClientTokenExpiredError())

      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })

    it('it handles ClientRequestError gracefully', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      await em.flush()
      fakes.client.jobDescribeFake.rejects(errorsFactory.createServiceUnavailableError())

      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
    })

    it('it handles other error gracefully', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      fakes.client.jobDescribeFake.rejects(new Error('boom'))
      await em.flush()
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true()
    })
  })
})
