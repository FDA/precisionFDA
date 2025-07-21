import { SqlEntityManager } from '@mikro-orm/mysql'
import { DxId } from '@shared/domain/entity/domain/dxid'
import * as eventHelper from '@shared/domain/event/event.helper'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobRepository } from '@shared/domain/job/job.repository'
import { ChallengeJobSynchronizationService } from '@shared/domain/job/services/challenge-job-synchronization.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { PlatformClient } from '@shared/platform-client'
import * as queueHelper from '@shared/queue'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('ChallengeJobSynchronizationService', () => {
  const CHALLENGE_BOT_USER_CONTEXT = new UserContext(
    0,
    'challenge-bot-token',
    'challenge-bot-dxuser',
  )

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
  const platformClientJobDescribeStub = stub()
  const platformClientJobTerminateStub = stub()

  em.transactional = stub(em, 'transactional').callsFake(async (callback) => {
    return await callback(em)
  }) as SqlEntityManager['transactional']

  let createJobClosedStub = stub()
  let createSyncOutputsTaskStub = stub()

  const userRepo = {
    findChallengeBot: userRepofindChallengeBotStub,
  } as unknown as UserRepository
  const jobRepo = {
    findRunningJobsByUser: jobRepoFindRunningJobsByUser,
    findOne: jobRepoFindOneStub,
  } as unknown as JobRepository
  const platformClient = {
    jobDescribe: platformClientJobDescribeStub,
    jobTerminate: platformClientJobTerminateStub,
  } as unknown as PlatformClient

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

    platformClientJobDescribeStub.reset()
    platformClientJobDescribeStub.throws()

    emPersistStub.reset()
    emPersistStub.throws()

    emGetRepositoryStub.reset()
    emGetRepositoryStub.throws()
  })

  afterEach(() => {
    createJobClosedStub.restore()
    createSyncOutputsTaskStub.restore()
  })

  function getInstance(): ChallengeJobSynchronizationService {
    return new ChallengeJobSynchronizationService(
      em,
      userRepo,
      jobRepo,
      platformClient,
      CHALLENGE_BOT_USER_CONTEXT,
    )
  }

  const challengeBotUser = {
    id: 1000,
  } as unknown as User

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
      platformClientJobDescribeStub.withArgs({ jobId: job.dxid }).resolves(platformData)
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
      platformClientJobDescribeStub.withArgs({ jobId: job.dxid }).resolves(platformData)

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
      platformClientJobDescribeStub.withArgs({ jobId: job.dxid }).resolves(platformData)
      emFlushStub.reset()

      // these are only because we still use RequestTerminateJobOperation
      emGetRepositoryStub.withArgs(Job).returns(jobRepo)
      jobRepoFindOneStub.withArgs({ dxid: job.dxid as DxId<'job'> }).resolves(job)
      platformClientJobTerminateStub.withArgs({ jobId: job.dxid }).resolves({})

      const service = getInstance()
      await service.checkChallengeJobs()

      expect(job.state).to.eq(JOB_STATE.TERMINATING)
      expect(emFlushStub.calledOnce).to.be.true()
    })
  })
})
