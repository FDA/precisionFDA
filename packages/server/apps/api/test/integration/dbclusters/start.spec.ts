import { database } from '@shared/database'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { create, generate, db } from '@shared/test'
import {
  STATUS as DB_CLUSTER_STATUS,
  STATUSES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('POST /dbclusters/start', () => {
  let em: EntityManager
  let user: User
  let dbClusters: Array<DbCluster>
  let dxids: Array<string>

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    dbClusters = [
      create.dbClusterHelper.create(em, { user }, { status: DB_CLUSTER_STATUS.STOPPED }),
      create.dbClusterHelper.create(em, { user }, { status: DB_CLUSTER_STATUS.STOPPED }),
    ]
    dxids = dbClusters.map(dbCluster => dbCluster.dxid)
    await em.flush()
    mocksReset()
  })

  it('responds with success', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/dbclusters/start`)
      .set(getDefaultHeaderData(user))
      .send({ dxids: dxids })
      .expect(204)

    expect(fakes.client.dbClusterActionFake.calledTwice).to.be.true()

    const fakeCalls = fakes.client.dbClusterActionFake.getCalls()

    expect([fakeCalls[0].args[0]['dxid'], fakeCalls[1].args[0]['dxid']]).to.have.members(dxids)
    expect(fakeCalls[0].args[1]).to.be.equal('start')
    expect(fakeCalls[1].args[1]).to.be.equal('start')
  })

  it('saves new status in the database', async () => {
    const dxid = dxids[0]
    const describeCallRes = { status: STATUSES.STARTING, id: dxid }
    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/dbclusters/start`)
      .set(getDefaultHeaderData(user))
      .send({ dxids: [dxid] })
      .expect(204)

    expect(fakes.client.dbClusterActionFake.calledOnce).to.be.true()
    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const updated = await afterEm.findOne(DbCluster, { dxid: dxid })
    expect(updated.status).to.be.equal(DB_CLUSTER_STATUS.STARTING)
  })

  context('error states', () => {
    it('throws error when the dbcluster does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/dbclusters/start`)
        .set(getDefaultHeaderData(user))
        .send({ dxids: [dxids[0], `dbcluster-${generate.random.dxstr()}`] })
        .expect(404)

      expect(body.error).to.have.property('code', ErrorCodes.DB_CLUSTER_NOT_FOUND)
    })

    it('throws error when the dbcluster status is not stopped', async () => {
      dbClusters[0].status = DB_CLUSTER_STATUS.AVAILABLE
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/dbclusters/start`)
        .set(getDefaultHeaderData(user))
        .send({ dxids: dxids })
        .expect(400)

      expect(body.error).to.have.property('code', ErrorCodes.DB_CLUSTER_STATUS_MISMATCH)
    })
  })
})
