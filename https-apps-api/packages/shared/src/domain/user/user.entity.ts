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
import { ExpertQuestion } from '../expert-question/expert-question.entity'
import { Expert } from '../expert/expert.entity'
import { AdminGroup } from '../admin-group/admin-group.entity'
import { AdminMembership } from '../admin-membership/admin-membership.entity'

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

  @ManyToOne({ fieldName: 'org_id', entity: () => Organization })
  organization!: IdentifiedReference<Organization>

  @OneToOne({
    entity: () => EmailNotification,
    mappedBy: 'user',
    nullable: true,
  })
  emailNotificationSettings: IdentifiedReference<EmailNotification>;

  [EntityRepositoryType]?: UserRepository

  @OneToOne({
    entity: () => Expert,
    mappedBy: 'user',
    orphanRemoval: true
  })
  expert: IdentifiedReference<Expert>

  @OneToMany({
    entity: () => ExpertQuestion,
    mappedBy: 'user',
    orphanRemoval: true
  })
  expertQuestions = new Collection<ExpertQuestion>(this)

  @OneToMany({
    entity: () => AdminMembership,
    mappedBy: 'user'
  })
  adminMembership = new Collection<AdminMembership>(this);


  constructor(org: Organization, emailNotificationSettings?: EmailNotification, expert?: Expert) {
    super()
    this.organization = Reference.create(org)
    if (emailNotificationSettings) {
      this.emailNotificationSettings = Reference.create(emailNotificationSettings)
    }
    if (expert) {
      this.expert = Reference.create(expert)
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
