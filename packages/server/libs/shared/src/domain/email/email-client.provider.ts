import { FactoryProvider } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailClient, FileEmailClient, SMTPEmailClient } from '@shared/services/email-client'

export const emailClientProvider: FactoryProvider = {
  provide: EmailClient,
  useFactory: () => {
    if (config.emails.smtp.saveEmailToFile) {
      return new FileEmailClient()
    }
    return new SMTPEmailClient()
  },
}
