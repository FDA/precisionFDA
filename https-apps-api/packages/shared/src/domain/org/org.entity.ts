import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'orgs' })
export class Organization extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  handle: string

  @Property()
  name: string

  @Property()
  adminId?: number

  getDxOrg(){
    return `org-pfda..${this.handle}`
  }
}
