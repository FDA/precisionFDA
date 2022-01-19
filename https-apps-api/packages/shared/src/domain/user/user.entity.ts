import {
  Collection,
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { config } from '../../config'
import { SpaceMembership } from '..'
import { BaseEntity } from '../../database/base-entity'
import { EmailNotification } from '../email'
import { Job } from '../job/job.entity'
import { Organization } from '../org'
import { UserRepository } from './user.repository'

// contains the bare minimum to work with the user instance
// might need to add more fields in the time
@Entity({ tableName: 'users', customRepository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxuser: string

  @Property({ nullable: true })
  privateFilesProject?: string

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

  @Property({ nullable: true })
  lastLogin?: Date

  @Property({ hidden: true })
  userState: number

  @OneToMany({ entity: () => Job, mappedBy: 'user' })
  jobs = new Collection<Job>(this)

  @OneToMany({ entity: () => SpaceMembership, mappedBy: 'user' })
  spaceMemberships = new Collection<SpaceMembership>(this)

  @ManyToOne({ fieldName: 'org_id' })
  organization!: IdentifiedReference<Organization>

  @OneToOne({
    entity: () => EmailNotification,
    mappedBy: 'user',
    nullable: true,
  })
  emailNotificationSettings: IdentifiedReference<EmailNotification>;

  [EntityRepositoryType]?: UserRepository

  constructor(org: Organization, emailNotificationSettings?: EmailNotification) {
    super()
    this.organization = Reference.create(org)
    if (emailNotificationSettings) {
      this.emailNotificationSettings = Reference.create(emailNotificationSettings)
    }
  }

  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  @Property({ persist: false })
  get spaceUids(): string[] {
    const spaceUids: string[] = []
    Array.from(this.spaceMemberships).forEach(spaceMembership => {
      Array.from(spaceMembership.spaces).forEach(space => spaceUids.push(`space-${space.id}`))
    })
    return spaceUids
  }

  isMemberOfSpace(spaceUid: string): boolean {
    return Object.values(this.spaceUids).includes(spaceUid)
  }

  isChallengeBot(): boolean {
    return this.dxuser === config.users.challengeBotDxUser
  }

  isGuest(): boolean {
    return this.dxuser.startsWith('Guest-')
  }
}
