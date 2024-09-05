import { Provider } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'

export const platformClientProvider: Provider = {
  provide: PlatformClient,
  useFactory: () => new PlatformClient({ accessToken: process.env.ADMIN_TOKEN }),
}
