import { EntityManager } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Job as BullJob } from 'bull'
import { expect } from 'chai'
import { database } from '@shared/database'
import { JobService } from '@shared/domain/job/job.service'
import { User } from '@shared/domain/user/user.entity'
import { CheckStatusJob } from '@shared/queue/task.input'
import { create, db } from '@shared/test'
import { UserCtx } from '@shared/types'
import { SyncOutputsHandler } from '../../src/jobs/sync-outputs.handler'

describe('SyncOutputsHandler tests', () => {
  let em: EntityManager
  let user: User
  let handler: SyncOutputsHandler

  const userId = 100

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em as SqlEntityManager, { id: userId })
    await em.flush()
  })

  it('Test execute output syncing', async () => {
    let jobDxIdParam: string
    let userIdParam: number
    const app = create.appHelper.createRegular(em as SqlEntityManager, { user }, { dxid: 'app-1' })
    const job = create.jobHelper.create(em as SqlEntityManager, { user, app }, { dxid: 'job-1' })

    const jobService = {
      async syncOutputs(jobDxId: string): Promise<void> {
        jobDxIdParam = jobDxId
        userIdParam = userId
      },
    } as JobService

    handler = new SyncOutputsHandler(em, jobService)
    const userCtx: UserCtx = {
      ...user,
    } as unknown as UserCtx
    await handler.handle({
      data: { payload: { dxid: job.dxid }, user: userCtx },
    } as BullJob<CheckStatusJob>)

    expect(jobDxIdParam).to.eq(job.dxid)
    expect(userIdParam).to.eq(user.id)
  })

  it('Test execute fail with unknown job dxid', async () => {
    const jobService = {} as JobService

    handler = new SyncOutputsHandler(em, jobService)
    const userCtx: UserCtx = {
      ...user,
    } as unknown as UserCtx
    try {
      await handler.handle({
        data: { payload: { dxid: 'unknown' }, user: userCtx },
      } as BullJob<CheckStatusJob>)
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error.message).to.eq("Job not found ({ dxid: 'unknown' })")
    }
  })
})
