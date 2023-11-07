import { USER_CONTEXT_HTTP_HEADERS } from '@pfda/https-apps-shared'
import { DateTime } from 'luxon'
import { omit } from 'ramda'
import { User } from '@pfda/https-apps-shared/src/domain'
import { BaseEntity } from '@pfda/https-apps-shared/src/database/base-entity'

const serializeEntityDates = (entity: BaseEntity) => ({
  createdAt: DateTime.fromJSDate(entity.createdAt).setZone('utc').toISO(),
  updatedAt: DateTime.fromJSDate(entity.updatedAt).setZone('utc').toISO(),
})

const stripEntityDates = (entity: BaseEntity): Omit<BaseEntity, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

const getDefaultHeaderData = (user: User) => ({
  [USER_CONTEXT_HTTP_HEADERS.id]: user.id,
  [USER_CONTEXT_HTTP_HEADERS.dxUser]: user.dxuser,
  [USER_CONTEXT_HTTP_HEADERS.accessToken]: 'fake-token',
})

export { serializeEntityDates, stripEntityDates, getDefaultHeaderData }
