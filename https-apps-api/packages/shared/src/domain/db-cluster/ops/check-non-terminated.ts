import { Maybe } from "../../../types"
import { WorkerBaseOperation } from "../../../utils/base-operation"
import { DbCluster, SyncDbClusterOperation } from ".."
import { queue } from "../../../"
import { User } from "../../user/user.entity"
import { reportNonTerminatedDbClustersTemplate, ReportNonTerminatedDbClustersTemplateInput } from "../../email/templates/mjml/report-non-terminated-dbclusters.template"
import { EmailSendInput, EMAIL_TYPES } from "../../email/email.config"
import { buildEmailTemplate } from "../../email/email.helper"
import { invertObj } from "ramda"
import { STATUS, STATUSES } from "../../db-cluster/db-cluster.enum"
import { OpsCtx } from "../../../types"

export class CheckNonTerminatedDbClustersOperation extends WorkerBaseOperation<
  OpsCtx,
  undefined,
  Maybe<DbCluster[]>
> {

  async run() {
    const em = this.ctx.em
    const dbClusterRepo = em.getRepository(DbCluster)
    const nonTerminatedDbClusters = await dbClusterRepo.find({}, {
      filters: ['isNonTerminal'],
      orderBy: { createdAt: 'DESC' },
      populate: ['user'],
    })
    nonTerminatedDbClusters.forEach(async (nonTerminatedDbCluster) => {
      const dbSyncOperation = await queue.getStatusQueue().getJob(SyncDbClusterOperation.getBullJobId(nonTerminatedDbCluster.dxid))
      if (!dbSyncOperation) {
        this.ctx.log.warn(
          { 
            user: nonTerminatedDbCluster.user.getEntity().dxuser,
            dbCluster: nonTerminatedDbCluster,
          },
          'CheckNonTerminatedDbClustersOperation: Missing sync operation for unterminated database, ' +
          'it will be recreated the next time the user logs in.',
        )
      }
    })
    const adminUser = await em.getRepository(User).findAdminUser()
    const emailTemplate = reportNonTerminatedDbClustersTemplate
    const body = buildEmailTemplate<ReportNonTerminatedDbClustersTemplateInput>(emailTemplate, {
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
    })
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

    await queue.createSendEmailTask(email, undefined)
    await queue.createSendEmailTask(emailToPfda, undefined)

    return nonTerminatedDbClusters
  }
}
