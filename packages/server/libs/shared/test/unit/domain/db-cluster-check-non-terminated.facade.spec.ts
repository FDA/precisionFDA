import { EntityManager } from '@mikro-orm/mysql'
import { STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterRepository } from '@shared/domain/db-cluster/db-cluster.repository'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { DbClusterCheckNonTerminatedFacade } from 'apps/api/src/facade/db-cluster/check-non-terminated-facade/db-cluster-check-non-terminated.facade'
import { expect } from 'chai'
import { match, stub } from 'sinon'
import * as queue from '@shared/queue'
import { config } from '@shared/config'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'

describe('DbClusterCheckNonTerminatedFacade', () => {
  const USER_ID = 0
  const getEntityStub = stub()
  const USER = {
    id: USER_ID,
    dxuser: 'user',
    getEntity: getEntityStub,
  }

  const loadEntity = stub()
  const userContext: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity,
  }

  let getMainQueueStub

  const createSendEmailTaskStub = stub()
  const findStub = stub()
  const getJobStub = stub()
  const elapsedTimeSinceCreationStringStub = stub()

  beforeEach(async () => {
    createSendEmailTaskStub.reset()
    createSendEmailTaskStub.throws()

    getMainQueueStub = stub(queue, 'getMainQueue')
    getMainQueueStub.reset()
    getMainQueueStub.throws()

    findStub.reset()
    findStub.throws()

    getJobStub.reset()
    getJobStub.throws()

    getEntityStub.reset()
    getEntityStub.throws()

    elapsedTimeSinceCreationStringStub.reset()
    elapsedTimeSinceCreationStringStub.throws()
  })

  afterEach(async () => {
    getMainQueueStub.restore()
  })

  it('Check for non-terminated clusters', async () => {
    const dbClusters = [
      {
        dxid: 'dbcluster-xxx1',
        name: 'db-cluster-1',
        uid: 'dbcluster-xxx1-1',
        status: STATUS.STOPPED,
        scope: 'private',
        user: USER,
        dxInstanceClass: 'std_1',
        elapsedTimeSinceCreationString: elapsedTimeSinceCreationStringStub,
      },
      {
        dxid: 'dbcluster-xxx2',
        name: 'db-cluster-2',
        uid: 'dbcluster-xxx2-2',
        status: STATUS.AVAILABLE,
        scope: 'space-2',
        user: USER,
        dxInstanceClass: 'std_1',
        elapsedTimeSinceCreationString: elapsedTimeSinceCreationStringStub,
      },
      {
        dxid: 'dbcluster-xxx3',
        name: 'db-cluster-3',
        uid: 'dbcluster-xxx3-3',
        status: STATUS.CREATING,
        scope: 'space-2',
        user: USER,
        dxInstanceClass: 'std_1',
        elapsedTimeSinceCreationString: elapsedTimeSinceCreationStringStub,
      },
    ]

    findStub.withArgs({}, match({ filters: ['isNonTerminal'] })).resolves(dbClusters)

    getMainQueueStub.returns({
      getJob: getJobStub,
    })

    getJobStub.withArgs('sync_dbcluster_status.dbcluster-xxx1').resolves({})
    getJobStub.withArgs('sync_dbcluster_status.dbcluster-xxx2').resolves({})
    getJobStub.withArgs('sync_dbcluster_status.dbcluster-xxx3').resolves({})

    getEntityStub.returns(USER)
    elapsedTimeSinceCreationStringStub.returns('10')

    createSendEmailTaskStub.withArgs(match({ to: config.emails.report })).resolves({})

    const result = await getInstance().checkNonTerminatedDbClusters()

    expect(result.length).to.eq(3)
    expect(createSendEmailTaskStub.callCount).to.equal(1)
    expect(createSendEmailTaskStub.getCall(0).args[0].emailType).to.equal(
      EMAIL_TYPES.nonTerminatedDbClusters,
    )
    expect(createSendEmailTaskStub.getCall(0).args[0].to).to.equal(config.emails.report)
    expect(createSendEmailTaskStub.getCall(0).args[0].subject).to.equal('Non-terminated dbclusters')

    const nonTerminatedIndexes = [0, 1, 2]
    nonTerminatedIndexes.forEach((index) => {
      expect(result.find((r) => r.dxid === dbClusters[index].dxid)).to.not.be.undefined()
    })

    // check first and second call to createSendEmailTask
    nonTerminatedIndexes.forEach((index) => {
      expect(createSendEmailTaskStub.getCall(0).args[0].body).to.contain(dbClusters[index].dxid)
    })
  })

  function getInstance(): DbClusterCheckNonTerminatedFacade {
    const em = {} as unknown as EntityManager
    const dbClusterRepo = {
      find: findStub,
    } as unknown as DbClusterRepository
    const notificationService = {} as unknown as NotificationService
    const dbClusterService = new DbClusterService(
      em,
      dbClusterRepo,
      userContext,
      notificationService,
    )
    const emailsJobProducer = {
      createSendEmailTask: createSendEmailTaskStub,
    } as unknown as EmailQueueJobProducer

    return new DbClusterCheckNonTerminatedFacade(dbClusterService, emailsJobProducer)
  }
})
