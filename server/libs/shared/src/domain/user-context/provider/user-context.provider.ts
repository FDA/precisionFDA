import { Provider } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextStorageManager } from '../storage/user-context-storage.manager'
import { userContextStorage } from '../storage/user-context.storage'

export const userContextProvider: Provider = {
  provide: UserContext,
  useFactory: () => {
    return new UserContextStorageManager(userContextStorage)
  },
}
