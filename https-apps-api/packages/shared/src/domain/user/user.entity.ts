import {
  Collection,
  Entity,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { Job } from '../job/job.entity'
import { Organization } from '../org'

// contains the bare minimum to work with the user instance
// might need to add more fields in the time
@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxuser: string

  @Property()
  privateFilesProject: string

  @Property()
  publicFilesProject: string

  @Property()
  schemaVersion: string

  @Property()
  orgId: string

  @Property()
  firstName: string

  @Property()
  lastName: string

  @Property()
  email: string

  @Property()
  normalizedEmail: string

  @Property({ hidden: true })
  userState: number

  @OneToMany({ entity: () => Job, mappedBy: 'user' })
  jobs = new Collection<Job>(this)

  @ManyToOne({ fieldName: 'org_id' })
  organization!: IdentifiedReference<Organization>

  constructor(org: Organization) {
    super()
    this.organization = Reference.create(org)
  }
}
