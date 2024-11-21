import { Provider } from '@nestjs/common'
import { config } from '@shared/config'
import { FileEmailClient, SMTPEmailClient, EmailClient } from '@shared/services/email-client'

export const emailClientProvider: Provider = {
  provide: EmailClient,
  useFactory: () => {
    if (config.emails.smtp.saveEmailToFile) {
      return new FileEmailClient()
    }
    return new SMTPEmailClient()
  },
}
