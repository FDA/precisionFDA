import { Inject, Injectable, Logger } from '@nestjs/common'
import { STATIC_SCOPE } from '@shared/enums'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { PlatformClient } from '@shared/platform-client'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/create-db-cluster.dto'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ErrorCodes, NotFoundError, PermissionError } from '@shared/errors'
import { getIdFromScopeName, getProjectDxid } from '@shared/domain/space/space.helper'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { DbClusterAccessControlEncryptor } from '@shared/domain/db-cluster/access-control/db-cluster-access-control-encryptor'
import { config } from '@shared/config'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { omit } from 'ramda'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'

@Injectable()
export class DbClusterCreateFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly userContext: UserContext,
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly spaceService: SpaceService,
    private readonly mainJobProducer: MainQueueJobProducer,
  ) {}

  async createDbCluster(input: CreateDbClusterDTO): Promise<DbCluster> {
    this.logger.log({ input: input, userId: this.userContext.id }, 'Creating DbCluster')
    let project = ''
    let platformClient = this.userClient
    const user = await this.userContext.loadEntity()

    if (input.scope === STATIC_SCOPE.PRIVATE) {
      project = user.privateFilesProject
    } else {
      const spaceId = getIdFromScopeName(input.scope)
      const space = await this.spaceService.getEditableById(spaceId)
      if (!space) {
        this.logger.warn(
          { userId: user.id, spaceId: spaceId },
          'User cannot create DbCluster in given space.',
        )

        throw new PermissionError('Unable to create DbCluster in selected context.', {
          statusCode: 403,
        })
      }
      const membership = (await space.spaceMemberships.loadItems()).find(
        (m) => m.user.id === user.id,
      )

      project = getProjectDxid(space, membership)

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }

    if (!project) {
      this.logger.warn({ userId: user.id, input: input }, 'Project to create DbCluster not found.')
      throw new NotFoundError(`Couldn't get project to create DbCluster in selected context.`, {
        code: ErrorCodes.PROJECT_NOT_FOUND,
      })
    }

    const salt = DbClusterAccessControlEncryptor.generateSalt()
    const password = DbClusterAccessControlEncryptor.generatePassword(
      config.dbCluster.passwordSecret,
      salt,
    )

    const newCluster = await platformClient.dbClusterCreate({
      ...omit(['scope', 'description'], input),
      adminPassword: password,
      project: project,
    })
    this.logger.log({ response: newCluster }, 'Create DbCluster response.')

    const describeDbClusterRes = await this.userClient.dbClusterDescribe({
      dxid: newCluster.id,
      project: project,
    })
    this.logger.log({ response: describeDbClusterRes }, 'Describe DbCluster response.')

    const dbCluster = await this.dbClusterService.persistDbCluster(
      input,
      describeDbClusterRes,
      user,
      salt,
    )
    await this.mainJobProducer.createDbClusterSyncTask({ dxid: dbCluster.dxid }, this.userContext)

    this.logger.log({ dbClusterId: dbCluster.id }, 'DbCluster created.')
    return dbCluster
  }
}
