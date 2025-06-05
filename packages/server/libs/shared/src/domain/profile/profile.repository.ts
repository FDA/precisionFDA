import { EntityRepository } from '@mikro-orm/mysql'
import { Profile } from './profile.entity'

export class ProfileRepository extends EntityRepository<Profile> {}
