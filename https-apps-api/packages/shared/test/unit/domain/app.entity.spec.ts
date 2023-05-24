import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { App, Job, User } from 'shared/src/domain'
import { database, } from '@pfda/https-apps-shared'
import { create, db, generate } from 'shared/src/test'
import { JOB_STATE } from 'shared/src/domain/job/job.enum'

describe('app.entity tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  // Regular app / job
  let app: App
  let job: Job

  // HTTPS app / job
  let httpsApp: App
  let httpsJob: Job

  // HTTPS app / job that has workstation API
  let httpsAppWithAPI: App
  let httpsJobWithAPI: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>

    user = create.userHelper.create(em)
    app = create.appHelper.createRegular(em, { user })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsApp = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternal(),
    })
    httpsJob = create.jobHelper.create(em, { user, app: httpsApp }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsAppWithAPI = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppWithAPIInternal(),
    })
    httpsJobWithAPI = create.jobHelper.create(em, { user, app: httpsAppWithAPI }, { scope: 'private', state: JOB_STATE.RUNNING })

    await em.flush()
  })

  it('relations work', async () => {
    expect(app.user.id).to.equal(user.id)

    expect(app.jobs).to.have.length(1)
    expect(app.jobs[0].id).to.equal(job.id)

    expect(httpsApp.jobs).to.have.length(1)
    expect(httpsApp.jobs[0].id).to.equal(httpsJob.id)
  })

  it('workstationAPITag / hasWorkstationAPI / workstationAPIVersion returns correct results for HTTPS app with workstation API', async () => {
    // HTTPS app: with workstation API
    expect(httpsAppWithAPI.hasWorkstationAPI).to.be.true()
    expect(httpsAppWithAPI.workstationAPITag).to.equal('pfda_workstation_api:1.0.0')
    expect(httpsAppWithAPI.workstationAPIVersion).to.equal('1.0.0')

    httpsAppWithAPI.internal = JSON.stringify({
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      platform_tags: ['pfda_workstation_api:3.2.1'],
      packages: ['ipython', 'pkg-config'],
    })
    await em.fork().flush()
    expect(httpsAppWithAPI.workstationAPITag).to.equal('pfda_workstation_api:3.2.1')
    expect(httpsAppWithAPI.workstationAPIVersion).to.equal('3.2.1')
  })

  it('workstationAPITag returns undefined with malformed internal', async () => {
    httpsAppWithAPI.internal = JSON.stringify('not a JSON')
    await em.fork().flush()
    expect(httpsAppWithAPI.workstationAPIVersion).to.equal(null)
  })

  it('workstationAPITag / hasWorkstationAPI / workstationAPIVersion does not work with HTTPS app with no workstation API', async () => {
    // HTTPS app: no workstation API
    expect(httpsApp.hasWorkstationAPI).to.be.false()
    expect(httpsApp.workstationAPITag).to.equal(null)
    expect(httpsApp.workstationAPIVersion).to.equal(null)
  })

  it('workstationAPITag / hasWorkstationAPI / workstationAPIVersion does not work with regular app', async () => {
    // Normal app: no workstation API
    expect(app.hasWorkstationAPI).to.be.false()
    expect(app.workstationAPITag).to.equal(null)
    expect(app.workstationAPIVersion).to.equal(null)
  })
})
