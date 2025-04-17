import { EntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { COOKIE_SESSION_KEY, USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { database } from '@shared/database'
import { ErrorCodes } from '@shared/errors'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { CSRFUtils } from '@shared/utils/csrf.utils'
import { TimeUtils } from '@shared/utils/time.utils'
import { expect } from 'chai'
import crypto from 'crypto'
import { useFakeTimers } from 'sinon'
import supertest from 'supertest'
import { testedApp } from '..'
import { getCookieTokenString, getDefaultHeaderData } from '../utils/expect-helper'

describe('Send request', () => {
  let em: EntityManager

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    mocksReset()
  })

  context('to a public route', () => {
    it('should return 200 if sending empty header', async () => {
      await supertest(testedApp.getHttpServer()).get('/experts').expect(200)
    })

    it('should return 200 if sending a valid unauthorized cookie', async () => {
      await supertest(testedApp.getHttpServer())
        .get('/experts')
        .set(getDefaultHeaderData())
        .expect(200)
    })

    it('should return 200 if sending a valid authorized cookie', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .get('/experts')
        .set({
          cookie: getCookieTokenString(user),
        })
        .expect(200)
    })
  })

  context('to a guarded route', () => {
    it('should return 401 if sending empty header', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending a valid unauthorized cookie', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set(getDefaultHeaderData())
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an invalid cookie', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: `${COOKIE_SESSION_KEY}=${crypto.randomBytes(8).toString('hex')}`,
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 200 if sending a valid authorized cookie', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: getCookieTokenString(user),
        })
        .expect(200)
        .expect((res) => {
          const cookies = Array.from(res.headers['set-cookie'])
          if (!cookies) throw new Error('No Set-Cookie header found')

          expect(cookies.find((s) => s.includes('sessionExpiredAt'))).to.be.a('string')
          expect(cookies.find((s) => s.includes(COOKIE_SESSION_KEY))).to.be.a('string')
        })
    })

    it('should return 401 if request is expired', async () => {
      const user = create.userHelper.create(em)
      const session = create.sessionHelper.create(em, { user })
      await em.flush()

      const expirationTime = session.expiredAt() * 1000 + 10000
      const clock = useFakeTimers({
        now: expirationTime,
        toFake: ['Date'],
      })

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: getCookieTokenString(user),
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
      clock.restore()
    })

    it('should return 401 if expiration time is over', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: getCookieTokenString(
            user,
            TimeUtils.floorMilisecondsToSeconds(
              Date.now() - TimeUtils.minutesToMilliseconds(config.minusExpirationMinutes + 1),
            ),
          ),
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an valid cookie but user does not exist', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      user.id = user.id + 1
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: getCookieTokenString(user),
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an invalid authorization header', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          authorization: `Bearer ${crypto.randomBytes(8).toString('hex')}`,
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an invalid authorization key', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          authorization: `Key ${crypto.randomBytes(8).toString('hex')}`,
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an empty cookie value', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: `${COOKIE_SESSION_KEY}=`,
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('should return 401 if sending an empty authorization key', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          authorization: '',
        })
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })
  })

  context('with CSRF token', () => {
    it('should skip checking CSRF token for GET requests', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .get('/reports?scope=private')
        .set({
          cookie: getCookieTokenString(user),
        })
        .expect(200)
    })

    it('should check CSRF token for non-GET/OPTIONS requests', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/reports')
        .set(getDefaultHeaderData(user))
        .send({
          scope: 'private',
          format: 'JSON',
        })
        .expect(201)
    })

    it('should return 403 if sending an invalid CSRF token', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/reports')
        .set({
          ...getDefaultHeaderData(user),
          [USER_CONTEXT_HTTP_HEADERS.csrfToken]: CSRFUtils.generateToken('invalid'),
        })
        .send({
          scope: 'private',
          format: 'HTML',
        })
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })

    it('should return 403 if trying to bypass CSRF token check', async () => {
      const user = create.userHelper.create(em)
      create.sessionHelper.create(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/reports')
        .set({
          cookie: getCookieTokenString(user),
          authorization: `Bearer ${crypto.randomBytes(8).toString('hex')}`,
        })
        .send({
          scope: 'private',
          format: 'HTML',
        })
        .expect(403)
      expect(body.error).to.have.property('code', ErrorCodes.NOT_PERMITTED)
    })
  })
})
