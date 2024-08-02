import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { User } from '@shared/domain/user/user.entity'
import { findUnclosedFilesOrAssets, getNodePath } from '@shared/domain/user-file/user-file.helper'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { wrap } from '@mikro-orm/core'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { EMAIL_TYPES, EmailSendInput } from '@shared/domain/email/email.config'
import { UserCtx } from '@shared/types'
import { userDataConsistencyReportTemplate } from '@shared/domain/email/templates/mjml/user-data-consistency-report.template'
import { NotFoundError } from '@shared/errors'
import { getBullJobIdForEmailOperation } from '@shared/domain/email/email.helper'

export type UserDataConsistencyReportOutput = {
  user?: {
    id: number
    dxuser: string
    dxid?: string
    email?: string
  }
  privateProjectsCount?: number
  privateProjects?: any
  filesAndFoldersStatus?: any
  filesAndFoldersErrorsCount?: number
  unclosedFilesCount?: number
  unclosedFiles?: any
  spaces?: any
  spacesWithErrorsCount?: number
}

// UserDataConsistencyReportOperation uses a user token to inspect the user's
// data integrity in the database and detects inconsistencies between pFDA and platform
//
// Current checks:
// - Check if user's email on pFDA matches that on platform
// - Check user's private projects' billTo
// - Check if users have any unclosed files or assets remaining
// - Check if user has any folders that has both parent_folder_id and scoped_parent_folder_id
// - Check if user has any local files and folders (outside of platform folders)
// - Check the billTo of any Spaces to which the user is a lead
@Injectable()
export class UserDataConsistencyReportService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly emailsJobProducer: EmailQueueJobProducer,
  ) {}

  async createReport(): Promise<UserDataConsistencyReportOutput> {
    const userCtx = this.user

    const output: UserDataConsistencyReportOutput = {}
    this.logger.log(
      {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      },
      'UserDataConsistencyReportService: Starting createReport()',
    )

    const userRepo = this.em.getRepository(User)
    const user = await userRepo.findDxuser(userCtx.dxuser)
    if (!user) {
      this.logger.error(
        {
          id: userCtx.id,
          dxuser: userCtx.dxuser,
        },
        'UserDataConsistencyReportOperation: Error user not found',
      )

      throw new NotFoundError(`User ${userCtx.id} (${userCtx.dxuser}) not found`)
    }

    try {
      output.user = {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      }

      // Check if user's email on pFDA matches that on platform
      const client = new PlatformClient({ accessToken: userCtx.accessToken }, this.logger)
      const userDescribe = await client.userDescribe({
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

      // Check user's private projects' billTo
      const privateProjects: any = {}
      const generateProjectInfo = async (projectDxid: string | undefined) => {
        if (!projectDxid) {
          return 'Does not exist'
        }

        const projectDescribe = await client.projectDescribe({
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
      output.privateProjectsCount = privateProjects.length

      // Check if users have any unclosed files or assets remaining
      const now = new Date()
      const fileInfoMapping = (f: any): any => {
        return {
          id: f.id,
          uid: f.uid,
          dxuser: f.user.getEntity().dxuser,
          state: f.state,
          entityType: f.entityType,
          elapsedMillisSinceCreation: now.getTime() - f.createdAt.getTime(),
        }
      }
      const unclosedFiles = await findUnclosedFilesOrAssets(this.em, user.id)
      output.unclosedFiles = unclosedFiles.map(fileInfoMapping)
      output.unclosedFilesCount = unclosedFiles.length

      const userFilesRepo = this.em.getRepository(UserFile)

      // Check if user has any folders that has both parent_folder_id and scoped_parent_folder_id
      const userNodes = await this.em.getRepository(Node).find({ user: user.id })
      let filesAndFoldersErrorsCount = 0
      const filesAndFoldersStatus: any[] = []
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
          const httpsFiles = await client.filesList({
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
        } else if (node.isFile || node.isAsset) {
          if (node.project && node.dxid) {
            // Some files have enough data, but they might not exist on the platform
            const response = await client
              .fileDescribe({ fileDxid: node.dxid, projectDxid: node.project })
              .catch((error) => error.props.clientResponse)
            if (response.error) {
              errors.push(`Error: ${response.error.message}`)
            }
          } else {
            errors.push(
              `Error: node does not exist on platform or is missing project (${node.project}) / dxid (${node.dxid})`,
            )
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

      // Check the billTo of any Spaces to which the user is a lead
      // Review spaces for the fix on billTo
      // Private spaces for the legacy org conversion
      const spacesInfo: any[] = []

      await user.spaceMemberships.init()
      const spaceMemberships = user.spaceMemberships
      for (const membership of spaceMemberships) {
        if (membership.isLead()) {
          await membership.spaces.init()
          for (const space of membership.spaces) {
            const isCheckedSpace = [SPACE_TYPE.REVIEW, SPACE_TYPE.PRIVATE_TYPE].includes(space.type)
            if (!isCheckedSpace) continue

            const errors: string[] = []
            const isHostSide = membership.side === SPACE_MEMBERSHIP_SIDE.HOST
            const membershipSide = isHostSide ? 'host' : 'guest'
            const projectDxid = space[`${membershipSide}Project`]
            const spaceType = SPACE_TYPE[space.type]
            let projectInfo: any = {}

            if (projectDxid) {
              projectInfo = await client.projectDescribe({ projectDxid, body: {} })
              if (projectInfo.billTo !== user.billTo()) {
                errors.push(
                  `Error: [space-${space.id} (type: ${spaceType})] Project billTo (${projectInfo.billTo}) does not match ${membershipSide} lead's org (${user.billTo()})`,
                )
              }
            } else {
              // Host project is always required
              // Guest project maybe missing when guest lead has not activated yet
              if (isHostSide) {
                errors.push(
                  `Error: [space-${space.id} (type: ${spaceType})] Host Project is missing`,
                )
              }
            }

            const hostLead = await space.findHostLead()
            const guestLead = await space.findGuestLead()
            if (errors.length) {
              spacesInfo.push({
                id: space.id,
                spaceType: spaceType,
                state: space.state,
                spaceId: space.spaceId,
                hostDxOrg: space.hostDxOrg,
                hostLead: hostLead?.dxuser,
                guestDxtOrg: space.guestDxOrg,
                guestLead: guestLead?.dxuser,
                side: membership.side ? 'Guest' : 'Host',
                projectInfo,
                status: errors.join('\n'),
              })
            }
          }
        }
      }
      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      // Update lastDataCheckup for user
      const updated = wrap(user).assign({ lastDataCheckup: new Date() }, { em: this.em })
      this.em.persist(updated)

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

    return output
  }

  private async sendReportEmail(output: UserDataConsistencyReportOutput): Promise<void> {
    const adminUser = await this.em.getRepository(User).findAdminUser()
    const body = userDataConsistencyReportTemplate({
      receiver: adminUser,
      content: output,
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.userDataConsistencyReport,
      to: adminUser.email,
      subject: `User Data Consistency Report for ${this.user.dxuser}`,
      body,
    }

    const jobId = getBullJobIdForEmailOperation(EMAIL_TYPES.userDataConsistencyReport)
    this.logger.log('UserDataConsistencyReportService: Sending report email to admin')
    const tempUserCtx: UserCtx = {
      id: adminUser.id,
      dxuser: adminUser.dxuser,
      accessToken: 'notUsed',
    }

    await this.emailsJobProducer.createSendEmailTask(email, tempUserCtx, jobId)
  }
}
