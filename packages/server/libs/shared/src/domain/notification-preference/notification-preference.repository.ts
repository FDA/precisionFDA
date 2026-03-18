import { EntityRepository } from '@mikro-orm/mysql'
import { NotificationPreference } from './notification-preference.entity'

export class NotificationPreferenceRepository extends EntityRepository<NotificationPreference> {}
