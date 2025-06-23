import { Entity, ManyToOne, Property, Ref, Reference } from '@mikro-orm/core'
import { config } from '@shared/config'
import { User } from '@shared/domain/user/user.entity'
import { TimeUtils } from '@shared/utils/time.utils'
import { BaseEntity } from '../../database/base.entity'

@Entity({ tableName: 'sessions' })
export class Session extends BaseEntity {
  @Property()
  key: string

  @ManyToOne({ entity: () => User, fieldName: 'user_id' })
  user!: Ref<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  // ref: app/models/session.rb#expired?
  isExpired(): boolean {
    return this.updatedAt.getTime() < TimeUtils.minutesAgoInMiliseconds(config.maxInactivityMinutes)
  }

  expiredAt(): number {
    return TimeUtils.floorMilisecondsToSeconds(
      this.updatedAt.getTime() + TimeUtils.minutesToMilliseconds(config.maxInactivityMinutes),
    )
  }
}
