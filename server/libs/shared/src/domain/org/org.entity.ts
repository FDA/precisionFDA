import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'orgs' })
export class Organization extends BaseEntity {
  @PrimaryKey()
  id: number

  // N.B handle is not the dxid of the org on platform
  //     See createDxOrg() below for the format of org dxid on platform
  @Property()
  handle: string

  @Property()
  name: string

  @Property()
  adminId?: number

  @Property()
  singular: boolean

  @OneToMany({ entity: () => User, mappedBy: 'organization' })
  users = new Collection<User>(this)

  static createDxOrg(handle: string): string {
    return `org-pfda..${handle}`
  }

  getDxOrg(): string {
    return Organization.createDxOrg(this.handle)
  }

  isLegacy(): boolean {
    return this.users.length > 1
  }
}
