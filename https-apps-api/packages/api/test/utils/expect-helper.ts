import { DateTime } from 'luxon'
import { omit } from 'ramda'
import { BaseEntity } from '../../src/database/base-entity'

const serializeEntityDates = (entity: BaseEntity) => {
  return {
    createdAt: DateTime.fromJSDate(entity.createdAt).setZone('utc').toISO(),
    updatedAt: DateTime.fromJSDate(entity.updatedAt).setZone('utc').toISO(),
  }
}

const stripEntityDates = (entity: BaseEntity): Omit<BaseEntity, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

export { serializeEntityDates, stripEntityDates }
