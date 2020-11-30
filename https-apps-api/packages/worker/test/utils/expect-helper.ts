import { omit } from 'ramda'
import { AnyObject } from '@pfda/https-apps-shared/src/types'

const stripEntityDates = (entity: AnyObject): Omit<AnyObject, 'createdAt' | 'updatedAt'> => {
  return omit(['createdAt', 'updatedAt'], entity)
}

export { stripEntityDates }
