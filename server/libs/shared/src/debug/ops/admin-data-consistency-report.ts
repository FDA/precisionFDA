/* eslint-disable @typescript-eslint/no-floating-promises */
import { config } from '@shared/config'
import { database } from '@shared/database'
import { EmailSendOperation } from '@shared/domain/email/ops/email-send'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { User } from '@shared/domain/user/user.entity'
import { JobRepository } from '../../domain/job/job.repository'
import { BaseOperation } from '@shared/utils/base-operation'
import { OpsCtx, UserCtx } from '../../types'
import { AdminDataConsistencyReportTask, TASK_TYPE } from '../../queue/task.input'
import { SPACE_MEMBERSHIP_SIDE } from '../../domain/space-membership/space-membership.enum'
import { adminDataConsistencyReportTemplate } from '../../domain/email/templates/mjml/admin-data-consistency-report.template'
import { EMAIL_TYPES, EmailSendInput } from '../../domain/email/email.config'
import { addToQueue, createSendEmailTask, getMaintenanceQueue } from '../../queue'
import { EntityManager } from '@mikro-orm/mysql'
import { SPACE_TYPE } from '../../domain/space/space.enum'


export type AdminDataConsistencyReportOutput = {
  httpsFilesCount?: number
  httpsFoldersCount?: number
  pfdaOnlyFoldersCount?: number
  pfdaOnlyFolders?: any
  foldersWithParentCount?: number
  foldersWithParent?: any
  unclosedFilesCount?: number
  unclosedFiles?: any
  runningJobs?: any
  runningJobsCount?: number
  legacyOrgs?: any
  legacyOrgsCount?: number
  spaces?: any
  spacesWithErrorsCount?: number
}

// AdminDataConsistencyReportOperation is to be run by an admin to check on the overall
// health and consistency of our database records
//
// Anything that requires the user token will be handle by UserDataConsistencyReportOperation instead
//
// Current checks
//  - Unclosed files and how long they've been
//  - Unterminated jobs and how long they've been running
//  - Summary of HTTPS folders
//  - Summary of PFDA Only (local) folders
//  - Find any dxids that have multiple entries in nodes table
//  - Find any spaces that have multiple leads per side
//
export class AdminDataConsistencyReportOperation extends BaseOperation<
OpsCtx,
never,
AdminDataConsistencyReportOutput
> {
  private em: EntityManager = this.ctx.em

  static async enqueue(): Promise<void> {
    const task: AdminDataConsistencyReportTask = {
      type: TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT,
    }
    await addToQueue<AdminDataConsistencyReportTask>(task, getMaintenanceQueue(), {
      repeat: {
        cron: config.workerJobs.adminDataConsistencyReport.repeatPattern,
      },
      jobId: TASK_TYPE.ADMIN_DATA_CONSISTENCY_REPORT,
    })
  }

  async run(): Promise<AdminDataConsistencyReportOutput> {
    const log = this.ctx.log
    try {
      const dbReplicaService = await database.createDatabaseReplicaService()
      await dbReplicaService.start()
      this.em = dbReplicaService.getOrm()!.em
    } catch (error) {
      log.warn('Cannot create dbReplicaService, using main db')
    }

    let output: AdminDataConsistencyReportOutput = {}

    log.verbose('AdminDataConsistencyReportOperation: Starting operation')

    try {
      const infoMapping = (f: any): any => {
        return {
          id: f.id,
          uid: f.uid,
          dxuser: f.user.getEntity().dxuser,
          state: f.state,
          entityType: f.entityType,
          elapsedTimeSinceCreation: f.elapsedTimeSinceCreationString(),
        }
      }

      // Check for HTTPS files and folders
      //
      const userFileRepo = this.em.getRepository(UserFile)
      output.httpsFilesCount = await userFileRepo.count({ }, { filters: ['userfile', 'https'] })

      const folderRepo = this.em.getRepository(Folder)
      output.httpsFoldersCount = await folderRepo.count({ }, { filters: ['folder', 'https'] })


      // Check for PFDA-only folders
      //
      const pfdaOnlyFolders = await folderRepo.findAllPFDAOnlyFolders()
      output.pfdaOnlyFoldersCount = pfdaOnlyFolders.length
      output.pfdaOnlyFolders = pfdaOnlyFolders.map(infoMapping)


      const nodesWithParents: any[] = await this.checkInconsistentNodes()
      output.foldersWithParent = nodesWithParents
      output.foldersWithParentCount = nodesWithParents.length


      // Check for files that are in open, abandoned or removing state and
      // note the elapsed time since creation
      //
      const unclosedFiles = await userFileRepo.find({ }, { filters: ['unclosed'], populate: ['user'] })
      output.unclosedFilesCount = unclosedFiles.length
      output.unclosedFiles = unclosedFiles.map(infoMapping)

      const runningJobsInfo: any[] = await this.checkRunningJobs()
      output.runningJobs = runningJobsInfo
      output.runningJobsCount = runningJobsInfo.length


      const spacesInfo: any[] = await this.checkInconsistentSpaces()
      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      log.verbose({ output }, 'AdminDataConsistencyReportOperation: Completed')

      await this.sendReportEmail(output)
    } catch (error) {
      log.error({ error, output }, 'AdminDataConsistencyReportOperation: Error')
    }

    return output
  }

  async checkInconsistentSpaces(): Promise<any[]> {
    // Check Spaces for leads inconsistency
    // Billing inconsistencies can only be checked using the lead's token and is done in UserDataConsistencyReportOperation
    //
    const spacesInfo: any[] = []
    const spaceRepo = this.em.getRepository(Space)
    const spaces = await spaceRepo.findAll({
      populate: ['spaceMemberships', 'spaceMemberships.user']
    })
    const leadMapping = ((lead: SpaceMembership) => {
      const user = lead.user.getEntity()
      return {
        id: lead.id,
        side: lead.side,
        role: lead.role,
        userId: lead.user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dxuser: user.dxuser,
        lastDataCheckup: user.lastDataCheckup,
        privateFilesProject: user.privateFilesProject,
        publicFilesProject: user.publicFilesProject,
        privateComparisonsProject: user.privateComparisonsProject,
        publicComparisonsProject: user.publicComparisonsProject,
      }
    });
    for (const space of spaces) {
      const errors: string[] = []

      // There should not be more than one lead on either side
      const allHostLeads = await space.spaceMemberships.getItems().filter(x => {
        return x.isLead() && x.side === SPACE_MEMBERSHIP_SIDE.HOST
      })
      if (allHostLeads.length > 1) {
        errors.push(`Error: more than one host lead - ${JSON.stringify(allHostLeads.map(leadMapping))}`)
      }

      const allGuestLeads = await space.spaceMemberships.getItems().filter(x => {
        return x.isLead() && x.side === SPACE_MEMBERSHIP_SIDE.GUEST
      })
      if (allGuestLeads.length > 1) {
        errors.push(`Error: more than one guest lead - ${JSON.stringify(allGuestLeads.map(leadMapping))}`)
      }

      if (errors.length > 0) {
        const hostLead = await space.findHostLead()
        const guestLead = await space.findGuestLead()
        spacesInfo.push({
          id: space.id,
          name: space.name,
          spaceType: SPACE_TYPE[space.type],
          spaceId: space.spaceId,
          state: space.state,
          hostDxOrg: space.hostDxOrg,
          hostLead: hostLead?.dxuser,
          guestDxtOrg: space.guestDxOrg,
          guestLead: guestLead?.dxuser,
          status: errors.join('\n')
        })
      }
    }
    return spacesInfo
  }

  async checkRunningJobs(): Promise<any[]> {
    const jobsRepo: JobRepository = this.em.getRepository(Job)
    const runningJobs = await jobsRepo.findAllRunningJobs()
    const runningJobsInfo: any[] = []
    for (const job of runningJobs) {
      await job.user.load()
      const user = job.user.getEntity()
      runningJobsInfo.push({
        dxid: job.dxid,
        id: job.id,
        uid: job.uid,
        userId: user.id,
        userDxid: user.dxid,
        scope: job.scope,
        entityType: job.getEntityTypeString(),
        elapsedTime: job.elapsedTimeSinceCreationString(),
      })
    }
    return runningJobsInfo
  }

  async checkInconsistentNodes(): Promise<any[]> {
    // Check for files/folders/assets with inconsistent parents
    //
    const allNodes = await this.em.getRepository(Node).find({
      parentFolderId: { $ne: null },
      scopedParentFolderId: { $ne: null },
    })

    const nodesWithParents: any[] = []
    for (const node of allNodes) {
      const nodeInfo = {
        id: node.id,
        name: node.name,
        parentFolderId: node.parentFolderId,
        scopedParentFolderId: node.scopedParentFolderId,
        scope: node.scope,
        state: node.state,
        stiType: node.stiType,
        errors: 'Error: parent_folder_id and scoped_parent_folder_id are both set',
      }
      nodesWithParents.push(nodeInfo)
    }
    return nodesWithParents
  }

  private async sendReportEmail(output: AdminDataConsistencyReportOutput): Promise<void> {
    const adminUser = await this.ctx.em.getRepository(User).findAdminUser()
    const body = adminDataConsistencyReportTemplate({
      receiver: adminUser,
      content: output,
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.adminDataConsistencyReport,
      to: adminUser.email,
      subject: 'Admin Data Consistency Report',
      body,
    }

    const jobId = EmailSendOperation.getBullJobId(EMAIL_TYPES.adminDataConsistencyReport)
    this.ctx.log.verbose('AdminDataConsistencyReportOperation: Sending report email to admin')
    const tempUserCtx: UserCtx = { id: adminUser.id, dxuser: adminUser.dxuser, accessToken: 'notUsed' }
    await createSendEmailTask(email, tempUserCtx, jobId)
  }
}
