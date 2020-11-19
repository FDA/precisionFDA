import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { Job } from '../job/job.entity'

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
  jupyterProject: string

  @Property()
  ttydProject: string

  @Property()
  cloudWorkstationProject: string

  @Property()
  httpsProject: string

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
}
