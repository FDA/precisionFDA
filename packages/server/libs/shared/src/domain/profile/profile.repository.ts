import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { Profile } from './profile.entity'

export class ProfileRepository extends BaseEntityRepository<Profile> {
  async findByUserId(userId: number): Promise<Profile | null> {
    return this.findOne({ user: userId })
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.findOne({ email: email.toLowerCase() })
  }
}
