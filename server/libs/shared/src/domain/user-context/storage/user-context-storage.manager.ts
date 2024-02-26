import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AsyncLocalStorage } from 'async_hooks'

export class UserContextStorageManager implements UserContext {
  constructor(private readonly storage: AsyncLocalStorage<UserContext>) {}

  get id() {
    return this.getCurrentContext()?.id
  }

  get dxuser() {
    return this.getCurrentContext()?.dxuser
  }

  get accessToken() {
    return this.getCurrentContext()?.accessToken
  }

  private getCurrentContext(): UserContext {
    const storage = this.storage.getStore()

    if (!storage) {
      throw new Error(
        'User context storage not initialized! Run the executed async workflow in the storage context',
      )
    }

    return storage
  }

  private toJSON(): UserContext {
    return {
      id: this.id,
      accessToken: this.accessToken,
      dxuser: this.dxuser,
    }
  }
}
