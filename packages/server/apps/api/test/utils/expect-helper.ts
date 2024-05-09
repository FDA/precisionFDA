import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { User } from '@shared/domain/user/user.entity'
import { omit } from 'ramda'
import { BaseEntity } from '@shared/database/base-entity'

const stripEntityDates = (entity: BaseEntity): Omit<BaseEntity, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

const getDefaultHeaderData = (user: User) => ({
  [USER_CONTEXT_HTTP_HEADERS.id]: user.id,
  [USER_CONTEXT_HTTP_HEADERS.dxUser]: user.dxuser,
  [USER_CONTEXT_HTTP_HEADERS.accessToken]: 'fake-token',
})

export { stripEntityDates, getDefaultHeaderData }
