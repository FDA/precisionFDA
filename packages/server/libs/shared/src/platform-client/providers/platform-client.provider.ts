import { Provider } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'

export const CHALLENGE_BOT_PLATFORM_CLIENT = 'CHALLENGE_BOT_PLATFORM_CLIENT'

export const platformClientProvider: Provider = {
  provide: PlatformClient,
  useFactory: (user: UserContext) => new PlatformClient(user),
  inject: [UserContext],
}

export const challengeBotClientProvider: Provider = {
  provide: CHALLENGE_BOT_PLATFORM_CLIENT,
  useFactory: () => new PlatformClient({ accessToken: config.platform.challengeBotAccessToken }),
}
