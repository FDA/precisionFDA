import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { errors, database } from '@pfda/https-apps-shared'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { DbCluster, User } from '@pfda/https-apps-shared/src/domain'
import {
  STATUS as DB_CLUSTER_STATUS,
  ENGINE as DB_CLUSTER_ENGINE,
  STATUSES,
} from '@pfda/https-apps-shared/src/domain/db-cluster/db-cluster.enum'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'

describe('POST /dbclusters/terminate', () => {
  let em: EntityManager
  let user: User
  let dbClusters: Array<DbCluster>
  let dxids: Array<string>

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    dbClusters = [
      create.dbClusterHelper.create(em, { user }),
      create.dbClusterHelper.create(em, { user }),
    ]
    dxids = dbClusters.map(dbCluster => dbCluster.dxid)
    await em.flush()
    mocksReset()
  })

  it('responds with success', async () => {
    const { body } = await supertest(getServer())
      .post('/dbclusters/terminate')
      .query({ ...getDefaultQueryData(user) })
      .send({ dxids: dxids })
      .expect(204)

    expect(fakes.client.dbClusterActionFake.calledTwice).to.be.true()

    const fakeCalls = fakes.client.dbClusterActionFake.getCalls()

    expect([fakeCalls[0].args[0]['dxid'], fakeCalls[1].args[0]['dxid']]).to.have.members(dxids)
    expect(fakeCalls[0].args[1]).to.be.equal('terminate')
    expect(fakeCalls[1].args[1]).to.be.equal('terminate')
  })

  it('saves new status in the database', async () => {
    const dxid = dxids[0]
    const describeCallRes = { status: STATUSES.TERMINATING, id: dxid }
    fakes.client.dbClusterDescribeFake.onCall(0).returns(describeCallRes)

    const { body } = await supertest(getServer())
      .post(`/dbclusters/terminate`)
      .query({ ...getDefaultQueryData(user) })
      .send({ dxids: [dxid] })
      .expect(204)

    expect(fakes.client.dbClusterActionFake.calledOnce).to.be.true()
    expect(fakes.client.dbClusterDescribeFake.calledOnce).to.be.true()

    const afterEm = em.fork()
    const updated = await afterEm.findOne(DbCluster, { dxid: dxid })
    expect(updated.status).to.be.equal(DB_CLUSTER_STATUS.TERMINATING)
  })

  context('error states', () => {
    it('throws error when the dbcluster does not exist', async () => {
      const { body } = await supertest(getServer())
        .post('/dbclusters/terminate')
        .query({ ...getDefaultQueryData(user) })
        .send({ dxids: [dxids[0], `dbcluster-${generate.random.dxstr()}`] })
        .expect(404)

      expect(body.error).to.have.property('code', errors.ErrorCodes.DB_CLUSTER_NOT_FOUND)
    })

    it('throws error when the dbcluster status is not available', async () => {
      dbClusters[0].status = DB_CLUSTER_STATUS.STOPPED
      await em.flush()

      const { body } = await supertest(getServer())
        .post('/dbclusters/terminate')
        .query({ ...getDefaultQueryData(user) })
        .send({ dxids: dxids })
        .expect(400)

      expect(body.error).to.have.property('code', errors.ErrorCodes.DB_CLUSTER_STATUS_MISMATCH)
    })
  })
})
