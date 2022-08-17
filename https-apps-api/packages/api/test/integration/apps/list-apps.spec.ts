import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { database } from '@pfda/https-apps-shared'
import supertest from 'supertest'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import { APP_HTTPS_SUBTYPE, APP_TYPE } from '@pfda/https-apps-shared/src/domain/app/app.enum'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { getServer } from '../../../src/server'
import { mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { getDefaultQueryData, stripEntityDates } from '../../utils/expect-helper'

describe.skip('GET /apps', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user })
    await em.flush()
    // handle the stubs
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(getServer())
      .get('/apps')
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(stripEntityDates(body[0])).to.deep.equal({
      id: app.id,
      type: APP_TYPE.HTTPS,
      httpsSubtype: APP_HTTPS_SUBTYPE.JUPYTER,
      dxid: app.dxid,
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
      release: app.release,
      userId: user.id,
    })
  })

  it('returns only apps of given user', async () => {
    const anotherUser = create.userHelper.create(em)
    const anotherApp = create.appHelper.createHTTPS(em, { user: anotherUser })
    await em.flush()

    const { body } = await supertest(getServer())
      .get('/apps')
      .query({ ...getDefaultQueryData(anotherUser) })
      .expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(body[0]).to.have.property('id', anotherApp.id)
  })
})
