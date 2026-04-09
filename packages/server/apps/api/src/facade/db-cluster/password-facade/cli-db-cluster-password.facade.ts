import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { invertObj } from 'ramda'
import { DbClusterAccessControlEncryptor } from '@shared/domain/db-cluster/access-control/db-cluster-access-control-encryptor'
import { UsersDbClustersSalt } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.entity'
import { UsersDbClustersSaltService } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.service'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError, NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DbClusterSynchronizeFacade } from '../synchronize-facade/db-cluster-synchronize.facade'

@Injectable()
export class CliDbClusterPasswordFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,
    private readonly usersDbClustersSaltService: UsersDbClustersSaltService,
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
  ) {}

  async getPassword(uid: Uid<'dbcluster'>): Promise<string> {
    this.logger.log({ uid: uid, userId: this.userContext.id }, 'Getting password for DbCluster.')

    const dbCluster = await this.validateAndGetDbCluster(uid)
    const salt = await this.getSalt(dbCluster)

    return DbClusterAccessControlEncryptor.generatePassword(this.userContext.dxuser, salt.salt)
  }

  async rotatePassword(uid: Uid<'dbcluster'>): Promise<string> {
    this.logger.log({ uid: uid, userId: this.userContext.id }, 'Rotating password for DbCluster.')
    const dbCluster = await this.validateAndGetDbCluster(uid)

    return await this.em.transactional(async () => {
      const salt = await this.getSalt(dbCluster)
      const user = await this.userContext.loadEntity()

      salt.salt = DbClusterAccessControlEncryptor.generateSalt()

      if (dbCluster.status === STATUS.AVAILABLE) {
        await this.dbClusterSynchronizeFacade.syncDbCluster(dbCluster, user)
      }

      await this.dbClusterService.createPasswordRotatedEvent(user, dbCluster)
      return DbClusterAccessControlEncryptor.generatePassword(this.userContext.dxuser, salt.salt)
    })
  }

  private async validateAndGetDbCluster(uid: Uid<'dbcluster'>): Promise<DbCluster> {
    const dbCluster = await this.dbClusterService.getAccessibleByUid(uid)
    if (!dbCluster) {
      this.logger.warn(
        { userId: this.userContext.id, dbClusterUid: uid },
        `DbCluster does not exist or is not accessible by user.`,
      )
      throw new NotFoundError('DbCluster not found or not accessible')
    }

    this.checkDbClusterState(dbCluster)

    return dbCluster
  }

  private async getSalt(dbCluster: DbCluster): Promise<UsersDbClustersSalt> {
    const salt = await this.usersDbClustersSaltService.getUsersDbClustersSaltByDbClusterAndUser(
      dbCluster.id,
      this.userContext.id,
    )

    if (salt) {
      return salt
    }

    this.logger.warn(
      { dbClusterId: dbCluster.id, userId: this.userContext.id },
      'UsersDbClustersSalt for user and dbcluster does not exist.',
    )
    throw new NotFoundError(`Error getting password.`, {
      statusCode: 404,
    })
  }

  private checkDbClusterState(dbCluster: DbCluster): void {
    if (dbCluster.status === STATUS.TERMINATED || dbCluster.status === STATUS.TERMINATING) {
      this.logger.log(
        { dbClusterId: dbCluster.id, status: dbCluster.status, userId: this.userContext.id },
        `Cannot get password for DbCluster that is ${dbCluster.status}.`,
      )
      throw new InvalidStateError(`DbCluster is ${STATUSES[invertObj(STATUS)[dbCluster.status]]}.`)
    }
  }
}
