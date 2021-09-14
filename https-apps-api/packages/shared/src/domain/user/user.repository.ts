import { EntityRepository } from '@mikro-orm/core'
import { config } from '../../config'
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

  async findAdminUser(): Promise<User> {
    return await this.findOneOrFail({ dxuser: config.platform.adminUser })
  }
}
