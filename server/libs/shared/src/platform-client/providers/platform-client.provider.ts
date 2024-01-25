import { Provider } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'

export const platformClientProvider: Provider = {
  provide: PlatformClient,
  useFactory: (user: UserContext) => new PlatformClient(user.accessToken),
  inject: [UserContext],
}
