import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailSendInput } from '@shared/domain/email/email.config'
import {
  buildEmailTemplate,
  getBullJobIdForEmailOperation,
} from '@shared/domain/email/email.helper'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  userDataConsistencyReportTemplate,
  UserDataConsistencyReportTemplateInput,
} from '@shared/domain/email/templates/mjml/user-data-consistency-report.template'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { findUnclosedFilesOrAssets, getNodePath } from '@shared/domain/user-file/user-file.helper'
import { IFileOrAsset } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError } from '@shared/errors'
import { UserSpaceInconsistencyFixService } from '@shared/facade/user/service/user-space-inconsistency-fix.service'
import {
  FileOrAssetInfo,
  InconsistentFix,
  NodeInfo,
  PrivateProject,
  ProjectInfo,
  SpaceInfo,
  UserDataConsistencyReportOutput,
} from '@shared/facade/user/user-facade.types'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'

// UserDataConsistencyReportOperation uses a user token to inspect the user's
// data integrity in the database and detects inconsistencies between pFDA and platform
//
// Current checks:
// - Check user's billable org
// - Check if user's email on pFDA matches that on platform
// - Check user's private projects' billTo
// - Check if users have any unclosed files or assets remaining
// - Check if user has any folders that has both parent_folder_id and scoped_parent_folder_id
// - Check if user has any local files and folders (outside of platform folders)
// - Check the billTo of any Spaces to which the user is a lead
@Injectable()
export class UserDataConsistencyReportFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly emailsJobProducer: EmailQueueJobProducer,
    private readonly platformClient: PlatformClient,
    private readonly userSpaceInconsistencyFixService: UserSpaceInconsistencyFixService,
  ) {}

  async createReport(): Promise<{
    output: UserDataConsistencyReportOutput
    inconsistentFixes: InconsistentFix[]
  }> {
    const userCtx = this.user
    const inconsistentFixes: InconsistentFix[] = []

    const output: UserDataConsistencyReportOutput = {}
    this.logger.log(
      {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      },
      'Starting createReport()',
    )

    const userRepo = this.em.getRepository(User) as UserRepository
    const user = await userRepo.findDxuser(userCtx.dxuser)
    if (!user) {
      this.logger.error(
        {
          id: userCtx.id,
          dxuser: userCtx.dxuser,
        },
        'Error user not found',
      )

      throw new NotFoundError(`User ${userCtx.id} (${userCtx.dxuser}) not found`)
    }

    try {
      output.user = {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      }

      // Check if user's email on pFDA matches that on platform
      const userDescribe = await this.platformClient.userDescribe({
        dxid: user.dxid,
        defaultFields: true,
        fields: {
          email: true,
        },
      })

      if (userDescribe.email !== user.email) {
        output.user = {
          ...output.user,
          dxid: user.dxid,
          email: `Error: email on pFDA (${user.email}) does not match platform (${userDescribe.email})`,
        }
      } else {
        output.user = {
          ...output.user,
          dxid: user.dxid,
          email: `email (${user.email}) on pFDA matches platform`,
        }
      }

      // Check user's billable org
      const billToOrg = user.billTo()
      output.billableOrg = {
        org: billToOrg,
        errors: [],
      }
      output.billableOrgErrorsCount = 0
      if (!(await this.isAdminUserInOrg(billToOrg))) {
        output.billableOrg.errors.push('Admin user not found in billable org')
        output.billableOrgErrorsCount = 1
        inconsistentFixes.push([
          this.userSpaceInconsistencyFixService.inviteAdminUserToOrg.name,
          [billToOrg],
        ])
      }

      // Check user's private projects' billTo
      const privateProjects: PrivateProject = {}
      const generateProjectInfo = async (
        projectDxid: string | undefined,
      ): Promise<ProjectInfo | string> => {
        if (!projectDxid) {
          return 'Does not exist'
        }

        const projectDescribe = await this.platformClient.projectDescribe({
          projectDxid,
          body: {},
        })
        const correctBillTo = projectDescribe.billTo === user.billTo()
        return {
          status: correctBillTo
            ? `billTo is correct (${projectDescribe.billTo})`
            : `Error: Project billTo (${projectDescribe.billTo}) does not match user's org (${user.billTo()})`,
          projectDescribe,
        }
      }
      privateProjects['user.privateFilesProject'] = await generateProjectInfo(
        user.privateFilesProject,
      )
      privateProjects['user.publicFilesProject'] = await generateProjectInfo(
        user.publicFilesProject,
      )
      privateProjects['user.privateComparisonsProject'] = await generateProjectInfo(
        user.privateComparisonsProject,
      )
      privateProjects['user.publicComparisonsProject'] = await generateProjectInfo(
        user.publicComparisonsProject,
      )
      output.privateProjects = privateProjects
      output.privateProjectsCount = Object.keys(privateProjects).length

      // Check if users have any unclosed files or assets remaining
      const now = new Date()
      const fileInfoMapping = (f: IFileOrAsset): FileOrAssetInfo => {
        return {
          id: f.id,
          uid: f.uid,
          dxuser: f.user.getEntity().dxuser,
          state: f.state,
          entityType: f.isFile ? 'file' : 'asset',
          elapsedMillisSinceCreation: now.getTime() - f.createdAt.getTime(),
        }
      }
      const unclosedFiles = await findUnclosedFilesOrAssets(this.em, user.id)
      output.unclosedFiles = unclosedFiles.map(fileInfoMapping) as FileOrAssetInfo[]
      output.unclosedFilesCount = unclosedFiles.length

      const userFilesRepo = this.em.getRepository(UserFile)

      // Check if user has any folders that has both parent_folder_id and scoped_parent_folder_id
      const userNodes = await this.em.getRepository(Node).find({ user: user.id })
      let filesAndFoldersErrorsCount = 0
      const filesAndFoldersStatus: NodeInfo[] = []
      for (const node of userNodes) {
        const errors: string[] = []

        const hasInvalidFolderState = node.parentFolder?.id && node.scopedParentFolder?.id
        if (hasInvalidFolderState) {
          errors.push('Error: parent_folder_id and scoped_parent_folder_id are both set')
        }
        if (node.isFolder && node.project) {
          // If node.project is set for a folder, it is https folder
          // Check if files in https folder are missing on pFDA
          const parentKey = node.scope.startsWith('space')
            ? 'scopedParentFolderId'
            : 'parentFolderId'
          const nodePath = await getNodePath(this.em, node)
          const httpsFiles = await this.platformClient.filesList({
            project: node.project,
            folder: nodePath,
            includeDescProps: false,
          })
          for (const file of httpsFiles) {
            const fileNode = await userFilesRepo.findOne({ dxid: file.id, [parentKey]: node.id })
            if (!fileNode) {
              errors.push(`Error: File ${file.describe?.name} (${file.id}) is missing from pFDA`)
            }
          }
        }

        if (errors.length > 0) {
          const nodeInfo = {
            id: node.id,
            name: node.name,
            parentFolderId: node.parentFolder?.id,
            scopedParentFolderId: node.scopedParentFolder?.id,
            scope: node.scope,
            state: node.state,
            stiType: node.stiType,
            errors,
          }
          filesAndFoldersStatus.push(nodeInfo)
          filesAndFoldersErrorsCount += errors.length
        }
      }
      output.filesAndFoldersStatus = filesAndFoldersStatus
      output.filesAndFoldersErrorsCount = filesAndFoldersErrorsCount

      const spacesInfo: SpaceInfo[] = await this.checkSpaces(user, inconsistentFixes)

      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      // Update lastDataCheckup for user
      user.lastDataCheckup = new Date()
      this.em.persist(user)
      await this.em.flush()

      await this.sendReportEmail(output)

      this.logger.log(
        {
          id: userCtx.id,
          dxuser: userCtx.dxuser,
          output,
        },
        'UserDataConsistencyReportOperation: Completed',
      )
    } catch (error) {
      this.logger.error({ error, output }, 'UserDataConsistencyReportOperation: Error')
    }

    return { output, inconsistentFixes }
  }

  async fixInconsistentData(inconsistentFixes: InconsistentFix[]): Promise<void> {
    const fixPromises: Promise<void>[] = inconsistentFixes.map(([funcName, params]) => {
      return this.userSpaceInconsistencyFixService[funcName](...params)
    })
    await Promise.all(fixPromises)
  }

  private async isAdminUserInOrg(org: string): Promise<boolean> {
    const findAdminUser = await this.platformClient.orgFindMembers({
      orgDxid: org,
      id: [`user-${config.platform.adminUser}`],
      level: 'ADMIN',
    })
    return findAdminUser.results.length !== 0
  }

  // Check the billTo of any Spaces to which the user is a lead
  private async checkSpaces(
    user: User,
    inconsistentFixes: InconsistentFix[],
  ): Promise<SpaceInfo[]> {
    const spaceInfo: SpaceInfo[] = []
    const leadMemberships = await this.spaceMembershipRepository.findActiveMembershipAndSpace(
      this.user.id,
      SPACE_MEMBERSHIP_ROLE.LEAD,
    )
    for (const membership of leadMemberships) {
      let isHostSide = membership.side === SPACE_MEMBERSHIP_SIDE.HOST
      for (const space of membership.spaces) {
        const errors: string[] = []
        const projectDxid = isHostSide ? space.hostProject : space.guestProject
        const projectInfo = await this.platformClient.projectDescribe({ projectDxid, body: {} })
        if (user.billTo() !== projectInfo.billTo) {
          errors.push(
            `[space-${space.id} (type: ${SPACE_TYPE[space.type]})] Project billTo (${projectInfo.id} - ${projectInfo.billTo}) does not match lead's org (${user.billTo()})`,
          )
          inconsistentFixes.push([
            this.userSpaceInconsistencyFixService.correctSpaceBillTo.name,
            [user.billTo(), projectDxid],
          ])
        }
        const spaceOrg = isHostSide ? space.hostDxOrg : space.guestDxOrg
        const isAdminUserInOrg = await this.isAdminUserInOrg(spaceOrg)
        if (!isAdminUserInOrg) {
          errors.push(
            `[space-${space.id} (type: ${SPACE_TYPE[space.type]})] Admin user not found in space org ${spaceOrg}`,
          )
          inconsistentFixes.push([
            this.userSpaceInconsistencyFixService.inviteAdminUserToOrg.name,
            [spaceOrg],
          ])
        }
        if (errors.length) {
          spaceInfo.push({
            id: membership.id,
            active: membership.active,
            spaceType: SPACE_TYPE[space.type],
            spaceState: SPACE_STATE[space.state],
            spaceId: space.id,
            hostProject: space.hostProject,
            guestProject: space.guestProject,
            hostDxOrg: space.hostDxOrg,
            guestDxtOrg: space.guestDxOrg,
            side: SPACE_MEMBERSHIP_SIDE[membership.side],
            errors: errors,
          })
        }
      }
    }
    return spaceInfo
  }

  private async sendReportEmail(output: UserDataConsistencyReportOutput): Promise<void> {
    const body = buildEmailTemplate<UserDataConsistencyReportTemplateInput>(
      userDataConsistencyReportTemplate,
      {
        content: output,
      },
    )
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.userDataConsistencyReport,
      to: config.emails.report,
      subject: `User Data Consistency Report for ${this.user.dxuser}`,
      body,
    }

    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.userDataConsistencyReport)
    this.logger.log('Sending report email to admin')

    await this.emailsJobProducer.createSendEmailTask(email, this.user, jobId)
  }
}
