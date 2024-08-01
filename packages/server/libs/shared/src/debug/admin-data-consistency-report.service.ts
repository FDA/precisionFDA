import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EMAIL_TYPES, EmailSendInput } from '../domain/email/email.config'
import { adminDataConsistencyReportTemplate } from '../domain/email/templates/mjml/admin-data-consistency-report.template'
import { JobRepository } from '../domain/job/job.repository'
import { SPACE_MEMBERSHIP_SIDE } from '../domain/space-membership/space-membership.enum'
import { SPACE_TYPE } from '../domain/space/space.enum'
import { UserCtx } from '../types'
import { getBullJobIdForEmailOperation } from '@shared/domain/email/email.helper'

export type AdminDataConsistencyReportOutput = {
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

// AdminDataConsistencyReportService is to be run by an admin to check on the overall
// health and consistency of our database records
//
// Anything that requires the user token will be handled by UserDataConsistencyReportOperation instead
//
// Current checks
//  - Unclosed files and how long they've been
//  - Unterminated jobs and how long they've been running
//  - Summary of PFDA Only (local) folders
//  - Find any dxids that have multiple entries in nodes table
//  - Find any spaces that have multiple leads per side
@Injectable()
export class AdminDataConsistencyReportService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly emailsJobProducer: EmailQueueJobProducer,
  ) {}

  async createReport(): Promise<AdminDataConsistencyReportOutput> {
    const output: AdminDataConsistencyReportOutput = {}

    this.logger.log('AdminDataConsistencyReportService: Starting createReport')

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
      const userFileRepo = this.em.getRepository(UserFile)
      const folderRepo = this.em.getRepository(Folder)

      // Check for PFDA-only folders
      const pfdaOnlyFolders = await folderRepo.findAllPFDAOnlyFolders()
      output.pfdaOnlyFoldersCount = pfdaOnlyFolders.length
      output.pfdaOnlyFolders = pfdaOnlyFolders.map(infoMapping)

      const nodesWithParents: any[] = await this.checkInconsistentNodes()
      output.foldersWithParent = nodesWithParents
      output.foldersWithParentCount = nodesWithParents.length

      // Check for files that are in open, abandoned or removing state and
      // note the elapsed time since creation
      const unclosedFiles = await userFileRepo.find(
        {},
        {
          filters: ['unclosed'],
          populate: ['user'],
        },
      )
      output.unclosedFilesCount = unclosedFiles.length
      output.unclosedFiles = unclosedFiles.map(infoMapping)

      const runningJobsInfo: any[] = await this.checkRunningJobs()
      output.runningJobs = runningJobsInfo
      output.runningJobsCount = runningJobsInfo.length

      const spacesInfo: any[] = await this.checkInconsistentSpaces()
      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      this.logger.log({ output }, 'AdminDataConsistencyReportService: Completed')

      await this.sendReportEmail(output)
    } catch (error) {
      this.logger.error({ error, output }, 'AdminDataConsistencyReportService: Error')
    }

    return output
  }

  async checkInconsistentSpaces(): Promise<any[]> {
    // Check Spaces for leads inconsistency
    // Billing inconsistencies can only be checked using the lead's token and is done in AdminDataConsistencyReportService
    const spacesInfo: any[] = []
    const spaceRepo = this.em.getRepository(Space)
    const spaces = await spaceRepo.findAll({
      populate: ['spaceMemberships', 'spaceMemberships.user'],
    })
    const leadMapping = (lead: SpaceMembership) => {
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
    }
    for (const space of spaces) {
      const errors: string[] = []

      // There should not be more than one lead on either side
      const allHostLeads = space.spaceMemberships.getItems().filter((x) => {
        return x.isLead() && x.side === SPACE_MEMBERSHIP_SIDE.HOST
      })
      if (allHostLeads.length > 1) {
        errors.push(
          `Error: more than one host lead - ${JSON.stringify(allHostLeads.map(leadMapping))}`,
        )
      }

      const allGuestLeads = space.spaceMemberships.getItems().filter((x) => {
        return x.isLead() && x.side === SPACE_MEMBERSHIP_SIDE.GUEST
      })
      if (allGuestLeads.length > 1) {
        errors.push(
          `Error: more than one guest lead - ${JSON.stringify(allGuestLeads.map(leadMapping))}`,
        )
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
          status: errors.join('\n'),
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
    const allNodes = await this.em.getRepository(Node).find({
      parentFolder: { $ne: null },
      scopedParentFolder: { $ne: null },
    })

    const nodesWithParents: any[] = []
    for (const node of allNodes) {
      const nodeInfo = {
        id: node.id,
        name: node.name,
        parentFolderId: node.parentFolder?.id,
        scopedParentFolderId: node.scopedParentFolder?.id,
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
    const adminUser = await this.em.getRepository(User).findAdminUser()
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

    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.adminDataConsistencyReport)
    this.logger.log('Sending report email to admin')
    const tempUserCtx: UserCtx = {
      id: adminUser.id,
      dxuser: adminUser.dxuser,
      accessToken: 'notUsed',
    }
    await this.emailsJobProducer.createSendEmailTask(email, tempUserCtx, jobId)
  }
}
