import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { create, db, generate } from '../../../src/test'
import { JOB_STATE } from '../../../src/domain/job/job.enum'
import { App, AppSpec, Internal } from '../../../src/domain/app/app.entity'

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
      internal: generate.app.ttydAppInternalWithAPI('1.0.0'),
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

    httpsAppWithAPI.internal = {
      ordered_assets: ['file-GQX1jP800Q42p0p3f2QY1zgb-1'],
      platform_tags: ['pfda_workstation_api:3.2.1'],
      packages: ['ipython', 'pkg-config'],
    } as Internal
    await em.fork().flush()
    expect(httpsAppWithAPI.workstationAPITag).to.equal('pfda_workstation_api:3.2.1')
    expect(httpsAppWithAPI.workstationAPIVersion).to.equal('3.2.1')
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

  it('save and load JSON types appEntity.spec and appEntity.internal', async () => {
    const app = create.appHelper.createRegular(em, { user }, {
      spec: {
        input_spec: [],
        output_spec: [],
        internet_access: true,
        instance_type: 't2.micro',
      } as AppSpec
    })
  })
})
