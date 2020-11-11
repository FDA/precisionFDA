import { DateTime } from 'luxon'
import { omit } from 'ramda'
import { BaseEntity } from '../../src/database/base-entity'
import { User } from '../../src/users'

const serializeEntityDates = (entity: BaseEntity) => ({
  createdAt: DateTime.fromJSDate(entity.createdAt).setZone('utc').toISO(),
  updatedAt: DateTime.fromJSDate(entity.updatedAt).setZone('utc').toISO(),
})

const stripEntityDates = (entity: BaseEntity): Omit<BaseEntity, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

const getDefaultQueryData = (user: User) => ({
  id: user.id,
  dxuser: user.dxuser,
  accessToken: 'fake-token',
})

export { serializeEntityDates, stripEntityDates, getDefaultQueryData }
