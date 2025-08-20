import { EntityProps, ObjectQuery } from '@mikro-orm/mysql'
import { OperatorMap } from 'node_modules/@mikro-orm/core/typings'

export type ObjectFilterQuery<T> = ObjectQuery<T> | NonNullable<EntityProps<T> & OperatorMap<T>>
