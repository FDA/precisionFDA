import type { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { create, db, generate } from '../../../src/test'
import { JOB_STATE } from '../../../src/domain/job/job.enum'

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

  it('getHttpAppUrl() doesn\'t work with regular apps', async () => {
    expect(job.getHttpsAppUrl()).to.be.null()
  })

  it('save and load runData, describe', async () => {
    const jobToBeSaved = create.jobHelper.create(em, { user, app }, {
      runData: {
        run_instance_type: 'base-8',
        run_inputs: {},
        run_outputs: {},
      },
      // @ts-ignore
      describe: {
        httpsApp: {
          dns: {
            url: 'url',
          },
        },
      },
    })
    await em.flush()

    const loadedJob = await em.findOneOrFail(Job, { id: jobToBeSaved.id })
    expect(loadedJob.runData).to.deep.equal(jobToBeSaved.runData)
    expect(loadedJob.describe).to.deep.equal(jobToBeSaved.describe)
  })
})
