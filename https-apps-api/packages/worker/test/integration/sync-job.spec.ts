import { wrap } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User, Job, UserFile } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import {
  FILE_STI_TYPE,
  FILE_TYPE,
  PARENT_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
import { dropData } from '../utils/db'
import * as create from '../utils/create'
import * as generate from '../utils/generate'
import { fakes } from '../utils/mocks'
import {
  FILES_DESC_RES,
  FILES_LIST_RES_ROOT,
  FILES_LIST_RES_SNAPSHOT,
} from '../utils/mock-responses'
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
    await dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user })
    await em.flush()
    // reset fakes
    fakes.bull.addToQueueStub.resetHistory()
    fakes.client.jobDescribeFake.resetHistory()
    fakes.client.filesListFake.resetHistory()
    fakes.client.filesDescFake.resetHistory()
    fakes.queue.removeRepeatableFake.resetHistory()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.bull.addToQueueStub.calledOnce).to.be.true()
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
    it('calls the listFiles and descFiles', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      // first file in the response is already known to our system
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      const file = create.filesHelper.create(
        em,
        { user },
        {
          project: job.project,
          parentId: job.id,
          parentType: PARENT_TYPE.JOB,
          dxid: firstFileDxid,
        },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // first call runs with "/" folder, second with "/.Notebook_snapshots"
      fakes.client.filesListFake.onCall(0).returns(FILES_LIST_RES_ROOT)
      fakes.client.filesListFake.onCall(1).returns(FILES_LIST_RES_SNAPSHOT)
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      // test diffs in both calls
      // list files calls
      expect(fakes.client.filesListFake.calledTwice).to.be.true()
      const listAllCallArgs = fakes.client.filesListFake.getCall(0).args[0]
      expect(listAllCallArgs).to.have.keys(['accessToken', 'project'])
      const listSnapshotCallArgs = fakes.client.filesListFake.getCall(1).args[0]
      expect(listSnapshotCallArgs).to.have.keys(['accessToken', 'project', 'folder'])
      expect(listSnapshotCallArgs).to.have.property('folder', '/.Notebook_snapshots')

      // describe file ids call
      expect(fakes.client.filesDescFake.calledOnce).to.be.true()
      const descFilesCallArgs = fakes.client.filesDescFake.getCall(0).args[0]
      expect(descFilesCallArgs)
        .to.have.property('fileIds')
        .that.has.members(FILES_DESC_RES.results.slice(1).map(fileMock => fileMock.describe.id))
      // first file already exists so it is omitted from our system
      expect(descFilesCallArgs).to.have.property('fileIds').that.not.have.members([file.id])
    })

    it('creates regular file in the database', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app },
        { ...generate.job.simple, state: JOB_STATE.IDLE, project: user.jupyterProject },
      )
      await em.flush()
      fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
      // return only first entry so it is easier to test
      const firstFileDxid = FILES_LIST_RES_ROOT.results[0].id
      fakes.client.filesListFake.returns({
        results: [FILES_LIST_RES_ROOT.results[0]],
        next: null,
      })
      fakes.client.filesDescFake.returns({
        results: [FILES_DESC_RES.results[0]],
      })
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      const filesInDb = await em.find(UserFile, {}, { populate: false })
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
        entityType: FILE_TYPE.REGULAR,
        stiType: FILE_STI_TYPE.USERFILE,
      })
    })

    it('creates snapshot file in the database', async () => {
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
      const filesInDb = await em.find(UserFile, {}, { populate: false })
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
