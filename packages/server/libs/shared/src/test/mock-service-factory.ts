import sinon from 'sinon'
import { EmailClient } from '../services/email-client'

class MockServiceFactory {
  emailService = {
    sendEmail: sinon.stub(),
    reset: (): void => {
      this.emailService.sendEmail.resolves()
      this.emailService.sendEmail.resetHistory()
    },
  }

  notificationService = {
    createNotification: sinon.stub(),
    reset: (): void => {
      this.notificationService.createNotification.callsFake(() => {})
      this.notificationService.createNotification.resetHistory()
    },
  }

  getEmailService(): EmailClient {
    return this.emailService
  }

  reset(): void {
    this.notificationService.reset()
    this.emailService.reset()
  }
}

export const createMockServiceFactory = (): MockServiceFactory => {
  return new MockServiceFactory()
}
