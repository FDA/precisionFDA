import { AsyncLocalStorage } from 'node:async_hooks'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'

export function createUserContextManager(storage: AsyncLocalStorage<UserContext>): UserContext {
  const getCurrentContext = (): UserContext => {
    const store = storage.getStore()

    if (!store) {
      throw new Error('User context storage not initialized! Run the executed async workflow in the storage context')
    }

    return store
  }

  return {
    get id(): number {
      return getCurrentContext()?.id
    },
    get dxuser(): string {
      return getCurrentContext()?.dxuser
    },
    get accessToken(): string {
      return getCurrentContext()?.accessToken
    },
    get expiration(): number {
      return getCurrentContext()?.expiration
    },
    get sessionId(): string {
      return getCurrentContext()?.sessionId
    },
    async loadEntity(): Promise<User | null> {
      return getCurrentContext().loadEntity()
    },
    get requestId(): string {
      return getCurrentContext()?.requestId
    },
  }
}
