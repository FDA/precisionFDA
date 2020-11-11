import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { errors } from '@pfda/https-apps-shared'
import supertest from 'supertest'
import { database } from '../../../src/database'
import { api } from '../../../src/server'
import { dropData } from '../../utils/db'
import { User } from '../../../src/users'
import { App } from '../../../src/apps'
import { JOB_STATE } from '../../../src/jobs/domain/job.enum'
import * as create from '../../utils/create'
import * as generate from '../../utils/generate'
import { fakes } from '../../utils/mocks'
import { getDefaultQueryData, stripEntityDates } from '../../utils/expect-helper'

describe('POST /apps/:id/run', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    await dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user })
    await em.flush()
    // handle the stubs
    fakes.client.jobCreateFake.resetHistory()
  })

  it('response shape', async () => {
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runAppInput())
      .expect(201)
    expect(stripEntityDates(body)).to.deep.equal({
      id: 1,
      dxid: generate.job.jobId(),
      userId: user.id,
      project: null,
      state: JOB_STATE.IDLE,
      scope: 'private',
      // provenance: {},
      // describe: {},
      // todo: fix
      runData: { run_instance_type: 'foo', run_inputs: {}, run_outputs: {} },
    })
  })

  it('calls the platform API', async () => {
    await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
  })

  context('error states', () => {
    it('throws 404 when user does not exist', async () => {
      const { body } = await supertest(api.getServer())
        .post(`/apps/${app.dxid}/run`)
        .query({
          ...getDefaultQueryData(user),
          id: user.id + 1,
        })
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.USER_NOT_FOUND)
    })
  })
})
