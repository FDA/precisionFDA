import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { App, Job, User } from '../../../src/domain'
import { database, } from '@pfda/https-apps-shared'
import { create, db, generate } from '../../../src/test'
import { JOB_STATE } from '../../../src/domain/job/job.enum'

describe('Job repository tests', () => {
  let em: EntityManager<MySqlDriver>
  let user1: User
  let user2: User

  let app: App
  let httpsApp: App
  let jobs: Job[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>

    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)

    app = create.appHelper.createRegular(em, { user: user1 })
    httpsApp = create.appHelper.createHTTPS(em, { user: user1 }, { spec: generate.app.jupyterAppSpecData() })

    jobs = [
      create.jobHelper.create(em, { user: user1, app }, { scope: 'private', state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user: user1, app }, { scope: 'private', state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user: user1, app }, { scope: 'private', state: JOB_STATE.FAILED }),
      create.jobHelper.create(em, { user: user2, app }, { scope: 'private', state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user: user2, app }, { scope: 'private', state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user: user2, app }, { scope: 'private', state: JOB_STATE.DONE }),
      create.jobHelper.create(em, { user: user1, app: httpsApp }, { scope: 'public', state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user: user1, app: httpsApp }, { scope: 'public', state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user: user1, app: httpsApp }, { scope: 'public', state: JOB_STATE.TERMINATING }),
      create.jobHelper.create(em, { user: user2, app: httpsApp }, { scope: 'public', state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user: user2, app: httpsApp }, { scope: 'public', state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user: user2, app: httpsApp }, { scope: 'public', state: JOB_STATE.TERMINATED }),
    ]
    await em.flush()
  })

  it('findAllRunningJobs() works', async () => {
    const repo = em.getRepository(Job)
    const results = await repo.findAllRunningJobs()
    expect(results.map(x => x.uid)).to.deep.equal([
      jobs[0].uid,
      jobs[1].uid,
      jobs[3].uid,
      jobs[4].uid,
      jobs[6].uid,
      jobs[7].uid,
      jobs[8].uid,
      jobs[9].uid,
      jobs[10].uid,
    ])
  })

  it('findRunningJobsByUser() works', async () => {
    const repo = em.getRepository(Job)
    const results1 = await repo.findRunningJobsByUser({ userId: user1.id })
    expect(results1.map(x => x.uid)).to.deep.equal([
      jobs[0].uid,
      jobs[1].uid,
      jobs[6].uid,
      jobs[7].uid,
      jobs[8].uid,
    ])

    const results2 = await repo.findRunningJobsByUser({ userId: user2.id })
    expect(results2.map(x => x.uid)).to.deep.equal([
      jobs[3].uid,
      jobs[4].uid,
      jobs[9].uid,
      jobs[10].uid,
    ])
  })
})
