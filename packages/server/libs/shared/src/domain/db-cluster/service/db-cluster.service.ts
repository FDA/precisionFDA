import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/CreateDbClusterDTO'
import { UpdateDbClusterDTO } from '@shared/domain/db-cluster/dto/UpdateDbClusterDTO'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import { EMAIL_TYPES, EmailSendInput } from '@shared/domain/email/email.config'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  reportNonTerminatedDbClustersTemplate,
  ReportNonTerminatedDbClustersTemplateInput,
} from '@shared/domain/email/templates/mjml/report-non-terminated-dbclusters.template'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { DbClusterDescribeResponse } from '@shared/platform-client/platform-client.responses'
import { getMainQueue } from '@shared/queue'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { invertObj, omit } from 'ramda'

@Injectable()
export class DbClusterService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly mainJobProducer: MainQueueJobProducer,
    private readonly emailsJobProducer: EmailQueueJobProducer,
  ) {}

  public async checkNonTerminatedDbClusters() {
    const dbClusterRepo = this.em.getRepository(DbCluster)
    const nonTerminatedDbClusters = await dbClusterRepo.find(
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
    const adminUser = await this.em.getRepository(User).findAdminUser()
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
    const newCluster = await this.platformClient.dbClusterCreate({
      ...omit(['scope', 'description'], input),
    } as any)

    const describeDbClusterRes = await this.platformClient.dbClusterDescribe({
      dxid: newCluster.id,
      project: input.project,
    })

    const dbCluster = await this.persistDbCluster(input, describeDbClusterRes)
    await this.mainJobProducer.createDbClusterSyncTask({ dxid: dbCluster.dxid }, this.user)

    return dbCluster
  }

  private async persistDbCluster(
    input: CreateDbClusterDTO,
    describeDbClusterRes: DbClusterDescribeResponse,
  ): Promise<DbCluster> {
    const dbCluster = this.em.create(DbCluster, {
      user: this.em.getReference(User, this.user.id),
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
    })

    await this.em.persistAndFlush(dbCluster)

    return dbCluster
  }

  async update(uid: Uid<'dbcluster'>, body: UpdateDbClusterDTO) {
    const dbCluster = await this.em.findOne(DbCluster, { uid, user: this.user.id })
    if (!dbCluster) {
      throw new NotFoundError(`DbCluster ${uid} not found`)
    }

    return await this.em.transactional(async () => {
      dbCluster.name = body.name
      dbCluster.description = body.description
      // await this.em.persistAndFlush(dbCluster)
    })
  }
}
