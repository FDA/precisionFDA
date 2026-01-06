import { Collection, SqlEntityManager, wrap } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import {
  DbClusterAccessControlEncryptor,
  UserMapping,
} from '@shared/domain/db-cluster/access-control/db-cluster-access-control-encryptor'
import { UsersDbClustersSaltService } from '@shared/domain/db-cluster/access-control/users-db-clusters-salt.service'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DB_SYNC_STATUS, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { isStateTerminal } from '@shared/domain/job/job.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { UserService } from '@shared/domain/user/service/user.service'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ClientRequestError, ErrorCodes, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { JobCreateParams } from '@shared/platform-client/platform-client.params'
import {
  DbClusterDescribeResponse,
  JobDescribeResponse,
} from '@shared/platform-client/platform-client.responses'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'
import { removeRepeatable } from '@shared/queue'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { SyncDbClusterJob, SyncDbClusterJobOutput } from '@shared/queue/task.input'
import { Job } from 'bull'
import { invertObj } from 'ramda'

@Injectable()
export class DbClusterSynchronizeFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly dbClusterService: DbClusterService,
    private readonly userService: UserService,
    private readonly userContext: UserContext,
    private readonly userClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
    private readonly spaceService: SpaceService,
    private readonly saltService: UsersDbClustersSaltService,
    private readonly mainJobProducer: MainQueueJobProducer,
    private readonly notificationService: NotificationService,
  ) {}

  async synchronizeInSpace(spaceId: number): Promise<void> {
    this.logger.log(
      { spaceId: spaceId, userId: this.userContext.id },
      'Starting synchronization of all DbClusters in space.',
    )
    const user = await this.userContext.loadEntity()

    const dbClusters = await this.dbClusterService.getAllFromSpace(spaceId)

    this.logger.log(
      { dbClusters: dbClusters, userId: this.userContext.id },
      'DbClusters to synchronize.',
    )
    for (const dbc1 of dbClusters.filter((dbc) => dbc.status === STATUS.AVAILABLE)) {
      await this.syncDbCluster(dbc1, user)
    }
  }

  private async getSalt(userId: number, dbClusterId: number): Promise<string> {
    const saltEntity = await this.saltService.getUsersDbClustersSaltByDbClusterAndUser(
      dbClusterId,
      userId,
    )

    if (!saltEntity) {
      const user = await this.userService.getUserById(userId)
      if (!user) {
        this.logger.error({ userId: userId }, 'User does not exist.')
        throw new NotFoundError(`User ${userId} not found`)
      }
      const dbCluster = await this.dbClusterService.getAccessibleById(dbClusterId)
      if (!dbCluster) {
        this.logger.error(
          { userId: userId, dbClusterId: dbClusterId },
          `DbCluster does not exist or is not accessible by user.`,
        )
        throw new NotFoundError('DbCluster not found or not accessible')
      }

      const newSalt = this.saltService.createUsersDbClustersSalt(
        user,
        dbCluster,
        DbClusterAccessControlEncryptor.generateSalt(),
      )

      await this.em.persistAndFlush(newSalt)
      return newSalt.salt
    }

    return saltEntity.salt
  }

  private async mapUsers(
    membershipCollection: Collection<SpaceMembership, object>,
    dbCluster: DbCluster,
  ): Promise<UserMapping[]> {
    return await Promise.all(
      membershipCollection
        .filter((membership) => membership.active)
        .map(async (membership) => {
          const username = (await membership.user.load()).dxuser
          const salt = await this.getSalt(membership.user.id, dbCluster.id)
          const password = DbClusterAccessControlEncryptor.generatePassword(username, salt)

          return {
            username: username,
            psw: password,
            role: membership.role === SPACE_MEMBERSHIP_ROLE.VIEWER ? 'viewer' : 'contributor',
          }
        }),
    )
  }

  private async terminatePreviousDbSyncJobs(
    projectId: string,
    dbCluster: DbCluster,
  ): Promise<{ id: string }[]> {
    // In order to terminate other user's sync job ADMIN privileges are required
    let platformClient = this.userClient
    if (dbCluster.isInSpace()) {
      const spaceId = dbCluster.getSpaceId()
      const space = await this.spaceService.getAccessibleById(spaceId)
      if (!space) {
        this.logger.warn(
          { userId: this.userContext.id, dbclusterId: dbCluster.id, projectId: projectId },
          `User cannot terminate jobs in the project.`,
        )

        throw new PermissionError(`Unable to synchronize DbCluster in selected context.`, {
          statusCode: 403,
        })
      }

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }
    const searchInput = {
      project: projectId,
      name: `DbCluster Synchronization - ${dbCluster.dxid}`,
      state: [
        'idle',
        'waiting_on_input',
        'runnable',
        'running',
        'waiting_on_output',
        'restarted',
        'restartable',
      ],
      describe: false,
    }
    const ids = await platformClient.jobFind(searchInput)

    ids.results.forEach(async (r) => await platformClient.jobTerminate({ jobId: r.id }))
    return ids.results.map((j) => {
      return { id: j.id }
    })
  }

  async syncDbCluster(dbCluster: DbCluster, user: User): Promise<void> {
    this.logger.log(
      {
        dxid: dbCluster.dxid,
        scope: dbCluster.scope,
        user: user.dxid,
      },
      'Starting access-control synchronization of DbCluster',
    )

    await this.em.transactional(async () => {
      let projectId = ''
      let usersMap = null
      let platformClient = this.userClient
      if (dbCluster.isPrivate()) {
        if (user.id != dbCluster.user.id) {
          this.logger.error(
            { userId: user.id, dbClusterId: dbCluster.id },
            'User cannot synchronize DbCluster.',
          )
          throw new PermissionError('Unable to synchronize DbCluster in selected context.', {
            statusCode: 403,
          })
        }
        const username = user.dxuser
        const salt = await this.getSalt(user.id, dbCluster.id)
        const password = DbClusterAccessControlEncryptor.generatePassword(username, salt)

        usersMap = [
          {
            username: username,
            psw: password,
            role: 'contributor',
          },
        ]
        projectId = user.privateFilesProject
      } else {
        const spaceId = getIdFromScopeName(dbCluster.scope)
        const space = await this.spaceService.getAccessibleById(spaceId)
        if (!space) {
          this.logger.warn(
            { userId: user.id, space: spaceId, dbClusterId: dbCluster.id },
            'User cannot synchronize DbCluster in given space.',
          )
          throw new PermissionError('Unable to synchronize DbCluster in selected context.', {
            statusCode: 403,
          })
        }
        const spaceMemberships = await space.spaceMemberships.init()
        const membership = spaceMemberships.getItems().find((m) => m.user.id === user.id)

        // When user has only viewer role, adminClient needs to be used to run sync job on DbCluster
        platformClient =
          membership.role === SPACE_MEMBERSHIP_ROLE.VIEWER ? this.adminClient : platformClient
        projectId = space.hostProject
        usersMap = await this.mapUsers(spaceMemberships, dbCluster)
      }

      if (!projectId) {
        this.logger.warn(
          { user: user, dbCluster: dbCluster },
          'Project to run DbCluster synchronization app not found.',
        )
        throw new NotFoundError(
          'Could not determine project for selected context, cannot run DbCluster synchronization app.',
          {
            code: ErrorCodes.PROJECT_NOT_FOUND,
          },
        )
      }

      const dbClusterPassword = DbClusterAccessControlEncryptor.generatePassword(
        config.dbCluster.passwordSecret,
        dbCluster.salt,
      )

      const appInput = {
        db_cluster_id: dbCluster.dxid,
        db_cluster_admin_username: 'root',
        db_cluster_admin_password: dbClusterPassword,
        users_mapping: usersMap,
      }
      const encryptedInput = DbClusterAccessControlEncryptor.encryptData(
        appInput,
        config.dbCluster.synchronizationApp.encryptionKey,
      )
      const jobInput: JobCreateParams = {
        appId: config.dbCluster.synchronizationApp.id,
        project: projectId,
        name: `DbCluster Synchronization - ${dbCluster.dxid}`,
        costLimit: 20,
        input: { encrypted_input_json: encryptedInput },
      }

      const terminatedJobs = await this.terminatePreviousDbSyncJobs(projectId, dbCluster)
      this.logger.log(
        {
          dxid: dbCluster.dxid,
          scope: dbCluster.scope,
          user: user.dxid,
          terminatedJobs: terminatedJobs,
        },
        'Previous running jobs were terminated',
      )

      this.logger.log(
        {
          dxid: dbCluster.dxid,
          scope: dbCluster.scope,
          user: user.dxid,
          jobInput: jobInput,
        },
        'Invoking DbCluster synchronization app with jobInput',
      )

      const syncJobId = await platformClient.jobCreate(jobInput)
      this.logger.log(
        {
          dxid: dbCluster.dxid,
          scope: dbCluster.scope,
          user: user.dxid,
          syncJobId: syncJobId,
        },
        'DbCluster synchronization job created',
      )
      await this.mainJobProducer.createDbClusterSyncJobOutputTask(
        { jobDxid: syncJobId.id, dbClusterUid: dbCluster.uid },
        this.userContext,
      )
      await this.dbClusterService.updateSyncStatus(dbCluster.uid, DB_SYNC_STATUS.IN_PROGRESS)
    })
  }

  async syncDbClusterStatus(job: Job<SyncDbClusterJob>): Promise<void> {
    this.logger.log({ job: job }, 'Starting DbCluster synchronization process.')
    const { payload } = job.data

    const user = await this.userService.getUserById(job.data.user.id)
    if (!user) {
      this.logger.warn({ user: job.data.user.id }, 'User does not exist.')
      await removeRepeatable(job)
      return
    }

    const dbCluster = await this.dbClusterService.getAccessibleByDxId(payload.dxid)
    if (!dbCluster) {
      this.logger.warn(
        { userId: this.userContext.id, dbClusterDxId: payload.dxid },
        `DbCluster does not exist or is not editable/accessible by user.`,
      )
      await removeRepeatable(job)
      return
    }

    this.logger.log({ dbClusterId: dbCluster.id, dbClusterDxid: dbCluster.dxid }, 'Processing job')

    if (dbCluster.status === STATUS.TERMINATED) {
      this.logger.log({ job, dbCluster }, 'DbCluster already has terminated status. Removing task')
      await removeRepeatable(job)
      return
    }

    let describeDbClusterRes: DbClusterDescribeResponse
    try {
      describeDbClusterRes = await this.userClient.dbClusterDescribe({
        dxid: dbCluster.dxid,
        project: dbCluster.project,
      })
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
          await removeRepeatable(job)
        }
      } else {
        this.logger.log({ error: err }, 'Unhandled error from dbcluster/describe, will retry later')
      }
      return
    }

    this.logger.log(
      { data: describeDbClusterRes },
      'Received DbCluster describe response from platform',
    )

    const currentStatus: string = STATUSES[invertObj(STATUS)[dbCluster.status]].toString()

    if (
      currentStatus === describeDbClusterRes.status &&
      dbCluster.host === describeDbClusterRes.endpoint &&
      dbCluster.port === describeDbClusterRes.port?.toString()
    ) {
      this.logger.log(
        { dxid: dbCluster.dxid },
        'Status, endpoint or port have not been changed, no updates',
      )
      return
    }

    if (
      (currentStatus === STATUSES.CREATING || currentStatus === STATUSES.STARTING) &&
      describeDbClusterRes.status === STATUSES.AVAILABLE
    ) {
      await this.syncDbCluster(dbCluster, user)
    }

    this.logger.log(
      {
        dxid: dbCluster.dxid,
        fromState: currentStatus,
        toState: describeDbClusterRes.status,
      },
      'Updating DbCluster properties from the platform',
    )

    const updatedDbCluster = wrap(dbCluster).assign(
      {
        status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
        statusAsOf: new Date(describeDbClusterRes.statusAsOf),
        host: describeDbClusterRes.endpoint,
        port: describeDbClusterRes.port?.toString(),
        ...(describeDbClusterRes.failureReason && {
          failureReason: describeDbClusterRes.failureReason,
        }),
      },
      { em: this.em },
    )
    await this.em.flush()

    const statusChangedToDesired =
      currentStatus !== describeDbClusterRes.status &&
      ['available', 'stopped', 'terminated'].includes(describeDbClusterRes.status)

    const message = statusChangedToDesired
      ? `Database "${dbCluster.name}" updated. Current status - ${describeDbClusterRes.status}`
      : `Database "${dbCluster.name}" updated.`

    await this.notificationService.createNotification({
      message: message,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
      userId: this.userContext.id,
      sessionId: this.userContext.sessionId,
    })

    this.logger.debug({ dbCluster: updatedDbCluster }, 'Updated DbCluster')
  }

  async syncDbClusterJobOutput(job: Job<SyncDbClusterJobOutput>): Promise<void> {
    this.logger.log({ job: job }, 'Checking state of DbCluster synchronization platform job.')
    const { payload } = job.data

    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.userClient.jobDescribe({
        jobDxId: payload.jobDxid,
      })
    } catch (err) {
      if (err instanceof ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
          await this.dbClusterService.updateSyncStatus(payload.dbClusterUid, DB_SYNC_STATUS.FAILED)
          await removeRepeatable(job)
        }
      } else {
        this.logger.log({ error: err }, 'Unhandled error from job/describe, will retry later')
      }
      return
    }

    delete platformJobData['sshHostKey']
    this.logger.log(
      { platformJobData: platformJobData },
      'Received DbCluster sync job/describe from platform',
    )

    const remoteState = platformJobData.state

    if (isStateTerminal(remoteState)) {
      this.logger.debug(
        { remoteState, job: payload.jobDxid, dbCluster: payload.dbClusterUid },
        'Remote DbCluster sync job state is terminal',
      )
      let msg = []
      let syncStatus = DB_SYNC_STATUS.FAILED
      const ws = this.userClient.streamJobLogs(payload.jobDxid)

      const WS_TIMEOUT_MS = 60000
      const wsTimeout = setTimeout(async () => {
        ws.terminate()
      }, WS_TIMEOUT_MS)

      ws.on('message', async (data) => {
        try {
          const logStr = data.toString()
          const log = JSON.parse(logStr)
          msg.push(log)

          if (log['source'] === 'APP' && log['msg'] === 'Synchronization completed!') {
            syncStatus = DB_SYNC_STATUS.COMPLETED
          }

          // close signal from platform
          if (log['source'] === 'SYSTEM' && log['msg'] === 'END_LOG') {
            this.logger.log(
              { job: payload.jobDxid, dbCluster: payload.dbClusterUid, log: msg },
              `Complete log of the DbCluster sync ${payload.jobDxid}`,
            )
            clearTimeout(wsTimeout)
            await this.dbClusterService.updateSyncStatus(payload.dbClusterUid, syncStatus)
            await removeRepeatable(job)
            ws.terminate()
            return
          }
        } catch (error) {
          this.logger.error(
            { job: payload.jobDxid, dbCluster: payload.dbClusterUid },
            `Failed to parse DbCluster sync job log: ${error}`,
          )
          clearTimeout(wsTimeout)
          await this.dbClusterService.updateSyncStatus(payload.dbClusterUid, syncStatus)
          await removeRepeatable(job)
          ws.terminate()
        }
      })
    } else {
      this.logger.log(
        { job: payload.jobDxid, dbCluster: payload.dbClusterUid },
        'DbCluster sync job is not in terminal state. Will retry later...',
      )
      return
    }
  }
}
