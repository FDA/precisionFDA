import { AsyncLocalStorage } from 'node:async_hooks'
import { UserContext } from '@shared/domain/user-context/model/user-context'

export const userContextStorage = new AsyncLocalStorage<UserContext>()
