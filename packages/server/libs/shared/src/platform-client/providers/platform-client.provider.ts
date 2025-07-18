import { Provider } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { CHALLENGE_BOT_USER_CONTEXT } from '@shared/domain/user-context/provider/challenge-bot-user-context.provider'
import { PlatformClient } from '@shared/platform-client'

export const CHALLENGE_BOT_PLATFORM_CLIENT = 'CHALLENGE_BOT_PLATFORM_CLIENT'

export const platformClientProvider: Provider = {
  provide: PlatformClient,
  useFactory: (user: UserContext) => new PlatformClient(user),
  inject: [UserContext],
}

export const challengeBotClientProvider: Provider = {
  provide: CHALLENGE_BOT_PLATFORM_CLIENT,
  inject: [CHALLENGE_BOT_USER_CONTEXT],
  useFactory: (uc: UserContext) => new PlatformClient(uc),
}
