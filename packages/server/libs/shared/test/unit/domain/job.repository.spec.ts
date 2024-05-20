import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { create, db } from '../../../src/test'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { STATIC_SCOPE } from '@shared/enums'
import { JobRepository } from '@shared/domain/job/job.repository'

describe('Job repository tests', () => {
  let em: EntityManager<MySqlDriver>
  let user1: User
  let user2: User

  let app: App
  let jobs: Job[]
  let repo: JobRepository

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    repo = em.getRepository(Job)

    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)

    app = create.appHelper.createRegular(em, { user: user1 })

    jobs = [
      create.jobHelper.create(
        em,
        { user: user1, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.IDLE,
        },
      ),
      create.jobHelper.create(
        em,
        { user: user1, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.RUNNING,
        },
      ),
      create.jobHelper.create(
        em,
        { user: user1, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.FAILED,
        },
      ),
      create.jobHelper.create(
        em,
        { user: user2, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.IDLE,
        },
      ),
      create.jobHelper.create(
        em,
        { user: user2, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.RUNNABLE,
        },
      ),
      create.jobHelper.create(
        em,
        { user: user2, app },
        {
          scope: STATIC_SCOPE.PRIVATE,
          state: JOB_STATE.DONE,
        },
      ),
    ]
    await em.flush()
  })

  it('findAllRunningJobs() works', async () => {
    const results = await repo.findAllRunningJobs()
    expect(results.map((x) => x.uid)).to.have.members([
      jobs[0].uid,
      jobs[1].uid,
      jobs[3].uid,
      jobs[4].uid,
    ])
  })

  it('findRunningJobsByUser() works', async () => {
    const results1 = await repo.findRunningJobsByUser({ userId: user1.id })
    expect(results1.map((x) => x.uid)).to.deep.equal([jobs[0].uid, jobs[1].uid])

    const results2 = await repo.findRunningJobsByUser({ userId: user2.id })
    expect(results2.map((x) => x.uid)).to.deep.equal([jobs[3].uid, jobs[4].uid])
  })
})
