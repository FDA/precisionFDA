import { Logger } from '@nestjs/common'
import { Job } from '@shared/domain/job/job.entity'
import { IPlatformAuthClient } from '@shared/platform-client/platform-auth-client'
import { IWorkstationClient } from '@shared/workstation-client/workstation-client'
import { AxiosInstance } from 'axios'
import sinon from 'sinon'
import { ServiceFactory, setServiceFactory } from '../services/service-factory'
import { IEmailService } from '../services/smtp.service'

class MockServiceFactory extends ServiceFactory {
  emailService = {
    sendEmail: sinon.stub(),
    reset: () => {
      this.emailService.sendEmail.resolves()
      this.emailService.sendEmail.resetHistory()
    },
  }

  notificationService = {
    createNotification: sinon.stub(),
    reset: () => {
      this.notificationService.createNotification.callsFake(() => {})
      this.notificationService.createNotification.resetHistory()
    },
  }

  platformAuthClient = {
    newAuthToken: sinon.stub(),
    userResetMfa: sinon.stub(),
    reset: () => {
      this.platformAuthClient.newAuthToken.callsFake(() => ({ authorization_code: '12345678' }))
      this.platformAuthClient.newAuthToken.resetHistory()

      this.platformAuthClient.userResetMfa.callsFake(() => ({ authorization_code: '12345678' }))
      this.platformAuthClient.userResetMfa.resetHistory()
    },
  }

  workstationClient = {
    oauthAccess: sinon.stub(),
    alive: sinon.stub(),
    setAPIKey: sinon.stub(),
    setPFDAConfig: sinon.stub(),
    snapshot: sinon.stub(),
    reset: () => {
      this.workstationClient.oauthAccess.callsFake(() => {})
      this.workstationClient.oauthAccess.resetHistory()

      this.workstationClient.alive.callsFake(() => true)
      this.workstationClient.alive.resetHistory()

      this.workstationClient.setAPIKey.callsFake(() => ({ result: 'success' }))
      this.workstationClient.setAPIKey.resetHistory()

      this.workstationClient.setPFDAConfig.callsFake(() => ({ result: 'success' }))
      this.workstationClient.setPFDAConfig.resetHistory()

      this.workstationClient.snapshot.callsFake(() => ({ result: 'success' }))
      this.workstationClient.snapshot.resetHistory()
    },
  }

  getEmailService(): IEmailService {
    return this.emailService
  }

  getPlatformAuthClient(
    accessToken: string,
    logger?: Logger,
    axiosInstance?: AxiosInstance,
  ): IPlatformAuthClient {
    return this.platformAuthClient
  }

  getWorkstationClient(
    job: Job,
    url: string,
    axiosInstance: AxiosInstance,
    logger?: Logger,
  ): IWorkstationClient {
    return this.workstationClient
  }

  reset() {
    this.notificationService.reset()
    this.platformAuthClient.reset()
    this.workstationClient.reset()
    this.emailService.reset()
  }
}

export const createMockServiceFactory = () => {
  const mockServiceFactory = new MockServiceFactory()
  setServiceFactory(mockServiceFactory)
  return mockServiceFactory
}
