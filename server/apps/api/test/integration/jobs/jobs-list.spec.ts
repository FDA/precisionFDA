import type { EntityManager } from '@mikro-orm/core'
import { Reference } from '@mikro-orm/core'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { Space } from '@shared/domain/space/space.entity'
import { getScopeFromSpaceId } from '@shared/domain/space/space.helper'
import { User } from '@shared/domain/user/user.entity'
import { HOME_SCOPE } from '@shared/enums'
import { ErrorCodes } from '@shared/errors'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'


// N.B. These tests are still work in progress as the API needs to be finalised
//      and the tests themselves need work, thus skipping
describe.skip('GET /jobs', () => {
  let em: EntityManager
  const jobs: Job[] = []
  let user1: User
  let user2: User
  let app: App
  let space: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user: user1 })
    space = create.spacesHelper.create(em)

    // Create a bunch of jobs for the user
    //
    // Need to create more than 10 to test pagination
    // Making sure we have different states, scopes
    // The following creates 18 jobs (9 for each user)
    const jobsCount = {
      running: 6,
      terminated: 6,
      done: 6,
    }

    // Create two each of Everybody / Featured / Me scopes
    const getScope = (i: number) => {
      if (i < 2)
        return HOME_SCOPE.EVERYBODY
      else if (i < 4)
        return HOME_SCOPE.FEATURED
      else
        return HOME_SCOPE.ME
    }

    Object.keys(jobsCount).forEach(key => {
      const count = jobsCount[key]
      for (let i = 0; i < count; i++) {
        const user = i % 2 ? user1 : user2
        const job = create.jobHelper.create(em, { user, app }, {
          state: JOB_STATE.DONE,
          scope: getScope(i),
          user: Reference.create(user),
        })
        jobs.push(job)
      }
    })

    // Also create a space and add some jobs to it, but only user1 for now
    const jobsInSpaceCount = 5
    for (let i = 0; i < jobsInSpaceCount; i++) {
      const job = create.jobHelper.create(em, { user: user1, app }, {
        state: JOB_STATE.RUNNING,
        scope: getScopeFromSpaceId(space.id),
        user: Reference.create(user1),
      })
      jobs.push(job)
    }

    await em.flush()

    mocksReset()
  })

  it('returns jobs list', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/jobs')
      .set(getDefaultHeaderData(user1))
      .expect(200)

    expect(body).to.include.keys(['data', 'meta'])
    expect(body.data).is.an.instanceof(Array)
    expect(body.data).has.length(10)
    expect(body.meta).to.equal({
      currentPage: 1,
      limit: 10,
      nextPage: 2,
      totalCount: 14,
    })
  })

  it('returns second page of jobs list', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/jobs')
      .set(getDefaultHeaderData(user1))
      .query({ page: 2 })
      .expect(200)

    expect(body).to.include.keys(['data', 'meta'])
    expect(body.data).is.an.instanceof(Array)
    expect(body.data).has.length(4)
    expect(body.meta).to.equal({
      currentPage: 2,
      limit: 10,
      nextPage: 3,
      totalCount: 14,
    })
  })

  it('returns jobs list for user2', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/jobs')
      .set(getDefaultHeaderData(user2))
      .query({ page: 2 })
      .expect(200)

    expect(body.data).has.length(10)
    expect(body.meta).to.equal({
      currentPage: 1,
      limit: 10,
      nextPage: 2,
      totalCount: 11,
    })
  })

  // TODO
  it.skip('returns jobs list for different scopes', async () => {
    const { body } = await supertest(testedApp.getHttpServer()).get('/jobs')
      .set(getDefaultHeaderData(user1))
      .query({ scope: HOME_SCOPE.EVERYBODY })
      .expect(200)
  })

  // TODO
  it.skip('returns jobs list for a space', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/jobs')
      .set(getDefaultHeaderData(user1))
      .query({ scope: getScopeFromSpaceId(space.id) })
      .expect(200)
  })

  context('error states', () => {
    it('returns 400 when scope is invalid', async () => {
      const badScope = 'foobar'
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/jobs')
        .set(getDefaultHeaderData(user1))
        .query({ scope: badScope })
        .expect(400)

      expect(body.error).to.have.property('code', ErrorCodes.USER_CONTEXT_QUERY_INVALID)
    })

    it('returns 400 when spaceId is invalid', async () => {
      const badSpaceId = 'notASpaceId'
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/jobs')
        .set(getDefaultHeaderData(user1))
        .query({ spaceId: badSpaceId })
        .expect(400)
      expect(body.error).to.have.property('code', ErrorCodes.VALIDATION)
      expect(body.props).to.have.property('validationErrors')
    })
  })
})
