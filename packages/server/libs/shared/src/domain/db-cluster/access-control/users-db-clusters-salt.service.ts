import { Injectable, Logger } from '@nestjs/common'
import { UsersDbClustersSalt } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.entity'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DbCluster } from '../db-cluster.entity'
import { UsersDbClustersSaltRepository } from './users-db-clusters-salt.repository'

@Injectable()
export class UsersDbClustersSaltService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly saltRepo: UsersDbClustersSaltRepository) {}

  async getUsersDbClustersSaltByDbClusterAndUser(
    dbClusterId: number,
    userId: number,
  ): Promise<UsersDbClustersSalt> {
    return await this.saltRepo.findOne({ dbcluster: { id: dbClusterId }, user: { id: userId } })
  }

  createUsersDbClustersSalt(user: User, dbCluster: DbCluster, salt: string): UsersDbClustersSalt {
    return this.saltRepo.create({
      user: user,
      dbcluster: dbCluster,
      salt: salt,
    })
  }
}
