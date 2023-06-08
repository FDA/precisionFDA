import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { App, job, Job, User } from 'shared/src/domain'
import { database, } from '@pfda/https-apps-shared'
import { create, db, generate } from 'shared/src/test'
import { JOB_STATE } from 'shared/src/domain/job/job.enum'

describe('Job entity tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  // Regular app / job
  let app: App
  let job: Job

  // HTTPS app / job
  let httpsApp: App
  let httpsJob: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>

    user = create.userHelper.create(em)
    app = create.appHelper.createRegular(em, { user })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsApp = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    httpsJob = create.jobHelper.create(em, { user, app: httpsApp }, { scope: 'private', state: JOB_STATE.RUNNING })
    await em.flush()
  })

  it('getHttpsAppUrl() with HTTPS app', async () => {
    expect(httpsJob.getHttpsAppUrl()).to.contain(`${httpsJob.dxid}.internal.dnanexus.cloud`)
  })

  it('getHttpAppUrl() doesn\t work with regular apps', async () => {
    expect(job.getHttpsAppUrl()).to.be.null()
  })
})
