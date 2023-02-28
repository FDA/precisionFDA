import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { App, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { errors, database } from '@pfda/https-apps-shared'


const jobDxid = "job-G6BgPJ00qp9v8PxY33vfyBbf"
const jobCreatedAt = new Date(1637185460171)
const jobStartedRunning = new Date(1637185526405)
const jobStoppedRunning = new Date(1637185703644)
const jobDescribeExample = '{"id":"job-G6BgPJ00qp9v8PxY33vfyBbf","region":"aws:us-east-1", "name":"Sleep","tags":[],"properties":{},"executable":"app-G69z56j0PY11GkQz9QQJ07ff","executableName":"-pfda_autotest1-sleep","class":"job","created":1637185460171,"modified":1637185710029,"project":"project-G55gPq80qp9fz5jbBb0V7Xv3","billTo":"org-pfda..autotestorg1","costLimit":null,"invoiceMetadata":null,"folder":"/","parentJob":null,"originJob":"job-G6BgPJ00qp9v8PxY33vfyBbf","parentAnalysis":null,"analysis":null,"stage":null,"rootExecution":"job-G6BgPJ00qp9v8PxY33vfyBbf","state":"terminated","function":"main","workspace":"container-G6BgPJj0Fy8Qk74g3yxYkZ3x","launchedBy":"user-pfda_autotest1","detachedFrom":null,"priority":"high","workerReuseDeadlineRunTime":{"state":"reuse-off","waitTime":-1,"at":-1},"dependsOn":[],"failureCounts":{},"stateTransitions":[{"newState":"runnable","setAt":1637185463722},{"newState":"running","setAt":1637185526405},{"newState":"terminating","setAt":1637185692631},{"newState":"terminated","setAt":1637185706730}],"singleContext":true,"ignoreReuse":false,"httpsApp":{"enabled":false},"rank":0,"details":{},"systemRequirements":{"main":{"instanceType":"mem1_ssd1_x8_fedramp"},"*":{"instanceType":"mem1_ssd1_x8_fedramp"}},"executionPolicy":{"maxSpotTries":1,"restartOn":{"UnresponsiveWorker":2,"JMInternalError":1,"ExecutionError":1}},"instanceType":"mem1_ssd1_x8_fedramp","trueInstanceType":"dx_c4.2xlarge_fedramp_baseline","finalPriority":"high","networkAccess":[],"runInput":{"minutes":5},"originalInput":{"minutes":5},"input":{"minutes":5},"output":null,"debug":{},"app":"app-G69z56j0PY11GkQz9QQJ07ff","resources":"container-G69z56j0Bk4VGkQz9QQJ07fg","projectCache":"container-G69z5v80qp9QJjjK9Q92Qv7j","startedRunning":1637185526405,"stoppedRunning":1637185703644,"delayWorkspaceDestruction":false,"isFree":false,"totalPrice":0.05632261555555556,"totalEgress":{"regionLocalEgress":0,"internetEgress":264,"interRegionEgress":0},"egressComputedAt":1637185709988,"priceComputedAt":1637185709988,"currency":{"dxCode":0,"code":"USD","symbol":"$","symbolPosition":"left","decimalSymbol":".","groupingSymbol":","},"egressReport":{"regionLocalEgress":0,"internetEgress":264,"interRegionEgress":0},"timeout":120000}'

const createJobDescribe = (dxid: string, state: JOB_STATE) => {
  let jobDescribe = JSON.parse(jobDescribeExample)
  if (dxid !== jobDxid) {
    jobDescribe.id = dxid
  }
  if (state !== JOB_STATE.TERMINATED) {
    jobDescribe.state = state
    // For now don't worry about other intermediate states
    const allowedStates = ['idle'].concat([state])
    jobDescribe.stateTransitions = jobDescribe.stateTransitions.filter(
      st => Object.values(allowedStates).includes(st.newState as JOB_STATE)
    )
    delete jobDescribe.stoppedRunning
  }
  return JSON.stringify(jobDescribe)
}

const createJobDescribeStoppedRunning = (stoppedRunning: number) => {
  let jobDescribe = JSON.parse(jobDescribeExample)
  jobDescribe.stoppedRunning = stoppedRunning
  return JSON.stringify(jobDescribe)
}

describe('JobRepository and JobEntity', () => {
  let em: EntityManager
  let user: User
  let app: App
  let terminatedJob: Job
  let runningJob: Job
  let idleJob: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    terminatedJob = create.jobHelper.create(em, { user, app }, {
      project: user.privateFilesProject,
      createdAt: jobCreatedAt,
      updatedAt: jobCreatedAt,
      scope: 'private',
      state: JOB_STATE.TERMINATED,
      dxid: jobDxid,
      describe: jobDescribeExample,
    })

    runningJob = create.jobHelper.create(em, { user, app }, {
      project: user.privateFilesProject,
      createdAt: jobCreatedAt,
      updatedAt: jobCreatedAt,
      scope: 'private',
      state: JOB_STATE.RUNNING,
    })
    runningJob.describe = createJobDescribe(runningJob.dxid, JOB_STATE.RUNNING)

    idleJob = create.jobHelper.create(em, { user, app }, {
      project: user.privateFilesProject,
      createdAt: jobCreatedAt,
      updatedAt: jobCreatedAt,
      scope: 'private',
      state: JOB_STATE.IDLE,
    })
    idleJob.describe = createJobDescribe(idleJob.dxid, JOB_STATE.IDLE)
    await em.flush()
    mocksReset()
  })

  context('JobRespository', () => {
    it('findOne finds jobs', async () => {
      const jobRepo = em.getRepository(Job)
      expect(jobRepo).to.not.be.null()
  
      let job = await jobRepo.findOne({ dxid: terminatedJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.TERMINATED)
  
      job = await jobRepo.findOne({ dxid: runningJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.RUNNING)
  
      job = await jobRepo.findOne({ dxid: idleJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.IDLE)
    })

    it('findOne throws error if incorrect user', async () => {
      const jobRepo = em.getRepository(Job)
      expect(jobRepo).to.not.be.null()
  
      let job = await jobRepo.findOne({ dxid: terminatedJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.TERMINATED)
  
      job = await jobRepo.findOne({ dxid: runningJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.RUNNING)
  
      job = await jobRepo.findOne({ dxid: idleJob.dxid })
      expect(job).to.not.be.null()
      expect(job.state).to.be.equal(JOB_STATE.IDLE)
    })
  })

  context('JobEntity', () => {
    it('reports state correctly', async () => {
      const jobRepo = em.getRepository(Job)  
      let job = await jobRepo.findOne({ dxid: terminatedJob.dxid })
      expect(job.isActive()).to.equal(false)
      expect(job.isTerminal()).to.equal(true)
  
      job = await jobRepo.findOne({ dxid: runningJob.dxid })
      expect(job.isActive()).to.be.equal(true)
      expect(job.isTerminal()).to.equal(false)
  
      job = await jobRepo.findOne({ dxid: idleJob.dxid })
      expect(job.isActive()).to.equal(true)
      expect(job.isTerminal()).to.equal(false)
    })

    it('calculates runTime for different states', async () => {
      const jobRepo = em.getRepository(Job)

      let job = await jobRepo.findOne({ dxid: terminatedJob.dxid })
      expect(job.runTime()).to.equal(jobStoppedRunning.getTime() - jobStartedRunning.getTime())
  
      job = await jobRepo.findOne({ dxid: runningJob.dxid })
      expect(job.runTime()).to.be.closeTo(new Date().getTime() - jobStartedRunning.getTime(), 100)
    })

    it('formats elapsed time string', async () => {
      const jobRepo = em.getRepository(Job)

      let job = await jobRepo.findOne({ dxid: terminatedJob.dxid })
      expect(job.runTimeString()).to.equal('2m 57s')

      job.describe = createJobDescribeStoppedRunning(jobStoppedRunning.getTime() + 2*60*60*1000)
      await em.flush()
      expect(job.runTimeString()).to.equal('2h 2m 57s')

      job.describe = createJobDescribeStoppedRunning(jobStoppedRunning.getTime() + 42*24*60*60*1000)
      await em.flush()
      expect(job.runTimeString()).to.equal('42d 2m 57s')
    })

    it('filters isActive/isTerminal/isNonTerminal work', async () => {
      const jobRepo = em.getRepository(Job)
      let results = await jobRepo.find({}, { filters: ['isActive'] })
      expect(results).to.have.length(2)

      results = await jobRepo.find({}, { filters: ['isTerminal'] })
      expect(results).to.have.length(1)

      results = await jobRepo.find({}, { filters: ['isNonTerminal'] })
      expect(results).to.have.length(2)
    })
  })
})
