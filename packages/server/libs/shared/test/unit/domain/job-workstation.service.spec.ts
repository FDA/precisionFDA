import { SqlEntityManager } from '@mikro-orm/mysql'
import { AxiosInstance } from 'axios'
import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobRepository } from '@shared/domain/job/job.repository'
import { JobWorkstationService } from '@shared/domain/job/services/job-workstation.service'
import { WorkstationClient } from '@shared/domain/job/services/workstation-client/workstation-client'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { InvalidStateError, JobNotFoundError } from '@shared/errors'
import { create, db } from '@shared/test'
import { spacesHelper } from '@shared/test/create'
import { fakes } from '@shared/test/mocks'

describe('JobWorkstationService', () => {
  let em: SqlEntityManager
  let user: User
  let jobRepository: JobRepository
  let userCtx: UserContext
  let workstationApp: App
  let groupSpace: Space

  const aliveStub = stub()
  const oauthAccessStub = stub()
  const setAPIKeyStub = stub()
  const setPFDAConfigStub = stub()
  const snapshotStub = stub()
  const workstationClient = {
    alive: aliveStub,
    setPFDAConfig: setPFDAConfigStub,
    setAPIKey: setAPIKeyStub,
    snapshot: snapshotStub,
    oauthAccess: oauthAccessStub,
  } as unknown as WorkstationClient
  const workstationClientFactory = (_: string, __: AxiosInstance): WorkstationClient => workstationClient

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    jobRepository = em.getRepository(Job)

    aliveStub.reset()
    aliveStub.resolves({ status: 'ok' })
    oauthAccessStub.reset()
    oauthAccessStub.resolves()
    setPFDAConfigStub.reset()
    setPFDAConfigStub.resolves({ message: 'pFDA config updated' })
    setAPIKeyStub.reset()
    setAPIKeyStub.resolves({ message: 'pFDA key updated' })
    snapshotStub.reset()
    snapshotStub.resolves({ message: 'Snapshot created successfully' })

    user = create.userHelper.create(em)
    create.sessionHelper.create(em, { user })
    groupSpace = create.spacesHelper.create(em, { name: 'Test Space', type: SPACE_TYPE.GROUPS })
    await em.flush()

    spacesHelper.addMember(em, { space: groupSpace, user }, { role: SPACE_MEMBERSHIP_ROLE.ADMIN })
    workstationApp = create.appHelper.createWorkstation(em, { user })
    await em.flush()

    userCtx = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
      sessionId: 'sessionId',
      loadEntity: () => Promise.resolve(user),
    } as UserContext
  })

  context('alive', () => {
    it('should throw error if job does not exist', async () => {
      await executeTest(async () => {
        await expect(getInstance().alive('nonexistent-uid' as Uid<'job'>, 'authToken')).to.be.rejectedWith(
          JobNotFoundError,
          '',
        )
      })
    })

    it('should throw error if job is not accessible by user', async () => {
      const otherUser = create.userHelper.create(em, { email: 'other@example.com' })
      create.sessionHelper.create(em, { user: otherUser })
      const job = create.jobHelper.create(em, { user: otherUser, app: workstationApp }, { state: JOB_STATE.RUNNING })
      await em.flush()

      await executeTest(async () => {
        await expect(getInstance().alive(job.uid, 'authToken')).to.be.rejectedWith(JobNotFoundError, '')
      })
    })

    it('should throw error if job is not https', async () => {
      const app = create.appHelper.createRegular(em, { user }, {})
      const job = create.jobHelper.create(em, { user, app }, { state: JOB_STATE.RUNNING })
      await em.flush()

      await executeTest(async () => {
        await expect(getInstance().alive(job.uid, 'authToken')).to.be.rejectedWith(InvalidStateError, '')
      })
    })

    it('should throw error if job is not running', async () => {
      const job = create.jobHelper.create(em, { user, app: workstationApp }, { state: JOB_STATE.TERMINATED })
      await em.flush()

      await executeTest(async () => {
        await expect(getInstance().alive(job.uid, 'authToken')).to.be.rejectedWith(InvalidStateError, '')
      })
    })

    it('return client alive status', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app: workstationApp },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS },
      )
      await em.flush()

      await executeTest(async () => {
        const res = await getInstance().alive(job.uid, 'authToken')
        expect(res).to.deep.equal({ status: 'ok' })
        expect(aliveStub.calledOnce).to.be.true()
      })
    })
  })

  context('setAPIKey', () => {
    it('sets API key on workstation client if API version is less than 1.1', async () => {
      const oldWorkstation = create.appHelper.createWorkstation(
        em,
        { user },
        { internal: { platform_tags: ['pfda_workstation_api:1.0'], packages: [], code: '' } },
      )
      const job = create.jobHelper.create(
        em,
        { user, app: oldWorkstation },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS },
      )
      await em.flush()

      const cliKey = 'test-cli-key'
      await executeTest(async () => {
        await getInstance().setAPIKey(job.uid, 'authToken', cliKey)
        expect(setAPIKeyStub.calledOnceWithExactly(cliKey)).to.be.true()
      })
    })

    it('sets PFDA config on workstation client if API version is 1.1 or above', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app: workstationApp },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS },
      )
      await em.flush()

      const cliKey = 'test-cli-key'
      await executeTest(async () => {
        await getInstance().setAPIKey(job.uid, 'authToken', cliKey)
        expect(setPFDAConfigStub.calledOnce).to.be.true()
        const cliConfig = setPFDAConfigStub.firstCall.args[0]
        expect(cliConfig.Key).to.equal(cliKey)
        expect(cliConfig.Server).to.equal(config.api.railsHost.replace(/^https?:\/\//, ''))
      })
    })

    it('includes scope in PFDA config if job is in a space', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app: workstationApp },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS, scope: `space-${groupSpace.id}` },
      )
      await em.flush()

      const cliKey = 'test-cli-key'
      await executeTest(async () => {
        await getInstance().setAPIKey(job.uid, 'authToken', cliKey)
        expect(setPFDAConfigStub.calledOnce).to.be.true()
        const cliConfig = setPFDAConfigStub.firstCall.args[0]
        expect(cliConfig.Scope).to.equal(job.scope)
      })
    })
  })

  context('snapshot', () => {
    it('should create snapshot with given name and terminate flag', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app: workstationApp },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS },
      )
      await em.flush()

      const snapshotName = 'Test Snapshot'
      const cliKey = 'test-cli-key'
      const terminate = true
      await executeTest(async () => {
        await getInstance().snapshot(job.uid, 'authToken', cliKey, snapshotName, terminate)
        expect(snapshotStub.calledOnceWithExactly({ name: snapshotName, terminate, preScript: undefined })).to.be.true()
      })
    })

    it('should create snapshot with given name, terminate flag, and preScript', async () => {
      const job = create.jobHelper.create(
        em,
        { user, app: workstationApp },
        { state: JOB_STATE.RUNNING, entityType: ENTITY_TYPE.HTTPS },
      )
      await em.flush()

      const snapshotName = 'Test Snapshot With Script'
      const cliKey = 'test-cli-key'
      const terminate = false
      const preScript = 'echo hello'
      await executeTest(async () => {
        await getInstance().snapshot(job.uid, 'authToken', cliKey, snapshotName, terminate, preScript)
        expect(snapshotStub.calledOnceWithExactly({ name: snapshotName, terminate, preScript })).to.be.true()
      })
    })
  })

  async function executeTest(func: () => void): Promise<void> {
    await userContextStorage.run(userCtx, async () => {
      await func()
    })
  }

  function getInstance(): JobWorkstationService {
    return new JobWorkstationService(jobRepository, workstationClientFactory)
  }
})
