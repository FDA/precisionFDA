import { expect } from 'chai'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { stub } from 'sinon'
import * as eventHelper from '@shared/domain/event/event.helper'
import * as queueHelper from '@shared/queue'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { JobRepository } from '@shared/domain/job/job.repository'
import { PlatformClient } from '@shared/platform-client'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { User } from '@shared/domain/user/user.entity'
import { fakes } from '@shared/test/mocks'
import { Job as BullJob } from 'bull'

describe('JobSynchronizationService', () => {
  const user = {
    id: 1,
  } as unknown as User
  const USER_CONTEXT = {
    id: 1,
    dxuser: 'test-user',
    accessToken: 'test-accessToken',
    loadEntity: async () => user,
  } as UserContext

  const challengeBotUser = {
    id: 2,
  } as unknown as User

  const challengeBotUserContext = {
    id: 2,
    dxuser: 'challenge-bot-dxuser',
    accessToken: 'challenge-bot-access-token',
    loadEntity: async () => challengeBotUser,
  } as UserContext

  const emPersistStub = stub()
  const emGetRepositoryStub = stub()
  const emFlushStub = stub()
  const em = {
    persist: emPersistStub,
    getRepository: emGetRepositoryStub,
    flush: emFlushStub,
    transactional: async <T>(callback: (em: SqlEntityManager) => Promise<T>): Promise<T> => {
      return callback(em as SqlEntityManager)
    },
  } as unknown as SqlEntityManager

  const userRepofindChallengeBotStub = stub()
  const jobRepoFindRunningJobsByUser = stub()
  const jobRepoFindOneStub = stub()
  const jobRepoFindEditableOne = stub()
  const platformClientJobDescribeStub = stub()
  const platformClientJobTerminateStub = stub()
  const challengePlatformClientJobTerminateStub = stub()
  const challengePlatformClientJobDescribeStub = stub()
  const createNotificationStub = stub()

  let createJobClosedStub = stub()
  let createSyncOutputsTaskStub = stub()

  beforeEach(() => {
    createJobClosedStub = stub(eventHelper, 'createJobClosed')
    createSyncOutputsTaskStub = stub(queueHelper, 'createSyncOutputsTask')

    createJobClosedStub.reset()
    createJobClosedStub.throws()

    createSyncOutputsTaskStub.reset()
    createSyncOutputsTaskStub.throws()

    userRepofindChallengeBotStub.reset()
    userRepofindChallengeBotStub.throws()

    jobRepoFindRunningJobsByUser.reset()
    jobRepoFindRunningJobsByUser.throws()

    jobRepoFindOneStub.reset()
    jobRepoFindOneStub.throws()

    jobRepoFindEditableOne.reset()
    jobRepoFindEditableOne.throws()

    platformClientJobDescribeStub.reset()
    platformClientJobDescribeStub.throws()

    challengePlatformClientJobDescribeStub.reset()
    challengePlatformClientJobDescribeStub.throws()

    challengePlatformClientJobTerminateStub.reset()
    challengePlatformClientJobTerminateStub.throws()

    platformClientJobTerminateStub.reset()
    platformClientJobTerminateStub.throws()

    emPersistStub.reset()
    emPersistStub.throws()

    emGetRepositoryStub.reset()
    emGetRepositoryStub.throws()
  })

  afterEach(() => {
    createJobClosedStub.restore()
    createSyncOutputsTaskStub.restore()
  })

  function getInstance(): JobSynchronizationService {
    const notificationService = {
      createNotification: createNotificationStub,
    } as unknown as NotificationService

    const jobRepo = {
      findRunningJobsByUser: jobRepoFindRunningJobsByUser,
      findEditableOne: jobRepoFindEditableOne,
      findOne: jobRepoFindOneStub,
    } as unknown as JobRepository
    const platformClient = {
      jobDescribe: platformClientJobDescribeStub,
      jobTerminate: platformClientJobTerminateStub,
    } as unknown as PlatformClient

    const challengePlatformClient = {
      jobDescribe: challengePlatformClientJobDescribeStub,
      jobTerminate: challengePlatformClientJobTerminateStub,
    } as unknown as PlatformClient

    return new JobSynchronizationService(
      em,
      USER_CONTEXT,
      notificationService,
      jobRepo,
      platformClient,
      challengePlatformClient,
      challengeBotUserContext,
    )
  }

  describe('#checkChallengeJobs', async () => {
    it('job done', async () => {
      const job = {
        dxid: 'job-123',
      } as unknown as Job
      const platformData = {
        state: JOB_STATE.DONE,
      }
      const eventEntity = {
        name: 'event-entity',
      }

      userRepofindChallengeBotStub.resolves(challengeBotUser)
      jobRepoFindRunningJobsByUser.withArgs({ userId: challengeBotUser.id }).resolves([job])
      challengePlatformClientJobDescribeStub.withArgs({ jobDxId: job.dxid }).resolves(platformData)
      createJobClosedStub.withArgs(challengeBotUser, job, platformData).resolves(eventEntity)
      emPersistStub.reset()
      createSyncOutputsTaskStub.reset()

      const service = getInstance()
      await service.checkChallengeJobs()

      expect(job.describe).to.deep.eq(platformData)
      expect(job.state).to.deep.eq(platformData.state)
      expect(emPersistStub.firstCall.firstArg).to.deep.eq(eventEntity)
    })

    it('job not done', async () => {
      const job = {
        dxid: 'job-123',
      } as unknown as Job
      const platformData = {
        state: JOB_STATE.RUNNABLE,
      }

      userRepofindChallengeBotStub.resolves(challengeBotUser)
      jobRepoFindRunningJobsByUser.withArgs({ userId: challengeBotUser.id }).resolves([job])
      challengePlatformClientJobDescribeStub.withArgs({ jobDxId: job.dxid }).resolves(platformData)

      const service = getInstance()
      await service.checkChallengeJobs()

      expect(job.describe).to.deep.eq(platformData)
      expect(job.state).to.deep.eq(platformData.state)
    })

    it('terminate job with max duration over', async () => {
      const job = {
        dxid: 'job-123',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
        state: JOB_STATE.RUNNING,
      } as unknown as Job

      const platformData = {
        state: JOB_STATE.RUNNING,
      }

      userRepofindChallengeBotStub.resolves(challengeBotUser)
      jobRepoFindRunningJobsByUser.withArgs({ userId: challengeBotUser.id }).resolves([job])
      jobRepoFindOneStub.withArgs({ jobDxId: job.dxid, user: challengeBotUser.id }).resolves(job)
      challengePlatformClientJobDescribeStub.withArgs({ jobDxId: job.dxid }).resolves(platformData)
      emFlushStub.reset()

      // these are only because we still use RequestTerminateJobOperation
      // emGetRepositoryStub.withArgs(Job).returns(jobRepo)
      jobRepoFindOneStub.withArgs({ dxid: job.dxid, user: challengeBotUser.id }).resolves(job)
      jobRepoFindOneStub.withArgs({ dxid: job.dxid as DxId<'job'> }).resolves(job)
      challengePlatformClientJobTerminateStub.withArgs({ jobId: job.dxid }).resolves({})

      const service = getInstance()
      await service.checkChallengeJobs()

      expect(job.state).to.eq(JOB_STATE.TERMINATING)
      expect(emFlushStub.calledOnce).to.be.true()
    })
  })

  describe('#requestTerminateJob', async () => {
    it('terminate job successfully', async () => {
      const job = {
        dxid: 'job-123',
        state: JOB_STATE.RUNNING,
      } as unknown as Job

      jobRepoFindEditableOne.withArgs({ dxid: job.dxid as DxId<'job'> }).resolves(job)
      platformClientJobTerminateStub.withArgs({ jobId: job.dxid }).resolves({})

      const service = getInstance()
      await service.requestTerminateJob(job.dxid)
      expect(platformClientJobTerminateStub.calledOnce).to.be.true
    })

    it('throw error when job is not editable', async () => {
      const jobDxid = 'job-123'

      jobRepoFindEditableOne.withArgs({ dxid: jobDxid as DxId<'job'> }).resolves(undefined)

      const service = getInstance()
      try {
        await service.requestTerminateJob(jobDxid)
        expect.fail('should throw error')
      } catch (err) {
        expect(err.name).to.equal('JobNotFoundError')
        expect(err.message).to.equal('Error: Job entity not found')
      }
    })

    it('throw error when job is already in terminal state', async () => {
      const job = {
        dxid: 'job-123',
        state: JOB_STATE.DONE,
      } as unknown as Job

      jobRepoFindEditableOne.withArgs({ dxid: job.dxid as DxId<'job'> }).resolves(job)

      const service = getInstance()
      try {
        await service.requestTerminateJob(job.dxid)
        expect.fail('should throw error')
      } catch (err) {
        expect(err.name).to.equal('InvalidStateError')
        expect(err.message).to.equal(`Job is already terminating or terminated`)
      }
    })
  })

  describe('BullJobId', () => {
    it('creates correct bullJob ids', async () => {
      const jobDxid = 'job-1234567'
      const bullJobId = JobSynchronizationService.getBullJobId(jobDxid)
      expect(bullJobId).to.equal('sync_job_status.job-1234567')
    })

    it('parses bullJob ids correctly', async () => {
      const bullJobId = 'sync_job_status.job-G9jb79Q0qp9yX9G51fykB5VP'
      const jobDxid = JobSynchronizationService.getJobDxidFromBullJobId(bullJobId)
      expect(jobDxid).to.equal('job-G9jb79Q0qp9yX9G51fykB5VP')
    })
  })

  describe('#synchronizeJob', async () => {
    it('remove repeatable when job does not exist ', async () => {
      const job = {
        dxid: 'job-123',
      } as unknown as Job
      const instance = getInstance()

      const bullJob = {} as BullJob

      jobRepoFindOneStub
        .withArgs({ dxid: job.dxid as DxId<'job'> }, { populate: ['app'] })
        .resolves(undefined)
      await instance.synchronizeJob(job.dxid, bullJob)

      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true
    })

    it('removes repeatable and email jobs when job is in terminal state', async () => {
      const job = {
        dxid: 'job-123',
        state: JOB_STATE.DONE,
      } as unknown as Job
      const instance = getInstance()

      const bullJob = {} as BullJob
      jobRepoFindOneStub
        .withArgs({ dxid: job.dxid as DxId<'job'> }, { populate: ['app'] })
        .resolves(job)
      await instance.synchronizeJob(job.dxid, bullJob)
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true
    })

    it('does not remove repeatable when job is not in terminal state', async () => {
      const job = {
        dxid: 'job-123',
        state: JOB_STATE.RUNNING,
        hasHttpsAppState: () => false,
        isHttpsAppRunning: () => false,
        createdAt: new Date(),
      } as unknown as Job
      const instance = getInstance()

      const bullJob = {} as BullJob
      jobRepoFindOneStub
        .withArgs({ dxid: job.dxid as DxId<'job'> }, { populate: ['app'] })
        .resolves(job)
      platformClientJobDescribeStub
        .withArgs({ jobDxId: job.dxid })
        .resolves({ state: JOB_STATE.RUNNING })
      await instance.synchronizeJob(job.dxid, bullJob)
      expect(fakes.queue.removeRepeatableFake.notCalled).to.be.true
    })
  })
})
