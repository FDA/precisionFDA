import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AsyncLocalStorage } from 'async_hooks'

export function createUserContextManager(storage: AsyncLocalStorage<UserContext>): UserContext {
  const getCurrentContext = () => {
    const store = storage.getStore()

    if (!store) {
      throw new Error(
        'User context storage not initialized! Run the executed async workflow in the storage context',
      )
    }

    return store
  }

  return {
    get id() {
      return getCurrentContext()?.id
    },
    get dxuser() {
      return getCurrentContext()?.dxuser
    },
    get accessToken() {
      return getCurrentContext()?.accessToken
    },
  }
}
