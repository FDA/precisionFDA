import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { buildEmailTemplate, getBullJobIdForEmailOperation } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Job } from '@shared/domain/job/job.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { TimeUtils } from '@shared/utils/time.utils'
import { EmailSendInput } from '../domain/email/email.config'
import {
  AdminDataConsistencyReportTemplateInput,
  adminDataConsistencyReportTemplate,
} from '../domain/email/templates/mjml/admin-data-consistency-report.template'
import { JobRepository } from '../domain/job/job.repository'
import { SPACE_TYPE } from '../domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '../domain/space-membership/space-membership.enum'
import { AdminDataConsistencyReportEntityInfo } from './model/admin-data-consistency-report-entity-info'
import { AdminDataConsistencyReportNodeWithParent } from './model/admin-data-consistency-report-node-with-parent'
import { AdminDataConsistencyReportOutput } from './model/admin-data-consistency-report-output'
import { AdminDataConsistencyReportRunningJobInfo } from './model/admin-data-consistency-report-running-job-info'
import { AdminDataConsistencyReportSpaceInfo } from './model/admin-data-consistency-report-space-info'

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
      const infoMapping = (file: AdminDataConsistencyReportMappableEntity): AdminDataConsistencyReportEntityInfo => {
        return {
          id: file.id,
          uid: file.uid,
          dxuser: file.user.getEntity().dxuser,
          state: file.state,
          entityType: file.entityType ?? file.stiType ?? 'unknown',
          createdAt: file.createdAt,
          elapsedTimeSinceCreation: TimeUtils.elapsedTimeSinceStringFormatted(file.createdAt),
        }
      }

      // Check for HTTPS files and folders
      const userFileRepo = this.em.getRepository(UserFile)
      const folderRepo = this.em.getRepository(Folder) as FolderRepository

      // Check for PFDA-only folders
      const pfdaOnlyFolders = await folderRepo.findAllPFDAOnlyFolders()
      output.pfdaOnlyFoldersCount = pfdaOnlyFolders.length
      output.pfdaOnlyFolders = pfdaOnlyFolders.map(infoMapping)

      const nodesWithParents = await this.checkInconsistentNodes()
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

      const runningJobsInfo = await this.checkRunningJobs()
      output.runningJobs = runningJobsInfo
      output.runningJobsCount = runningJobsInfo.length

      const spacesInfo = await this.checkInconsistentSpaces()
      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      this.logger.log({ output }, 'AdminDataConsistencyReportService: Completed')

      await this.sendReportEmail(output)
    } catch (error) {
      this.logger.error({ error, output }, 'AdminDataConsistencyReportService: Error')
    }

    return output
  }

  async checkInconsistentSpaces(): Promise<AdminDataConsistencyReportSpaceInfo[]> {
    // Check Spaces for leads inconsistency
    // Billing inconsistencies can only be checked using the lead's token and is done in AdminDataConsistencyReportService
    const spacesInfo: AdminDataConsistencyReportSpaceInfo[] = []
    const spaceRepo = this.em.getRepository(Space)
    const spaces = await spaceRepo.findAll({
      populate: ['spaceMemberships', 'spaceMemberships.user'],
    })
    const leadMapping = (lead: SpaceMembership): AdminDataConsistencyLeadInfo => {
      const user: User = lead.user.getEntity()
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
      const allHostLeads = space.spaceMemberships.getItems().filter(x => {
        return x.isLead() && x.side === SPACE_MEMBERSHIP_SIDE.HOST
      })
      if (allHostLeads.length > 1) {
        errors.push(`Error: more than one host lead - ${JSON.stringify(allHostLeads.map(leadMapping))}`)
      }

      const allGuestLeads = space.spaceMemberships.getItems().filter(x => {
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
          guestDxOrg: space.guestDxOrg,
          guestLead: guestLead?.dxuser,
          status: errors.join('\n'),
        })
      }
    }
    return spacesInfo
  }

  async checkRunningJobs(): Promise<AdminDataConsistencyReportRunningJobInfo[]> {
    const jobsRepo: JobRepository = this.em.getRepository(Job)
    const runningJobs = await jobsRepo.findAllRunningJobs()
    const runningJobsInfo: AdminDataConsistencyReportRunningJobInfo[] = []
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

  async checkInconsistentNodes(): Promise<AdminDataConsistencyReportNodeWithParent[]> {
    // Check for files/folders/assets with inconsistent parents
    const allNodes = await this.em.getRepository(Node).find({
      parentFolder: { $ne: null },
      scopedParentFolder: { $ne: null },
    })

    const nodesWithParents: AdminDataConsistencyReportNodeWithParent[] = []
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
    const body = await buildEmailTemplate<AdminDataConsistencyReportTemplateInput>(adminDataConsistencyReportTemplate, {
      content: output,
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.adminDataConsistencyReport,
      to: config.emails.report,
      subject: 'Admin Data Consistency Report',
      body,
    }

    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.adminDataConsistencyReport)
    this.logger.log('Sending report email to admin')
    await this.emailsJobProducer.createSendEmailTask(email, null, jobId)
  }
}

interface AdminDataConsistencyReportMappableEntity {
  id: number
  uid: string
  user: { getEntity: () => User }
  state: FILE_STATE | null
  createdAt: Date
  entityType?: string
  stiType?: FILE_STI_TYPE
}

interface AdminDataConsistencyLeadInfo {
  id: number
  side: SPACE_MEMBERSHIP_SIDE
  role: SPACE_MEMBERSHIP_ROLE
  userId: number
  firstName: string
  lastName: string
  email: string
  dxuser: string
  lastDataCheckup: Date | null
  privateFilesProject: DxId<'project'> | null
  publicFilesProject: DxId<'project'> | null
  privateComparisonsProject: DxId<'project'> | null
  publicComparisonsProject: DxId<'project'> | null
}
