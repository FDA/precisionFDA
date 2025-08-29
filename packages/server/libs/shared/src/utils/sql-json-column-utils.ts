import { BaseEntity } from '../database/base.entity'

export type ColumnNode<T extends BaseEntity> =
  | {
      type: 'standard'
      value: keyof T
    }
  | {
      type: 'json'
      sqlColumn: keyof T
      path: Array<string | number>
    }
