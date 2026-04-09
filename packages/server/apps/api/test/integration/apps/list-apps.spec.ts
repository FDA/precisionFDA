import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData, stripEntityDates } from '../../utils/expect-helper'

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
    create.sessionHelper.create(em, { user })
    await em.flush()
    // handle the stubs
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(testedApp.getHttpServer()).get('/apps').set(getDefaultHeaderData(user)).expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(stripEntityDates(body[0])).to.deep.equal({
      id: app.id,
      type: ENTITY_TYPE.HTTPS,
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
    create.sessionHelper.create(em, { user: anotherUser })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get('/apps')
      .set(getDefaultHeaderData(anotherUser))
      .expect(200)
    expect(body).to.be.an('array').with.lengthOf(1)
    expect(body[0]).to.have.property('id', anotherApp.id)
  })
})
