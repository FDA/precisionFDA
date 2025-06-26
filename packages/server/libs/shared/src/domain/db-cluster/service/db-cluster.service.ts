import {
  Collection,
  FilterQuery,
  Loaded,
  LoadedCollection,
  SqlEntityManager,
  wrap,
} from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/create-db-cluster.dto'
import { UpdateDbClusterDTO } from '@shared/domain/db-cluster/dto/update-db-cluster.dto'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  reportNonTerminatedDbClustersTemplate,
  ReportNonTerminatedDbClustersTemplateInput,
} from '@shared/domain/email/templates/mjml/report-non-terminated-dbclusters.template'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError, NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import {
  DbClusterDescribeResponse,
  JobDescribeResponse,
} from '@shared/platform-client/platform-client.responses'
import { getMainQueue, removeRepeatable } from '@shared/queue'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { invertObj, omit } from 'ramda'
import { encryptData, generatePassword, generateSalt } from '../access-control/utils'
import { config } from '@shared/config'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { getIdFromScopeName, getProjectDxid } from '@shared/domain/space/space.helper'
import * as errors from '../../../errors'
import { DbClusterDTO } from '../dto/db-cluster.dto'
import { DbClusterPaginationDTO } from '../dto/db-cluster-pagination.dto'
import { DbClusterRepository } from '../db-cluster.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { JobCreateParams } from '@shared/platform-client/platform-client.params'
import { SyncDbClusterJob, SyncDbClusterJobOutput } from '@shared/queue/task.input'
import { Job } from 'bull'
import { createDbClusterPasswordRotated } from '@shared/domain/event/event.helper'
import { isStateTerminal } from '@shared/domain/job/job.helper'
import { UsersDbClustersSaltRepository } from '../access-control/users-db-clusters-salt.repository'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class DbClusterService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly userClient: PlatformClient,
    private readonly mainJobProducer: MainQueueJobProducer,
    private readonly emailsJobProducer: EmailQueueJobProducer,
    private readonly dbClusterRepo: DbClusterRepository,
    private readonly userRepo: UserRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
    private readonly saltRepo: UsersDbClustersSaltRepository,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {}

  public async checkNonTerminatedDbClusters() {
    const nonTerminatedDbClusters = await this.dbClusterRepo.find(
      {},
      {
        filters: ['isNonTerminal'],
        orderBy: { createdAt: 'DESC' },
        populate: ['user'],
      },
    )
    nonTerminatedDbClusters.forEach(async (nonTerminatedDbCluster) => {
      const dbSyncOperation = await getMainQueue().getJob(
        SyncDbClusterOperation.getBullJobId(nonTerminatedDbCluster.dxid),
      )
      if (!dbSyncOperation) {
        this.logger.warn(
          {
            user: nonTerminatedDbCluster.user.getEntity().dxuser,
            dbCluster: nonTerminatedDbCluster,
          },
          'CheckNonTerminatedDbClustersOperation: Missing sync operation for unterminated database, ' +
            'it will be recreated the next time the user logs in.',
        )
      }
    })
    const adminUser = await this.userRepo.findAdminUser()
    const body = buildEmailTemplate<ReportNonTerminatedDbClustersTemplateInput>(
      reportNonTerminatedDbClustersTemplate,
      {
        receiver: adminUser,
        content: {
          nonTerminatedDbClusters: nonTerminatedDbClusters.map((dbcluster) => ({
            uid: dbcluster.uid,
            name: dbcluster.name,
            dxuser: dbcluster.user.getEntity().dxuser,
            status: STATUSES[invertObj(STATUS)[dbcluster.status]],
            dxInstanceClass: dbcluster.dxInstanceClass,
            duration: dbcluster.elapsedTimeSinceCreationString(),
          })),
        },
      },
    )

    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.nonTerminatedDbClusters,
      to: adminUser.email,
      body,
      subject: 'Non-terminated dbclusters',
    }
    const emailToPfda: EmailSendInput = {
      emailType: EMAIL_TYPES.nonTerminatedDbClusters,
      to: 'precisionfda-no-reply@dnanexus.com',
      body,
      subject: 'Non-terminated dbclusters',
    }

    await this.emailsJobProducer.createSendEmailTask(email, undefined)
    await this.emailsJobProducer.createSendEmailTask(emailToPfda, undefined)

    return nonTerminatedDbClusters
  }

  async create(input: CreateDbClusterDTO) {
    this.logger.log({ input: input, userId: this.user.id }, 'Creating DbCluster')
    let project = ''
    let platformClient = this.userClient
    const user = await this.userRepo.findOne({ id: this.user.id })
    if (!user) {
      this.logger.warn({ user: this.user }, 'User does not exist.')
      throw new NotFoundError(`User ${this.user.id} not found`)
    }

    if (input.scope === STATIC_SCOPE.PRIVATE) {
      project = user.privateFilesProject
    } else {
      const spaceId = getIdFromScopeName(input.scope)
      const space = await this.spaceRepo.findOne(
        { id: spaceId, state: SPACE_STATE.ACTIVE },
        {
          populate: ['spaceMemberships', 'spaceMemberships.user'],
        },
      )
      const membership = await this.spaceMembershipRepo.findOne({
        spaces: spaceId,
        user: user,
        active: true,
        role: { $ne: SPACE_MEMBERSHIP_ROLE.VIEWER },
      })

      if (space == null || membership == null) {
        this.logger.warn(
          { userId: user.id, space: space, membership: membership },
          'User cannot create DbCluster in given space.',
        )

        throw new errors.PermissionError('Unable to create DbCluster in selected context.', {
          statusCode: 401,
        })
      }

      project = getProjectDxid(space, membership)

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }

    if (!project) {
      this.logger.warn({ userId: user.id, input: input }, 'Project to create DbCluster not found.')
      throw new NotFoundError(`Couldn't get project to create DbCluster in selected context.`, {
        code: errors.ErrorCodes.PROJECT_NOT_FOUND,
      })
    }

    const salt = generateSalt()
    const password = generatePassword(config.dbCluster.passwordSecret, salt)

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

    const dbCluster = await this.persistDbCluster(input, describeDbClusterRes, salt)
    await this.mainJobProducer.createDbClusterSyncTask({ dxid: dbCluster.dxid }, this.user)

    this.logger.log({ dbClusterId: dbCluster.id }, 'DbCluster created.')
    return dbCluster
  }

  private async persistDbCluster(
    input: CreateDbClusterDTO,
    describeDbClusterRes: DbClusterDescribeResponse,
    salt: string,
  ): Promise<DbCluster> {
    const dbCluster = this.dbClusterRepo.create({
      user: this.userRepo.getReference(this.user.id),
      dxid: describeDbClusterRes.id,
      uid: `${describeDbClusterRes.id}-1`,
      name: describeDbClusterRes.name,
      status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
      project: describeDbClusterRes.project,
      dxInstanceClass: describeDbClusterRes.dxInstanceClass,
      engine: ENGINE[invertObj(ENGINES)[describeDbClusterRes.engine]],
      engineVersion: describeDbClusterRes.engineVersion,
      host: describeDbClusterRes.endpoint,
      port: describeDbClusterRes.port,
      scope: input.scope,
      description: input.description,
      statusAsOf: describeDbClusterRes.statusAsOf
        ? new Date(describeDbClusterRes.statusAsOf)
        : null,
      salt: salt,
    })

    await this.em.persistAndFlush(dbCluster)

    return dbCluster
  }

  async update(uid: Uid<'dbcluster'>, body: UpdateDbClusterDTO) {
    this.logger.log({ body: body, userId: this.user.id }, 'Updating DbCluster')
    const dbCluster = await this.dbClusterRepo.findOne({ uid: uid })

    if (!dbCluster) {
      this.logger.warn({ uid: uid, userId: this.user.id }, 'DbCluster does not exist.')
      throw new NotFoundError(`DbCluster ${uid} not found`)
    }

    if (dbCluster.isPrivate() && dbCluster.user.id !== this.user.id) {
      this.logger.warn(
        { uid: uid, userId: this.user.id },
        'User cannot update DbCluster - not owner.',
      )
      throw new PermissionError(`Unable to update DbCluster in selected context.`, {
        statusCode: 401,
      })
    }

    if (dbCluster.isInSpace()) {
      const spaceId = dbCluster.getSpaceId()

      const user = await this.userRepo.findOneOrFail({ id: this.user.id })
      const space = await this.spaceRepo.findOne({ id: spaceId, state: SPACE_STATE.ACTIVE })
      const membership = await this.spaceMembershipRepo.findOne({
        spaces: spaceId,
        user: user,
        active: true,
        role: { $ne: SPACE_MEMBERSHIP_ROLE.VIEWER },
      })

      if (space == null || membership == null) {
        this.logger.warn(
          { userId: this.user.id, space: space, membership: membership },
          'User cannot update DbCluster - Insufficient privileges.',
        )

        throw new errors.PermissionError('Unable to update DbCluster in selected context.', {
          statusCode: 401,
        })
      }
    }

    return await this.em.transactional(async () => {
      dbCluster.name = body.name
      dbCluster.description = body.description
      // await this.em.persistAndFlush(dbCluster)
    })
  }

  async synchronizeInSpace(spaceId: number) {
    this.logger.log(
      { spaceId: spaceId, userId: this.user.id },
      'Starting synchronization of all DbClusters in space.',
    )
    const dbClusters = await this.dbClusterRepo.find({ scope: `space-${spaceId}` })
    const user = await this.userRepo.findOne({ id: this.user.id })

    this.logger.log({ dbClusters: dbClusters, userId: this.user.id }, 'DbClusters to synchronize.')
    dbClusters
      .filter((dbc) => dbc.status === STATUS.AVAILABLE)
      .forEach((dbc) => this.syncDbCluster(dbc, user))
  }

  async getPassword(uid: Uid<'dbcluster'>) {
    this.logger.log({ uid: uid, userId: this.user.id }, 'Getting password for DbCluster.')
    const dbCluster = await this.dbClusterRepo.findOne({ uid: uid })
    if (!dbCluster) {
      this.logger.warn({ uid: uid, userId: this.user.id }, 'DbCluster does not exist.')
      throw new NotFoundError(`DbCluster ${uid} not found.`)
    }

    const user = await this.userRepo.findOne({ id: this.user.id })
    if (!user) {
      this.logger.warn({ user: this.user }, 'User does not exist.')
      throw new NotFoundError(`User ${this.user.id} not found`)
    }

    await this.checkDbClusterAccessibility(dbCluster, user)

    if ([STATUS.TERMINATED, STATUS.TERMINATING].includes(dbCluster.status)) {
      this.logger.log(
        { dbClusterId: dbCluster.id, status: dbCluster.status, userId: this.user.id },
        `Cannot get password for DbCluster that is ${dbCluster.status}.`,
      )
      throw new InvalidStateError(`DbCluster is ${STATUSES[invertObj(STATUS)[dbCluster.status]]}.`)
    }

    const salt = await this.saltRepo.findOne({
      dbcluster: { id: dbCluster.id },
      user: { id: this.user.id },
    })
    if (!salt || !salt.salt) {
      this.logger.warn(
        { dbClusterId: dbCluster.id, userId: this.user.id, dbClusterUid: dbCluster.uid },
        'UsersDbClustersSalt for user and dbcluster does not exist.',
      )
      throw new Error(`Error getting password.`)
    }

    return generatePassword(this.user.dxuser, salt.salt)
  }

  async rotatePassword(uid: Uid<'dbcluster'>) {
    this.logger.log({ uid: uid, userId: this.user.id }, 'Rotating password for DbCluster.')
    const dbCluster = await this.dbClusterRepo.findOne({ uid: uid })
    if (!dbCluster) {
      this.logger.warn({ uid: uid, userId: this.user.id }, 'DbCluster does not exist.')
      throw new NotFoundError(`DbCluster ${uid} not found.`)
    }

    const user = await this.userRepo.findOne({ id: this.user.id })
    if (!user) {
      this.logger.warn({ user: this.user }, 'User does not exist.')
      throw new NotFoundError(`User ${this.user.id} not found`)
    }

    await this.checkDbClusterAccessibility(dbCluster, user)

    if (dbCluster.status === STATUS.TERMINATED || dbCluster.status === STATUS.TERMINATING) {
      this.logger.log(
        { dbClusterId: dbCluster.id, status: dbCluster.status, userId: this.user.id },
        `Cannot get password for DbCluster that is ${dbCluster.status}.`,
      )
      throw new InvalidStateError(`DbCluster is ${STATUSES[invertObj(STATUS)[dbCluster.status]]}.`)
    }

    const salt = await this.saltRepo.findOne({
      dbcluster: { id: dbCluster.id },
      user: { id: this.user.id },
    })
    if (!salt || !salt.salt) {
      this.logger.warn(
        { dbClusterId: dbCluster.id, userId: this.user.id, dbClusterUid: dbCluster.uid },
        'UsersDbClustersSalt for user and dbcluster does not exist.',
      )
      throw new Error(`Error rotating password.`)
    }

    return await this.em.transactional(async () => {
      salt.salt = generateSalt()
      // await this.em.persistAndFlush(salt)
      const user = await this.userRepo.findOne({ id: this.user.id })

      if (dbCluster.status === STATUS.AVAILABLE) {
        await this.syncDbCluster(dbCluster, user)
      }

      await this.createPasswordRotatedEvent(user, dbCluster)
      return generatePassword(this.user.dxuser, salt.salt)
    })
  }

  async getDbCluster(uid: Uid<'dbcluster'>) {
    this.logger.log({ uid: uid, userId: this.user.id }, 'Getting DbCluster data.')
    const dbCluster = await this.dbClusterRepo.findOne(
      { uid: uid },
      { populate: ['user', 'properties', 'taggings.tag'] },
    )
    if (!dbCluster) {
      this.logger.warn({ uid: uid, userId: this.user.id }, 'DbCluster does not exist.')
      throw new NotFoundError(`DbCluster ${uid} not found.`)
    }

    const user = await this.userRepo.findOne({ id: this.user.id })

    if (dbCluster.isPrivate()) {
      if (dbCluster.user.id !== this.user.id) {
        this.logger.warn(
          { dbCluster: dbCluster, userId: this.user.id },
          'User does not have access to DbCluster.',
        )
        throw new PermissionError(`You don't have access to this DbCluster`)
      }
      return { db_cluster: DbClusterDTO.mapToDTO(dbCluster) }
    }

    const spaceId = getIdFromScopeName(dbCluster.scope)
    const space = await this.spaceRepo.findOne(
      { id: spaceId },
      {
        populate: ['spaceMemberships', 'spaceMemberships.user'],
      },
    )
    const membership = await this.spaceMembershipRepo.findOne({ spaces: spaceId, user: user })

    if (space == null || membership == null) {
      this.logger.warn(
        { userId: user.id, space: space, membership: membership },
        'User cannot get DbCluster in given space.',
      )
      throw new errors.PermissionError('Unable to get DbCluster in selected context.', {
        statusCode: 401,
      })
    }

    return { db_cluster: DbClusterDTO.mapToDTO(dbCluster, space) }
  }

  async list(pagination: DbClusterPaginationDTO) {
    this.logger.log({ pagination: pagination, userId: this.user.id }, 'Listing DbClusters.')
    const where = this.buildCommonFilters(pagination)
    const user = await this.userRepo.findOne({ id: this.user.id })

    if (pagination.scope === HOME_SCOPE.SPACES) {
      const memberships = await this.spaceMembershipRepo.find(
        {
          user: user,
        },
        { populate: ['spaces'] },
      )

      const scopes = memberships.flatMap((m) => m.spaces.toArray()).map((s) => s.scope)
      where.scope = { $in: scopes }
    } else if (pagination.scope === STATIC_SCOPE.PRIVATE) {
      where.scope = { $eq: 'private' }
      where.user = { $eq: this.user.id }
    } else {
      const spaceId = getIdFromScopeName(pagination.scope)
      const space = await this.spaceRepo.findOne(
        { id: spaceId },
        {
          populate: ['spaceMemberships', 'spaceMemberships.user'],
        },
      )
      const membership = await this.spaceMembershipRepo.findOne({
        spaces: spaceId,
        user: user,
      })

      if (space == null || membership == null) {
        this.logger.warn(
          { userId: user.id, space: space, membership: membership },
          'User cannot get DbCluster in given space.',
        )
        throw new errors.PermissionError('Unable to list DbClusters in selected context.', {
          statusCode: 401,
        })
      }

      where.scope = { $eq: pagination.scope }
    }
    this.logger.log(
      { userId: user.id, pagination: pagination, where: where },
      'Getting DbClusters for following query.',
    )
    return this.executeQuery(pagination, where)
  }

  private buildCommonFilters(pagination: DbClusterPaginationDTO) {
    const where: FilterQuery<DbCluster> = {}
    const { name, status, type, instance, tags } = pagination.filters ?? {}

    if (name) {
      where.name = { $like: `%${name}%` }
    }
    if (status) {
      const statusArr = this.getMatchedEnumValues(STATUS, status)
      where.status = { $in: statusArr }
    }
    if (type) {
      const typeArr = this.getMatchedEnumValues(ENGINE, type)
      where.engine = { $in: typeArr }
    }
    if (instance) {
      where.dxInstanceClass = { $like: `%${instance}%` }
    }
    if (tags) {
      const cleanedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      where.taggings = { tag: { name: { $in: cleanedTags } } }
    }

    return where
  }

  private async executeQuery(pagination: DbClusterPaginationDTO, where: FilterQuery<DbCluster>) {
    const response = await this.dbClusterRepo.paginate(pagination, where, {
      orderBy: { createdAt: 'DESC' },
      populate: ['user', 'properties', 'taggings.tag'],
    })
    const dbclusters = response.data.map((dbcluster) => DbClusterDTO.mapToDTO(dbcluster))
    return { ...response, data: dbclusters }
  }

  private getMatchedEnumValues = (
    enumObj: typeof STATUS | typeof ENGINE,
    text: string | typeof STATUSES | typeof ENGINES | undefined,
  ) => {
    if (!text) return []

    const searchTerm = text.toString().toLowerCase()

    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key)))
      .filter((key) => key.toLowerCase().includes(searchTerm))
      .map((key) => enumObj[key as keyof typeof enumObj])
      .map(Number)
  }

  private async getSalt(userId: number, dbClusterId: number): Promise<string> {
    const saltEntity = await this.saltRepo.findOne({
      dbcluster: { id: dbClusterId },
      user: { id: userId },
    })
    if (saltEntity === null || saltEntity.salt === null) {
      const newSalt = this.saltRepo.create({
        user: this.userRepo.getReference(userId),
        dbcluster: this.dbClusterRepo.getReference(dbClusterId),
        salt: generateSalt(),
      })

      await this.em.persistAndFlush(newSalt)
      return newSalt.salt
    }

    return saltEntity.salt
  }

  private async mapUsers(
    membershipCollection: Collection<SpaceMembership, object> &
      LoadedCollection<Loaded<SpaceMembership, 'user', '*', never>>,
    dbCluster: DbCluster,
  ) {
    return await Promise.all(
      membershipCollection
        .filter((membership) => membership.active)
        .map(async (membership) => {
          const username = membership.user.getEntity().dxuser
          const salt = await this.getSalt(membership.user.id, dbCluster.id)
          const password = generatePassword(username, salt)

          return {
            username: username,
            psw: password,
            role: membership.role === SPACE_MEMBERSHIP_ROLE.VIEWER ? 'viewer' : 'contributor',
          }
        }),
    )
  }

  private async terminatePreviousDbSyncJobs(projectId: string, dbCluster: DbCluster) {
    // In order to terminate other user's sync job ADMIN privileges are required
    let platformClient = this.userClient
    if (dbCluster.isInSpace()) {
      const spaceId = dbCluster.getSpaceId()
      const space = await this.spaceRepo.findOneOrFail({ id: spaceId })

      if (space.type === SPACE_TYPE.GROUPS || space.type === SPACE_TYPE.REVIEW) {
        platformClient = this.adminClient
      }
    }
    const searchInput = {
      project: projectId,
      name: `DBcluster Synchronization - ${dbCluster.dxid}`,
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

  private async syncDbCluster(dbCluster: DbCluster, user: User) {
    this.logger.log(
      {
        dxid: dbCluster.dxid,
        scope: dbCluster.scope,
        user: user.dxid,
      },
      'Starting access-control synchronization of dbcluster',
    )

    let projectId = ''
    let usersMap = null
    let platformClient = this.userClient
    if (dbCluster.isPrivate()) {
      if (user.id != dbCluster.user.id) {
        this.logger.warn(
          { userId: user.id, dbClusterId: dbCluster.id },
          'User cannot synchronize DbCluster.',
        )
        throw new errors.PermissionError('Unable to synchronize DbCluster in selected context.', {
          statusCode: 401,
        })
      }
      const username = user.dxuser
      const salt = await this.getSalt(user.id, dbCluster.id)
      const password = generatePassword(username, salt)

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
      const space = await this.spaceRepo.findOne(
        { id: spaceId, state: SPACE_STATE.ACTIVE },
        {
          populate: ['spaceMemberships', 'spaceMemberships.user'],
        },
      )
      const membership = await this.spaceMembershipRepo.findOne({
        spaces: spaceId,
        user: user,
        active: true,
      })

      if (space == null || membership == null) {
        this.logger.warn(
          { userId: user.id, space: space, membership: membership },
          'User cannot synchronize DbCluster in given space.',
        )
        throw new errors.PermissionError('Unable to synchronize DbCluster in selected context.', {
          statusCode: 401,
        })
      }

      // When user has only viewer role, adminClient needs to be used to run sync job on DbCluster
      platformClient =
        membership.role === SPACE_MEMBERSHIP_ROLE.VIEWER ? this.adminClient : platformClient
      projectId = space.hostProject
      usersMap = await this.mapUsers(space.spaceMemberships, dbCluster)
    }

    if (!projectId) {
      this.logger.warn(
        { user: user, dbCluster: dbCluster },
        'Project to run DbCluster synchronization app not found.',
      )
      throw new NotFoundError(
        'Could not determine project for selected context, cannot run DbCluster synchronization app.',
        {
          code: errors.ErrorCodes.PROJECT_NOT_FOUND,
        },
      )
    }

    const dbClusterPassword = generatePassword(config.dbCluster.passwordSecret, dbCluster.salt)

    const appInput = {
      db_cluster_id: dbCluster.dxid,
      db_cluster_admin_username: 'root',
      db_cluster_admin_password: dbClusterPassword,
      users_mapping: usersMap,
    }
    const encryptedInput = encryptData(appInput, config.dbCluster.synchronizationApp.encryptionKey)
    const jobInput: JobCreateParams = {
      appId: config.dbCluster.synchronizationApp.id,
      project: projectId,
      name: `DBcluster Synchronization - ${dbCluster.dxid}`,
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
      'Invoking dbcluster synchronization app with jobInput',
    )

    const syncJobId = await platformClient.jobCreate(jobInput)
    this.logger.log(
      {
        dxid: dbCluster.dxid,
        scope: dbCluster.scope,
        user: user.dxid,
        syncJobId: syncJobId,
      },
      'Dbcluster synchronization job created',
    )
    await this.mainJobProducer.createDbClusterSyncJobOutputTask({ dxid: syncJobId.id }, this.user)
  }

  private async createPasswordRotatedEvent(user: User, dbCluster: DbCluster): Promise<void> {
    this.logger.log(
      `Creating dbcluster password rotated event for dbcluster ${dbCluster.uid} and user ${user.id}`,
    )
    const event = await createDbClusterPasswordRotated(user, dbCluster)
    await this.em.persistAndFlush(event)
  }

  async syncDbClusterStatus(job: Job<SyncDbClusterJob>) {
    this.logger.log({ job: job }, 'Starting DbCluster synchronization process.')
    const { payload } = job.data

    const dbCluster = await this.dbClusterRepo.findOne({ dxid: payload.dxid })
    const user = await this.userRepo.findOne({ id: job.data.user.id })

    if (!dbCluster) {
      this.logger.warn({ payload }, 'DB Cluster does not exist.')
      await removeRepeatable(job)
      return
    }

    if (!user) {
      this.logger.warn({ payload }, 'User does not exist.')
      await removeRepeatable(job)
      return
    }

    this.logger.log({ dbClusterId: dbCluster.id, dbClusterDxid: dbCluster.dxid }, 'Processing job')

    if (dbCluster.status === STATUS.TERMINATED) {
      this.logger.log({ job, dbCluster }, 'DB Cluster already has terminated status. Removing task')
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
      if (err instanceof errors.ClientRequestError && err.props?.clientStatusCode) {
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
      'Received dbcluster describe response from platform',
    )

    const currentStatus: string = STATUSES[invertObj(STATUS)[dbCluster.status]].toString()

    if (
      currentStatus === describeDbClusterRes.status &&
      dbCluster.host == describeDbClusterRes.endpoint &&
      dbCluster.port == describeDbClusterRes.port?.toString()
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
      'Updating dbcluster properties from the platform',
    )

    const em = this.dbClusterRepo.getEntityManager()
    const updatedDbCluster = wrap(dbCluster).assign(
      {
        status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
        statusAsOf: new Date(describeDbClusterRes.statusAsOf),
        host: describeDbClusterRes.endpoint,
        port: describeDbClusterRes.port?.toString(),
      },
      { em },
    )
    await em.flush()

    this.logger.debug({ dbCluster: updatedDbCluster }, 'Updated dbcluster')
  }

  async syncDbClusterJobOutput(job: Job<SyncDbClusterJobOutput>) {
    this.logger.log({ job: job }, 'Checking state of DbCluster synchronization platform job.')
    const { payload } = job.data

    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.userClient.jobDescribe({
        jobId: payload.dxid,
      })
    } catch (err) {
      if (err instanceof errors.ClientRequestError && err.props?.clientStatusCode) {
        if (err.props.clientStatusCode === 401) {
          // Unauthorized. Expected scenario is that the user token has expired
          // Removing the sync task will allow a new sync task to be recreated
          // when user next logs in via UserCheckupTask
          this.logger.log({ error: err.props }, 'Received 401 from platform, removing sync task')
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
      'Received DBCluster sync job/describe from platform',
    )

    const remoteState = platformJobData.state

    if (isStateTerminal(remoteState)) {
      this.logger.debug(
        { remoteState, job: payload.dxid },
        'Remote DBCluster sync job state is terminal',
      )
      let msg = []
      const ws = this.userClient.streamJobLogs(payload.dxid)

      ws.on('message', async (data) => {
        try {
          const logStr = data.toString()
          const log = JSON.parse(logStr)
          msg.push(log)

          // close signal from platform
          if (log['source'] === 'SYSTEM' && log['msg'] === 'END_LOG') {
            this.logger.log(
              { job: payload.dxid, log: msg },
              `Complete log of the DBCluster sync ${payload.dxid}`,
            )
            await removeRepeatable(job)
            ws.terminate()
            return
          }
        } catch (error) {
          this.logger.error(
            { job: payload.dxid },
            `Failed to parse DBCluster sync job log: ${error}`,
          )
          await removeRepeatable(job)
          ws.terminate()
        }
      })
    } else {
      this.logger.log(
        { job: payload.dxid },
        'DBCluster sync job is not in terminal state. Will retry later...',
      )
      return
    }
  }

  private async checkDbClusterAccessibility(dbCluster: DbCluster, user: User): Promise<void> {
    if (dbCluster.isPrivate()) {
      if (user.id !== dbCluster.user.id) {
        this.logger.warn(
          { userId: user.id, dbClusterId: dbCluster.id },
          'User cannot access DbCluster.',
        )
        throw new errors.PermissionError('Unable to access DbCluster in selected context.', {
          statusCode: 401,
        })
      }
    } else {
      const spaceId = getIdFromScopeName(dbCluster.scope)
      const space = await this.spaceRepo.findOne({ id: spaceId, state: SPACE_STATE.ACTIVE })
      const membership = await this.spaceMembershipRepo.findOne({
        spaces: spaceId,
        user: user,
        active: true,
      })

      if (space == null || membership == null) {
        this.logger.warn(
          { userId: user.id, spaceId: spaceId, space: space, membership: membership },
          'User cannot access DbCluster in given space.',
        )
        throw new errors.PermissionError('Unable to access DbCluster in selected context.', {
          statusCode: 401,
        })
      }
    }
  }
}
