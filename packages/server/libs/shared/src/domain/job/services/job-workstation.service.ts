import { Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { compareVersions } from 'compare-versions'
import { omit } from 'ramda'
import { CookieJar } from 'tough-cookie'
import { config } from '@shared/config'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobRepository } from '@shared/domain/job/job.repository'
import { InvalidStateError, JobNotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { getServiceFactory } from '@shared/services/service-factory'
import {
  CLIConfigParams,
  IWorkstationClient,
  WorkstationAPIResponse,
} from '@shared/workstation-client/workstation-client'

interface AxiosCookieJarConfig extends AxiosRequestConfig {
  jar: CookieJar
  withCredentials: boolean
}

@Injectable()
export class JobWorkstationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly jobRepository: JobRepository) {}

  async alive(jobUid: Uid<'job'>, authToken: string): Promise<boolean> {
    const { client } = await this.initWithJob(jobUid, authToken)
    return await client.alive()
  }

  async setAPIKey(jobUid: Uid<'job'>, authCode: string, key: string): Promise<void> {
    const { job, client } = await this.initWithJob(jobUid, authCode)
    await this.setAPIKeyOnWorkstation(job, client, key)
  }

  async snapshot(
    jobUid: Uid<'job'>,
    authCode: string,
    key: string,
    name: string,
    terminate: boolean,
  ): Promise<WorkstationAPIResponse> {
    const { job, client } = await this.initWithJob(jobUid, authCode)
    this.logger.log('Beginning snapshot', { name, terminate })
    await this.setAPIKeyOnWorkstation(job, client, key)
    const res = await client.snapshot({ name, terminate })
    this.logger.log('Snapshot returned results', { name, terminate, res })
    return res
  }

  private async initWithJob(jobUid: Uid<'job'>, authToken: string): Promise<{ job: Job; client: IWorkstationClient }> {
    const jar = new CookieJar()
    const config: AxiosCookieJarConfig = {
      jar,
      withCredentials: true, // required when using cookies
    }
    // biome-ignore lint/suspicious/noExplicitAny: Should be fixed
    const axiosInstance = wrapper(axios.create(config) as any)

    const job = await this.jobRepository.findAccessibleOne({ uid: jobUid }, { populate: ['app'] })
    if (!job) {
      throw new JobNotFoundError()
    }
    this.checkJobWithWorkstationAPI(job)
    this.checkRunningWorkstation(job)

    const jobUrl = job.getHttpsAppUrl()
    if (!jobUrl) {
      throw new InvalidStateError(`Cannot obtain job url for job ${job.id}`)
    }

    const client = await this.initSession(jobUrl, axiosInstance, job, authToken)
    this.checkValidSession(client)

    this.logger.log(
      {
        jobId: job.id,
        jobUid: job.uid,
      },
      'Finished initWithJob',
    )
    return { job, client }
  }

  private async setAPIKeyOnWorkstation(
    job: Job,
    client: IWorkstationClient,
    key: string,
  ): Promise<WorkstationAPIResponse> {
    if (compareVersions(client.apiVersion, '1.1') < 0) {
      this.logger.log('setAPIKey')
      return await client.setAPIKey(key)
    } else {
      const pfdaConfig: CLIConfigParams = {
        Key: key,
      }
      if (config.api.railsHost) {
        const hostUrl = new URL(config.api.railsHost)
        pfdaConfig.Server = hostUrl.port ? `${hostUrl.hostname}:${hostUrl.port}` : hostUrl.hostname
      }
      if (job.isInSpace()) {
        pfdaConfig.Scope = job.scope
      }

      this.logger.log(
        {
          ...omit(['Key'], pfdaConfig),
        },
        'setPFDAConfig',
      )
      return await client.setPFDAConfig(pfdaConfig)
    }
  }

  // Initialize session by obtaining an auth token
  private async initSession(
    jobUrl: string,
    axiosInstance: AxiosInstance,
    job: Job,
    authToken: string,
  ): Promise<IWorkstationClient> {
    // Keeping the following code for the day we migrate the newAuthToken call to nodejs
    // This did not work even when replicating the same oauth2/access call minicing the Rails headers
    //
    // redirect_uri: "#{job.https_job_external_url.downcase}/oauth2/access",
    // const redirectUri = `${this.jobUrl}/oauth2/access`
    // const userService = new UserService(this.ctx.user, this.ctx.log, this.axiosInstance)
    // this.authToken = await userService.newAuthToken(redirectUri)
    //
    // this.ctx.log.verbose(`JobWorkstationService: got authToken ${this.authToken}, calling oauth`)

    const client = getServiceFactory().getWorkstationClient(jobUrl, axiosInstance)
    const apiVersion = job.app?.getEntity().workstationAPIVersion
    if (apiVersion) {
      client.apiVersion = apiVersion
    }
    await client.oauthAccess(authToken)
    return client
  }

  private checkRunningWorkstation(job: Job): void {
    if (job.state !== JOB_STATE.RUNNING) {
      this.logger.log({ jobId: job.id, jobUid: job.uid }, 'Job is not in running state')
      throw new InvalidStateError('Job is not in running state')
    }
  }

  private checkValidSession(client: IWorkstationClient): void {
    if (!client) {
      throw new InvalidStateError('JobWorkstationService initSession needs to be called before calling workstation API')
    }
  }

  private checkJobWithWorkstationAPI(job: Job): void {
    if (!job.isHTTPS()) {
      throw new InvalidStateError(`Job ${job.uid} is not an HTTPS app`)
    }
    if (!job.app?.getEntity().hasWorkstationAPI) {
      throw new InvalidStateError(`Job ${job.uid} does not have workstation API`)
    }
  }
}
