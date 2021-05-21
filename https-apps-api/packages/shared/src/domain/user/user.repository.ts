import { EntityRepository } from '@mikro-orm/core'
import { User } from '..'

export class UserRepository extends EntityRepository<User> {
  async findWithEmailSettings(userIds: number[]): Promise<User[]> {
    return await this.find(
      {
        id: { $in: userIds },
      },
      { populate: ['emailNotificationSettings'] },
    )
  }
}
