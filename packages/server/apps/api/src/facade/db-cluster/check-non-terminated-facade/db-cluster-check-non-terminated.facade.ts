import { Injectable, Logger } from '@nestjs/common'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import {
  reportNonTerminatedDbClustersTemplate,
  ReportNonTerminatedDbClustersTemplateInput,
} from '@shared/domain/email/templates/mjml/report-non-terminated-dbclusters.template'
import { STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
import { invertObj } from 'ramda'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { config } from '@shared/config'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'

@Injectable()
export class DbClusterCheckNonTerminatedFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly dbClusterService: DbClusterService,
    private readonly emailsJobProducer: EmailQueueJobProducer,
  ) {}

  async checkNonTerminatedDbClusters(): Promise<DbCluster[]> {
    const nonTerminatedDbClusters = await this.dbClusterService.getNonTerminatedDbClusters()

    const body = buildEmailTemplate<ReportNonTerminatedDbClustersTemplateInput>(
      reportNonTerminatedDbClustersTemplate,
      {
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
      to: config.emails.report,
      body,
      subject: 'Non-terminated dbclusters',
    }

    await this.emailsJobProducer.createSendEmailTask(email, undefined)

    return nonTerminatedDbClusters
  }
}
