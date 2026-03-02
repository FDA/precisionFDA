import { expect } from 'chai'
import { stub } from 'sinon'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ErrorCodes } from '@shared/errors'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'

describe('JobWorkstationFacade', () => {
  const createWorkstationSnapshotTaskStub = stub()
  const createWorkstationSnapshotStub = stub()
  const createNotificationStub = stub()

  const user = {
    id: 1,
    sessionId: 'session-id',
  } as unknown as UserContext
  const jobService = {
    createWorkstationSnapshot: createWorkstationSnapshotStub,
  } as unknown as JobService
  const notificationService = {
    createNotification: createNotificationStub,
  } as unknown as NotificationService
  const fileSyncQueueJobProducer = {
    createWorkstationSnapshotTask: createWorkstationSnapshotTaskStub,
  } as unknown as FileSyncQueueJobProducer

  beforeEach(() => {
    createWorkstationSnapshotTaskStub.reset()
    createWorkstationSnapshotTaskStub.resolves(undefined)

    createWorkstationSnapshotStub.reset()
    createWorkstationSnapshotStub.resolves({ result: 'success' })

    createNotificationStub.reset()
    createNotificationStub.resolves(undefined)
  })

  context('createWorkstationSnapshotTask', () => {
    it('calls fileSyncQueueJobProducer with correct params', async () => {
      const facade = getInstance()
      const jobUid = 'job-uid-1' as Uid<'job'>
      const data = new JobSnapshotBodyDTO()
      data.name = 'snapshot-name'
      data.terminate = true
      data.key = 'api-key'
      data.code = 'auth-code'
      await facade.createWorkstationSnapshotTask(jobUid, data)

      expect(createWorkstationSnapshotTaskStub.calledOnceWithExactly({ jobUid, ...data })).to.be.true()
    })
  })

  context('snapshot', () => {
    it('creates a snapshot and sends a notification', async () => {
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshot'
      const terminate = false
      const code = 'code from auth server'
      const key = 'hello key'
      const res = await getInstance().snapshot(jobUid, code, key, name, terminate)
      await expect(res.result).equal('success')

      await expect(createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, code, key, name, terminate)).to.be.true()
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
      const code = 'code from auth server'
      const key = 'hello key'
      const res = await getInstance().snapshot(jobUid, code, key, name, terminate)
      expect(res.result).equal('success')

      expect(createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, code, key, name, terminate)).to.be.true()
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
      createWorkstationSnapshotStub.rejects(new Error('Network error'))
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshotWithTerminate'
      const terminate = true
      const code = 'code from auth server'
      const key = 'hello key'

      const res = await getInstance().snapshot(jobUid, code, key, name, terminate)
      const error = res.error as { code: string; message: string }
      expect(error.code).to.equal(ErrorCodes.WORKSTATION_API_ERROR)
      expect(error.message).to.include(`Error creating snapshot for ${name}`)

      expect(createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, code, key, name, terminate)).to.be.true()
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
      createWorkstationSnapshotStub.resolves({ error: 'An error has occurred' })
      const jobUid = 'job-uid-1' as Uid<'job'>
      const name = 'MySnapshotWithTerminate'
      const terminate = true
      const code = 'code from auth server'
      const key = 'hello key'

      const res = await getInstance().snapshot(jobUid, code, key, name, terminate)
      expect(res.error).to.equal('An error has occurred')

      expect(createWorkstationSnapshotStub.calledOnceWithExactly(jobUid, code, key, name, terminate)).to.be.true()
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
    return new JobWorkstationFacade(user, jobService, notificationService, fileSyncQueueJobProducer)
  }
})
