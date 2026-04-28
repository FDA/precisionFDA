import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'countries' })
export class Country {
  @PrimaryKey()
  id: number

  @Property({ nullable: true })
  name?: string

  @Property({ nullable: true })
  dialCode?: string
}
