import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AsyncLocalStorage } from 'async_hooks'

export const userContextStorage = new AsyncLocalStorage<UserContext>()
