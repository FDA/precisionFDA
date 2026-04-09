import { Provider } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '../storage/user-context.storage'
import { createUserContextManager } from '../storage/user-context-storage.manager'

export const userContextProvider: Provider = {
  provide: UserContext,
  useFactory: () => {
    return createUserContextManager(userContextStorage)
  },
}
