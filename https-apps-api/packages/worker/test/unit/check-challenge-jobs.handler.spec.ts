import { EntityManager } from '@mikro-orm/core'
import { config, database, job as jobDomain } from '@pfda/https-apps-shared'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Job, User } from '@pfda/https-apps-shared/src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { CheckChallengeJobsHandler } from '../../src/jobs/check-challenge-jobs.handler'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { expect } from 'chai'

describe('CheckChallengeJobsHandler tests', () => {
  let em: EntityManager
  let challengeBotUser: User
  let handler: CheckChallengeJobsHandler

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    challengeBotUser = create.userHelper.create(em as SqlEntityManager, {dxuser: config.platform.challengeBotUser})
    await em.flush()
  })

  it('Test execute output syncing', async () => {
    let jobDxIdParam
    let userIdParam

    const jobService = {
      async getNonTerminalJobs(userId: number): Promise<Job[]> {
        return [{dxid: 'job-1', state: JOB_STATE.DONE} as Job]
      },
      async syncOutputs(jobDxId: string, userId: number): Promise<void> {
        jobDxIdParam = jobDxId
        userIdParam = userId
      }
    } as jobDomain.JobService
    handler = new CheckChallengeJobsHandler(em, jobService)

    await handler.handle({ id: '1' } as any)

    expect(jobDxIdParam).to.eq('job-1')
    expect(userIdParam).to.eq(challengeBotUser.id)
  })

})
