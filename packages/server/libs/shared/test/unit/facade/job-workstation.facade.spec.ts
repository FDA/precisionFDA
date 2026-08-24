import { expect } from 'chai'
import { stub } from 'sinon'
import { AuthService } from '@shared/domain/auth/services/auth.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InternalError, InvalidStateError, NotFoundError, WorkstationAPIError } from '@shared/errors'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { PlatformClient } from '@shared/platform-client'

describe('JobWorkstationFacade', () => {
  const createWorkstationSnapshotTaskStub = stub()
  const createWorkstationSnapshotStub = stub()
  const createNotificationStub = stub()
  const getAccessibleEntityByUidStub = stub()
  const setAPIKeyStub = stub()
  const systemNewAuthTokenStub = stub()
  const generateCliKeyStub = stub()

  const user = {
    id: 1,
    sessionId: 'session-id',
  } as unknown as UserContext
  const jobService = {
    createWorkstationSnapshot: createWorkstationSnapshotStub,
    getAccessibleEntityByUid: getAccessibleEntityByUidStub,
    setAPIKey: setAPIKeyStub,
  } as unknown as JobService
  const notificationService = {
    createNotification: createNotificationStub,
  } as unknown as NotificationService
  const fileSyncQueueJobProducer = {
    createWorkstationSnapshotTask: createWorkstationSnapshotTaskStub,
  } as unknown as FileSyncQueueJobProducer
  const platformClient = {
    systemNewAuthToken: systemNewAuthTokenStub,
  } as unknown as PlatformClient
  const authService = {
    generateCliKey: generateCliKeyStub,
  } as unknown as AuthService

  const CODE = 'code'
  const KEY = 'key'

  beforeEach(() => {
    createWorkstationSnapshotTaskStub.reset()
    createWorkstationSnapshotTaskStub.resolves(undefined)

    createWorkstationSnapshotStub.reset()
    createWorkstationSnapshotStub.resolves({ statusText: 'success' })

    createNotificationStub.reset()
    createNotificationStub.resolves(undefined)

    getAccessibleEntityByUidStub.reset()
    getAccessibleEntityByUidStub.throws()

    setAPIKeyStub.reset()
    setAPIKeyStub.resolves(undefined)

    systemNewAuthTokenStub.reset()
    systemNewAuthTokenStub.resolves(CODE)

    generateCliKeyStub.reset()
    generateCliKeyStub.returns(KEY)
  })

  context('openExternal', () => {
    const JOB_URL = 'https://job-abc123.internal.dnanexus.cloud'
    const jobUid = 'job-open-ext-1' as Uid<'job'>

    const makeJob = (overrides: Partial<Job> = {}): Job =>
      ({
        id: 1,
        uid: jobUid,
        state: JOB_STATE.RUNNING,
        isHttpsAppRunning: () => true,
        getHttpsAppUrl: () => JOB_URL,
        ...overrides,
      }) as unknown as Job

    beforeEach(() => {
      systemNewAuthTokenStub.withArgs(JOB_URL).resolves(CODE)
      generateCliKeyStub.resolves(KEY)
    })

    it('throws NotFoundError when the job is not found', async () => {
      getAccessibleEntityByUidStub.withArgs(jobUid).resolves(null)
      await expect(getInstance().openExternal(jobUid)).to.be.rejectedWith(NotFoundError, `Job ${jobUid} not found`)
    })

    it('throws InvalidStateError when the job is not in running state', async () => {
      getAccessibleEntityByUidStub
        .withArgs(jobUid)
        .resolves(makeJob({ state: JOB_STATE.TERMINATED } as unknown as Partial<Job>))
      await expect(getInstance().openExternal(jobUid)).to.be.rejectedWith(
        InvalidStateError,
        `Job ${jobUid} is not an active HTTPS workstation`,
      )
    })

    it('throws InvalidStateError when the HTTPS app is not running', async () => {
      getAccessibleEntityByUidStub
        .withArgs(jobUid)
        .resolves(makeJob({ isHttpsAppRunning: () => false } as unknown as Partial<Job>))
      await expect(getInstance().openExternal(jobUid)).to.be.rejectedWith(
        InvalidStateError,
        `Job ${jobUid} is not an active HTTPS workstation`,
      )
    })

    it('throws InvalidStateError when the HTTPS URL cannot be obtained', async () => {
      getAccessibleEntityByUidStub
        .withArgs(jobUid)
        .resolves(makeJob({ getHttpsAppUrl: () => null } as unknown as Partial<Job>))
      await expect(getInstance().openExternal(jobUid)).to.be.rejectedWith(
        InvalidStateError,
        `Cannot obtain HTTPS URL for job ${jobUid}`,
      )
    })

    it('returns the OAuth redirect URL', async () => {
      getAccessibleEntityByUidStub.withArgs(jobUid).resolves(makeJob())

      const result = await getInstance().openExternal(jobUid)

      expect(result).to.equal(`${JOB_URL}/oauth2/access?code=${CODE}`)
    })

    it('calls generateCliKey and setAPIKey in the background with the refresh code and key', async () => {
      getAccessibleEntityByUidStub.withArgs(jobUid).resolves(makeJob())

      await getInstance().openExternal(jobUid)

      expect(generateCliKeyStub.calledOnce).to.be.true()
      expect(setAPIKeyStub.calledOnceWithExactly(jobUid, { code: CODE, key: KEY })).to.be.true()
    })
  })

  context('createWorkstationSnapshotTask', () => {
    it('calls fileSyncQueueJobProducer with correct params', async () => {
      const jobUid = 'job-uid-1' as Uid<'job'>
      const jobUrl = 'url'
      const job = {
        id: 1,
        uid: jobUid,
        state: JOB_STATE.RUNNING,
        isHttpsAppRunning: () => true,
        getHttpsAppUrl: () => jobUrl,
      } as unknown as Job
      getAccessibleEntityByUidStub.withArgs(jobUid).resolves(job)

      const facade = getInstance()
      const data = new JobSnapshotBodyDTO()
      data.name = 'snapshot-name'
      data.terminate = true
      await facade.createWorkstationSnapshotTask(jobUid, data)

      expect(
        createWorkstationSnapshotTaskStub.calledOnceWithExactly({ jobUid, httpsJobExternalUrl: jobUrl, ...data }),
      ).to.be.true()
    })
  })

  context('snapshot', () => {
    const JOB_URL = 'jobUrl'

    beforeEach(() => {
      systemNewAuthTokenStub.withArgs(JOB_URL).resolves(CODE)
      generateCliKeyStub.resolves(KEY)
    })

    it('creates a snapshot and sends a notification', async () => {
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshot'
      const terminate = false
      const res = await getInstance().snapshot(jobUid, JOB_URL, name, terminate)
      await expect(res.statusText).equal('success')

      await expect(
        createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, CODE, KEY, name, terminate, undefined),
      ).to.be.true()
      await expect(createNotificationStub.calledOnce).to.be.true()
      const notificationArgs = createNotificationStub.getCall(0).args[0]
      await expect(notificationArgs).to.include({
        message: `Snapshot created for ${name}`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
        userId: user.id,
        sessionId: user.sessionId,
      })
      await expect(notificationArgs.meta).to.deep.equal({
        linkTitle: 'View Execution',
        linkUrl: `/home/executions/${jobUid}`,
      })
    })

    it('creates a snapshot with termination and sends a notification', async () => {
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshot'
      const terminate = true
      const res = await getInstance().snapshot(jobUid, JOB_URL, name, terminate)
      expect(res.statusText).equal('success')

      expect(
        createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, CODE, KEY, name, terminate, undefined),
      ).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      const notificationArgs = createNotificationStub.getCall(0).args[0]
      expect(notificationArgs).to.include({
        message: `Snapshot created for ${name}. The workstation will now terminate`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
        userId: user.id,
        sessionId: user.sessionId,
      })
      expect(notificationArgs.meta).to.deep.equal({
        linkTitle: 'View Execution',
        linkUrl: `/home/executions/${jobUid}`,
      })
    })

    it('fails gracefully if connectivity to workstation API fails', async () => {
      createWorkstationSnapshotStub.throws(new WorkstationAPIError('Network error'))
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshotWithTerminate'
      const terminate = true

      await expect(getInstance().snapshot(jobUid, JOB_URL, name, terminate)).to.be.rejectedWith(
        WorkstationAPIError,
        'Network error',
      )

      expect(
        createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, CODE, KEY, name, terminate, undefined),
      ).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      const notificationArgs = createNotificationStub.getCall(0).args[0]
      expect(notificationArgs).to.include({
        message: `Error creating snapshot for ${name}: Network error`,
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
        userId: user.id,
        sessionId: user.sessionId,
      })
      expect(notificationArgs.meta).to.deep.equal({
        linkTitle: 'View Execution',
        linkUrl: `/home/executions/${jobUid}`,
      })
    })

    it('fails gracefully if workstation API somehow fails', async () => {
      createWorkstationSnapshotStub.throws(new InternalError('An error has occurred'))
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshotWithTerminate'
      const terminate = true

      await expect(getInstance().snapshot(jobUid, JOB_URL, name, terminate)).to.be.rejectedWith(
        InternalError,
        'An error has occurred',
      )

      expect(
        createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, CODE, KEY, name, terminate, undefined),
      ).to.be.true()
      expect(createNotificationStub.calledOnce).to.be.true()
      const notificationArgs = createNotificationStub.getCall(0).args[0]
      expect(notificationArgs).to.include({
        message: `Error creating snapshot for ${name}: An error has occurred`,
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
        userId: user.id,
        sessionId: user.sessionId,
      })
      expect(notificationArgs.meta).to.deep.equal({
        linkTitle: 'View Execution',
        linkUrl: `/home/executions/${jobUid}`,
      })
    })
  })

  function getInstance(): JobWorkstationFacade {
    return new JobWorkstationFacade(
      user,
      jobService,
      notificationService,
      fileSyncQueueJobProducer,
      platformClient,
      authService,
    )
  }
})
