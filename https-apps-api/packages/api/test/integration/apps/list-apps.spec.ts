import { expect } from 'chai'
import { repeat } from 'ramda'
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
import { APP_HTTPS_SUBTYPE, APP_TYPE } from 'api/src/apps/domain/app.enum'

describe('GET /apps', () => {
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
      .get('/apps')
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(stripEntityDates(body[0])).to.deep.equal({
      id: app.id,
      type: APP_TYPE.HTTPS,
      httpsSubtype: APP_HTTPS_SUBTYPE.JUPYTER,
      dxid: null,
      version: null,
      revision: null,
      title: null,
      readme: null,
      scope: null,
      spec: null,
      internal: null,
      verified: false,
      uid: null,
      devGroup: null,
      release: '',
      userId: user.id,
    })
  })

  it('returns only apps of given user', async () => {
    const anotherUser = create.userHelper.create(em)
    const anotherApp = create.appHelper.create(em, { user: anotherUser })
    await em.flush()

    const { body } = await supertest(api.getServer())
      .get('/apps')
      .query({ ...getDefaultQueryData(anotherUser) })
      .expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(body[0]).to.have.property('id', anotherApp.id)
  })
})
