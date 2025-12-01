import { FilterQuery, Loaded, SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { ObjectFilterQuery } from '@shared/database/domain/object-filter-query'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import {
  DB_SYNC_STATUS,
  DB_SYNC_STATUSES,
  ENGINE,
  ENGINES,
  STATUS,
  STATUSES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/create-db-cluster.dto'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { Uid } from '@shared/domain/entity/domain/uid'
import { createDbClusterPasswordRotated } from '@shared/domain/event/event.helper'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { DbClusterDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { getMainQueue } from '@shared/queue'
import { invertObj } from 'ramda'
import { DbClusterRepository } from '../db-cluster.repository'
import { DbClusterPaginationDTO } from '../dto/db-cluster-pagination.dto'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'

@Injectable()
export class DbClusterService implements SearchableByUid<'dbcluster'> {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly dbClusterRepo: DbClusterRepository,
    private readonly userContext: UserContext,
    private readonly notificationService: NotificationService,
  ) {}
  getAccessibleEntityByUid(uid: Uid<'dbcluster'>): Promise<DbCluster | null> {
    return this.dbClusterRepo.findAccessibleOne({ uid: uid })
  }
  getEditableEntityByUid(uid: Uid<'dbcluster'>): Promise<DbCluster | null> {
    return this.dbClusterRepo.findEditableOne({ uid: uid })
  }

  async getNonTerminatedDbClusters(): Promise<DbCluster[]> {
    const nonTerminatedDbClusters = await this.dbClusterRepo.find(
      {},
      {
        filters: ['isNonTerminal'],
        orderBy: { createdAt: 'DESC' },
        populate: ['user'],
      },
    )

    for (const nonTerminatedDbCluster of nonTerminatedDbClusters) {
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
    }

    return nonTerminatedDbClusters
  }

  async persistDbCluster(
    input: CreateDbClusterDTO,
    describeDbClusterRes: DbClusterDescribeResponse,
    user: User,
    salt: string,
  ): Promise<DbCluster> {
    const dbCluster = this.dbClusterRepo.create({
      user: user,
      dxid: describeDbClusterRes.id,
      uid: `${describeDbClusterRes.id}-1`,
      name: describeDbClusterRes.name,
      status: STATUS[invertObj(STATUSES)[describeDbClusterRes.status]],
      syncStatus: DB_SYNC_STATUS.IN_PROGRESS,
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

  async getEditableByDxId(dxid: DxId<'dbcluster'>): Promise<DbCluster> {
    return await this.dbClusterRepo.findEditableOne({ dxid: dxid })
  }

  async getAccessibleByUid(
    uid: Uid<'dbcluster'>,
    populateOptions?: Record<string, string | string[]>,
  ): Promise<DbCluster> {
    return await this.dbClusterRepo.findAccessibleOne({ uid: uid }, populateOptions)
  }

  async getAccessibleById(id: number): Promise<DbCluster> {
    return await this.dbClusterRepo.findAccessibleOne({ id: id })
  }

  async getAccessibleByDxId(dxid: DxId<'dbcluster'>): Promise<DbCluster> {
    return await this.dbClusterRepo.findAccessibleOne({ dxid: dxid })
  }

  async getAllFromSpace(spaceId: number): Promise<DbCluster[]> {
    return await this.dbClusterRepo.find({ scope: `space-${spaceId}` })
  }

  async updateDbClusterProperties(
    dbCluster: DbCluster,
    newName: string,
    newDesc: string,
  ): Promise<void> {
    return await this.em.transactional(async () => {
      dbCluster.name = newName
      dbCluster.description = newDesc
    })
  }

  public buildCommonFilters(pagination: DbClusterPaginationDTO): ObjectFilterQuery<DbCluster> {
    const where: ObjectFilterQuery<DbCluster> = {}
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

  async paginate(
    pagination: DbClusterPaginationDTO,
    where: FilterQuery<DbCluster>,
  ): Promise<
    PaginatedResult<Loaded<DbCluster, 'user' | 'properties' | 'taggings.tag', '*', never>>
  > {
    return await this.dbClusterRepo.paginate(pagination, where, {
      orderBy: { createdAt: 'DESC' },
      populate: ['user', 'properties', 'taggings.tag'],
    })
  }

  private getMatchedEnumValues = (
    enumObj: typeof STATUS | typeof ENGINE,
    text: string | typeof STATUSES | typeof ENGINES | undefined,
  ): number[] => {
    if (!text) return []

    const searchTerm = text.toString().toLowerCase()

    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key)))
      .filter((key) => key.toLowerCase().includes(searchTerm))
      .map((key) => enumObj[key as keyof typeof enumObj])
      .map(Number)
  }

  async createPasswordRotatedEvent(user: User, dbCluster: DbCluster): Promise<void> {
    this.logger.log(
      `Creating dbcluster password rotated event for dbcluster ${dbCluster.uid} and user ${user.id}`,
    )
    const event = await createDbClusterPasswordRotated(user, dbCluster)
    await this.em.persistAndFlush(event)
  }

  async updateSyncStatus(
    dbClusterUid: Uid<'dbcluster'>,
    newSyncStatus: DB_SYNC_STATUS,
  ): Promise<void> {
    this.logger.log(
      { dbClusterUid: dbClusterUid, newSyncStatus: newSyncStatus },
      "Updating DbCluster's sync status.",
    )

    await this.em.transactional(async (transactionalEntityManager) => {
      const dbCluster = await transactionalEntityManager.findOneOrFail(DbCluster, {
        uid: dbClusterUid,
      })
      dbCluster.syncStatus = newSyncStatus
      await transactionalEntityManager.persistAndFlush(dbCluster)
    })

    await this.notificationService.createNotification({
      message: `${dbClusterUid} updated. New synchronization status - ${DB_SYNC_STATUSES[invertObj(DB_SYNC_STATUS)[newSyncStatus]]}`,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.DB_CLUSTER_UPDATED,
      userId: this.userContext.id,
      sessionId: this.userContext.sessionId,
    })
  }
}
