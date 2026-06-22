import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { SettingRepository } from './setting.repository'

@Entity({ tableName: 'settings', repository: () => SettingRepository })
export class Setting {
  @PrimaryKey()
  id: number

  @Property()
  key: string

  @Property({ type: 'json' })
  value: unknown
}
