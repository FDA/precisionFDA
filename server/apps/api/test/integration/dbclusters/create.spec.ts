import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { omit, pick, invertObj } from 'ramda'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { create, generate, db, mockResponses } from '@shared/test'
import {
  STATUS as DB_CLUSTER_STATUS,
  ENGINE as DB_CLUSTER_ENGINE,
  STATUSES,
  ENGINES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('POST /dbclusters/create', () => {
  let em: EntityManager
  let user: User
  let dxid: string

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    dxid = `dbcluster-${generate.random.dxstr()}`
    await em.flush()
    mocksReset()
  })

  it('responds with db cluster shape', async () => {
    const createInput = { ...generate.dbCluster.createInput(), project: user.privateFilesProject }
    const describeCallRes = {
      ...omit(['endpoint', 'port'], mockResponses.DBCLUSTER_DESC_RES),
      ...pick(['project', 'name', 'dxInstanceClass', 'engine', 'engineVersion'], createInput),
      id: dxid,
    }

    fakes.client.dbClusterCreateFake.onCall(0).returns({ id: dxid })
    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/dbclusters/create`)
      .set(getDefaultHeaderData(user))
      .send(createInput)
      .expect(201)

    expect(body).to.have.property('id')
    expect(body).to.include({
      dxid: dxid,
      uid: `${dxid}-1`,
      name: createInput.name,
      scope: createInput.scope,
      description: createInput.description,
      project: describeCallRes.project,
      statusAsOf: new Date(describeCallRes.statusAsOf).toJSON(),
      status: DB_CLUSTER_STATUS[invertObj(STATUSES)[describeCallRes.status]],
      engine: DB_CLUSTER_ENGINE[invertObj(ENGINES)[describeCallRes.engine]],
      engineVersion: describeCallRes.engineVersion,
      dxInstanceClass: describeCallRes.dxInstanceClass,
    })
    expect(body.user).to.include({
      id: user.id,
    })
  })

  it('calls the platform API', async () => {
    const createInput = { ...generate.dbCluster.createInput(), project: user.privateFilesProject }

    fakes.client.dbClusterCreateFake.onCall(0).returns({ id: dxid })
    const userHeaderData = getDefaultHeaderData(user)

    await supertest(testedApp.getHttpServer())
      .post('/dbclusters/create')
      .set(userHeaderData)
      .send(createInput)
      .expect(201)

    const fakeCreateCallArgs = fakes.client.dbClusterCreateFake.getCall(0).args[0]
    const fakeDescribeCallArgs = fakes.client.dbClusterDescribeFake.getCall(0).args[0]

    expect(fakes.client.dbClusterCreateFake.calledOnce).to.be.true()
    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    expect(fakeCreateCallArgs).to.deep.equal({
      name: createInput.name,
      project: createInput.project,
      engine: createInput.engine,
      engineVersion: createInput.engineVersion,
      dxInstanceClass: createInput.dxInstanceClass,
      adminPassword: createInput.adminPassword,
    })

    expect(fakeDescribeCallArgs).to.deep.equal({
      dxid: dxid,
      project: createInput.project,
    })
  })

  it('creates status sync task in a queue', async () => {
    const userHeaderData = getDefaultHeaderData(user)

    const describeCallRes = { ...mockResponses.DBCLUSTER_DESC_RES, id: dxid }
    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    const args = []
    fakes.queue.createDbClusterSyncTaskFake.callsFake((...a) => {
      a[1] = a[1].toJSON()
      args.push(a)
    })

    await supertest(testedApp.getHttpServer())
      .post('/dbclusters/create')
      .set(userHeaderData)
      .send(generate.dbCluster.createInput())
      .expect(201)

    expect(fakes.queue.createDbClusterSyncTaskFake.calledOnce).to.be.true()
    const fakeCreateStatusSyncArgs = args[0]

    expect(fakeCreateStatusSyncArgs).to.deep.equal([
      { dxid: dxid },
      {
        id: user.id,
        accessToken: userHeaderData[USER_CONTEXT_HTTP_HEADERS.accessToken],
        dxuser: user.dxuser,
      }
    ])
  })
})
