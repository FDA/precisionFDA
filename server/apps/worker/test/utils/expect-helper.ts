import { omit } from 'ramda'
import { AnyObject } from '@shared/types'

const stripEntityDates = (entity: AnyObject): Omit<AnyObject, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt', 'created_at', 'updated_at'], entity)
}

export { stripEntityDates }
