import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '@shared/database'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { calculateJobRuntime } from '@shared/domain/job/job.helper'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { JobDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { create, db, generate } from '@shared/test'

describe('EventHelper', () => {
  let em: EntityManager
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email(), lastLogin: new Date() })
    await em.flush()
  })

  context('createJobClosed()', () => {
    it('should create event for normal job', async () => {
      const app = create.appHelper.createHTTPS(em, { user })
      const job = create.jobHelper.create(
        em,
        { user, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.DONE,
        },
      )
      await em.flush()
      const platformJobDescribe = {
        totalPrice: 1,
        startedRunning: 1781016479000,
        stoppedRunning: 1781016581563,
      } as JobDescribeResponse

      const eventHelper = getInstance()
      const event = await eventHelper.createJobClosed(user, job, platformJobDescribe)
      await em.persist(event)
      await em.flush()

      expect(event.type).to.equal(EVENT_TYPES.JOB_CLOSED)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(job.dxid)
      expect(event.param2).to.equal(
        Math.trunc(
          calculateJobRuntime(platformJobDescribe.startedRunning, platformJobDescribe.stoppedRunning) / 1000,
        ).toString(),
      )
    })

    // For this, see PFDA-3217 for context
    it('should create event for job whose app was deleted', async () => {
      const job = create.jobHelper.create(
        em,
        { user },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.DONE,
        },
      )
      await em.flush()

      const eventHelper = getInstance()
      const event = await eventHelper.createJobClosed(user, job, { totalPrice: 1 } as JobDescribeResponse)
      await em.persist(event)
      await em.flush()

      expect(event.type).to.equal(EVENT_TYPES.JOB_CLOSED)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(job.dxid)
      expect(event.param2).to.equal('0')
    })
  })

  function getInstance(): EventHelper {
    return new EventHelper(em)
  }
})
