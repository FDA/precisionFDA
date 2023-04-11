/* eslint-disable max-len */
import axios, { AxiosInstance } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import * as errors from '../../errors'
import { UserOpsCtx } from '../../types'
import { Job } from '.'
import { JOB_STATE } from './job.enum'
import { getServiceFactory } from '../../services/service-factory'
import { IWorkstationClient } from '../../workstation-client'


// Service handling communicating with workstation API
// Each instance should be paired with one particular job
class WorkstationService {
  private readonly ctx: UserOpsCtx
  private readonly axiosInstance: AxiosInstance
  client: IWorkstationClient
  job: Job
  jobUrl: string
  authToken: string

  constructor(userCtx: UserOpsCtx, authToken: string) {
    this.ctx = userCtx
    this.axiosInstance = wrapper(axios.create({ jar: new CookieJar() }))
    this.authToken = authToken
  }

  async initWithJob(jobDxid: string): Promise<WorkstationService> {
    if (this.job) {
      throw new errors.InternalError('WorkstationService already initialized with a job')
    }

    const jobRepo = this.ctx.em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: jobDxid })
    if (!job) {
      throw new errors.JobNotFoundError()
    }

    if (!job.isHTTPS) {
      throw new errors.InvalidStateError(`Job ${job.id} is not an HTTPS app`)
    }

    const jobUrl = job.getHttpsAppUrl()
    if (!jobUrl) {
      throw new errors.InvalidStateError(`Cannot obtain job url for job ${job.id}`)
    }
    this.job = job
    this.jobUrl = jobUrl

    await this.initSession()

    this.ctx.log.info({
      jobId: job.id,
      jobDxid: job.dxid,
    }, 'WorkstationService: finished initWithJob')
    return this
  }

  // Initialize session by obtaining an auth token
  async initSession() {
    this.ctx.log.info('WorkstationService: initSession')

    // Keeping the following code for the day we migrate the newAuthToken call to nodejs
    // This did not work even when replicating the same oauth2/access call minicing the Rails headers
    //
    // redirect_uri: "#{job.https_job_external_url.downcase}/oauth2/access",
    // const redirectUri = `${this.jobUrl}/oauth2/access`
    // const userService = new UserService(this.ctx.user, this.ctx.log, this.axiosInstance)
    // this.authToken = await userService.newAuthToken(redirectUri)
    //
    // this.ctx.log.info(`WorkstationService: got authToken ${this.authToken}, calling oauth`)

    this.client = getServiceFactory().getWorkstationClient(this.jobUrl, this.axiosInstance)
    await this.client.oauthAccess(this.authToken)
  }

  checkRunningWorkstation() {
    if (this.job.state !== JOB_STATE.RUNNING) {
      this.ctx.log.info({ jobId: this.job.id }, 'WorkstationService: Job is not in running state')
      throw new errors.InvalidStateError('Job is not in running state')
    }
  }

  checkValidSession() {
    if (!this.client) {
      throw new errors.InvalidStateError('WorkstationService initSession needs to be called before calling workstation API')
    }
  }

  async alive(): Promise<boolean> {
    this.checkRunningWorkstation()
    this.checkValidSession()
    return await this.client.alive()
  }

  async setAPIKey(key: string): Promise<void> {
    this.checkRunningWorkstation()
    this.checkValidSession()
    this.ctx.log.info('WorkstationService: setAPIKey')
    return await this.client.setAPIKey(key)
  }

  async snapshot(key: string, name: string, terminate: boolean): Promise<any> {
    this.checkRunningWorkstation()
    this.checkValidSession()
    this.ctx.log.info('WorkstationService: Beginning snapshot', { name, terminate })
    await this.client.setAPIKey(key)
    const res = await this.client.snapshot({ name, terminate })
    this.ctx.log.info('WorkstationService: snapshot returned results', { name, terminate, res })
    return res
  }
}

export {
  WorkstationService,
}
