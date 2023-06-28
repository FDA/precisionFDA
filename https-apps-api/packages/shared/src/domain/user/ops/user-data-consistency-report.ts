/* eslint-disable @typescript-eslint/no-floating-promises */
import { BaseOperation } from '../../../utils/base-operation'
import { UserCtx, UserOpsCtx } from '../../../types'
import { PlatformClient } from '../../../platform-client'
import { Folder, Node, UserFile } from '../../user-file'
import { User } from '../..'
import { Task, TASK_TYPE } from '../../../queue/task.input'
import { config, database, queue } from '@pfda/https-apps-shared'
import { Job } from 'bull'
import { findUnclosedFilesOrAssets, getNodePath } from '../../user-file/user-file.helper'
import { SPACE_MEMBERSHIP_SIDE } from '../../space-membership/space-membership.enum'
import { EMAIL_TYPES, EmailSendInput } from '../../email/email.config'
import { EmailSendOperation } from '../../email'
import { createSendEmailTask } from '../../../queue'
import { userDataConsistencyReportTemplate } from '../../email/templates/mjml/user-data-consistency-report.template'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { wrap } from '@mikro-orm/core'


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
  httpsFilesCount?: number
  httpsFoldersCount?: number
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
//
export class UserDataConsistencyReportOperation extends BaseOperation<
UserOpsCtx,
never,
UserDataConsistencyReportOutput
> {
  static getTaskType(): TASK_TYPE.USER_DATA_CONSISTENCY_REPORT {
    return TASK_TYPE.USER_DATA_CONSISTENCY_REPORT
  }

  static getBullJobId(dxuser: string): string {
    return `${this.getTaskType()}.${dxuser}`
  }

  static doesUserNeedFullCheckup(user: User): boolean {
    const lastCheckupTime = user.lastDataCheckup ? user.lastDataCheckup.getTime() : 0
    const now = new Date().getTime()
    // N.B. getTime return milliseconds, config settings are in seconds
    return (now - lastCheckupTime) > config.workerJobs.userDataConsistencyReport.repeatSeconds * 1000
  }

  static async enqueue(userCtx: UserCtx): Promise<Job<Task>> {
    const queueData = {
      type: UserDataConsistencyReportOperation.getTaskType(),
      user: userCtx,
    }
    const jobId = UserDataConsistencyReportOperation.getBullJobId(userCtx.dxuser)
    return await queue.addToQueueEnsureUnique(queue.getFileSyncQueue(), queueData, jobId)
  }

  async run(): Promise<any> {
    const userCtx = this.ctx.user
    const log = this.ctx.log
    let em: SqlEntityManager = this.ctx.em
    try {
      const dbReplicaService = await database.createDatabaseReplicaService()
      await dbReplicaService.start()
      em = dbReplicaService.getOrm()!.em
    } catch (error) {
      log.warn('Cannot create dbReplicaService, using main db')
    }

    let output: UserDataConsistencyReportOutput = {}

    log.info({
      id: userCtx.id,
      dxuser: userCtx.dxuser,
    }, 'UserDataConsistencyReportOperation: Starting')

    const userRepo = em.getRepository(User)
    const user = await userRepo.findDxuser(userCtx.dxuser)
    if (!user) {
      log.error({
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      }, 'UserDataConsistencyReportOperation: Error user not found')

      return { 'error': `User ${userCtx.id} (${userCtx.dxuser}) not found` }
    }

    try {
      output.user = {
        id: userCtx.id,
        dxuser: userCtx.dxuser,
      }

      // Check if user's email on pFDA matches that on platform
      //
      const client = new PlatformClient(userCtx.accessToken, log)
      const userDescribe = await client.userDescribe({
        dxid: user.dxid,
        defaultFields: true,
        fields: {
          email: true
        }
      })

      if (userDescribe.email !== user.email) {
        output.user = {
          ...output.user,
          dxid: user.dxid,
          email: `Error: email on pFDA (${user.email}) does not match platform (${userDescribe.email})`
        }
      } else {
        output.user = {
          ...output.user,
          dxid: user.dxid,
          email: `email (${user.email}) on pFDA matches platform`
        }
      }


      // Check user's private projects' billTo
      //
      const privateProjects: any = {}
      const generateProjectInfo = async (projectDxid: string | undefined) => {
        if (!projectDxid) {
          return 'Does not exist'
        }

        const projectDescribe = await client.projectDescribe({
          projectDxid,
          body: {},
        })
        const correctBillTo = (projectDescribe.billTo === user.billTo())
        return {
          status: correctBillTo ? `billTo is correct (${projectDescribe.billTo})`
                   : `Error: Project billTo (${projectDescribe.billTo}) does not match user's org ${user.billTo()}`,
          projectDescribe,
        }
      }
      privateProjects['user.privateFilesProject'] = await generateProjectInfo(user.privateFilesProject)
      privateProjects['user.publicFilesProject'] = await generateProjectInfo(user.publicFilesProject)
      privateProjects['user.privateComparisonsProject'] = await generateProjectInfo(user.privateComparisonsProject)
      privateProjects['user.publicComparisonsProject'] = await generateProjectInfo(user.publicComparisonsProject)
      output.privateProjects = privateProjects
      output.privateProjectsCount = privateProjects.length


      // Check if users have any unclosed files or assets remaining
      //
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
      const unclosedFiles = await findUnclosedFilesOrAssets(em, user.id)
      output.unclosedFiles = unclosedFiles.map(fileInfoMapping)
      output.unclosedFilesCount = unclosedFiles.length


      const userFilesRepo = em.getRepository(UserFile)
      const folderRepo = em.getRepository(Folder)

      // Check if user has any folders that has both parent_folder_id and scoped_parent_folder_id
      //
      const userNodes = await em.getRepository(Node).find({ userId: user.id })
      let filesAndFoldersErrorsCount = 0
      const filesAndFoldersStatus: any[] = []
      for (const node of userNodes) {
        let errors: string[] = []

        const hasInvalidFolderState = (node.parentFolderId && node.scopedParentFolderId)
        if (hasInvalidFolderState) {
          errors.push('Error: parent_folder_id and both scoped_parent_folder_id are both set')
        }

        if (node.isFolder) {
          if (node.project) {
            // If node.project is set for a folder, it means it should exist on platform
            // make sure all the files inside it have the right prefix
            const folder = await folderRepo.findOne({ id: node.id })
            if (folder) {
              const children = folder?.children
              for (const child of children) {
                if (child.isFile && child.dxid) {
                  const response = await client.fileDescribe({ fileDxid: child.dxid, projectDxid: child.project! })
                    .catch((error) => error.props.clientResponse)
                  const nodePath = await getNodePath(em, child.parentFolder)
                  if (response?.folder !== nodePath) {
                    errors.push(`Error: File ${child.dxid} location on platform ${response?.folder} does not match location on pFDA ${nodePath}. Folder id = ${folder.id}`)
                  } else if (response.error) {
                    errors.push(`Error: ${response.error.message}`)
                  } else {
                    errors.push(`Error: something went wrong when checking file ${node.project}:/${child.dxid} on platform. Response: ${JSON.stringify(response)}`)
                  }
                }
              }
            }
          } else {
            errors.push(`Error: folder does not exist on platform or is missing project (${node.project})`)
          }
        } else if (node.isFile || node.isAsset) {
          if (node.project && node.dxid) {
            const response = await client.fileDescribe({ fileDxid: node.dxid, projectDxid: node.project })
              .catch((error) => error.props.clientResponse)
            if (response?.id === node.dxid) {
              // File exists on platform, check if its parent path is the same
              const nodePath = node.parentFolder ? await getNodePath(em, node.parentFolder) : '/'
              if (response.folder !== nodePath) {
                errors.push(`Error: File ${node.dxid} location on platform ${response.folder} does not match location on pFDA ${nodePath}. Folder id: ${node.id}. File type: ${node.stiType}`)
              }
            } else if (response.error) {
              errors.push(`Error: ${response.error.message}`)
            } else {
              errors.push(`Error: something went wrong when checking file ${node.project}:/${node.dxid} on platform. Response: ${JSON.stringify(response)}`)
            }
          } else {
            errors.push(`Error: node does not exist on platform or is missing project (${node.project}) / dxid (${node.dxid})`)
          }
        }

        if (errors.length > 0) {
          const nodeInfo = {
            id: node.id,
            name: node.name,
            parentFolderId: node.parentFolderId,
            scopedParentFolderId: node.scopedParentFolderId,
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


      // Check if user has any local files and folders
      //
      output.httpsFilesCount = await userFilesRepo.count({ userId: user.id }, { filters: ['https'] })
      output.httpsFoldersCount = await folderRepo.count({ userId: user.id }, { filters: ['https'] })


      // Check the billTo of any Spaces to which the user is a lead
      //
      const spacesInfo: any[] = []

      await user.spaceMemberships.init()
      const spaceMemberships = user.spaceMemberships
      for (const membership of spaceMemberships) {
        if (membership.isLead()) {
          await membership.spaces.init()
          for (const space of membership.spaces) {
            const errors: string[] = []
            const membershipSide = (membership.side === SPACE_MEMBERSHIP_SIDE.HOST) ? 'host' : 'guest'
            const spaceOrg = space[`${membershipSide}DxOrg`]
            const projectDxid = space[`${membershipSide}Project`]
            const projectInfo =  await generateProjectInfo(projectDxid)
            if (typeof projectInfo === 'object' && projectInfo.status.startsWith('Error')) {
              errors.push(projectInfo.status)
            }

            // Double check admin list from platform
            const orgDescribe = await client.orgDescribe({ dxid: spaceOrg })
            const userInAdminList = orgDescribe.admins && orgDescribe.admins.find(x => x === user.dxid)
            if (!userInAdminList) errors.push(`Error: user is not in platform's admin list - ${orgDescribe.admins}`)

            const members = await client.orgFindMembers({ orgDxid: spaceOrg })
            const userMembershipOnPlatform = members.results.filter(x => x.id === user.dxid)

            const hostLead = await space.findHostLead()
            const guestLead = await space.findGuestLead()
            if (errors.length) {
              spacesInfo.push({
                id: space.id,
                spaceType: space.type,
                state: space.state,
                spaceId: space.spaceId,
                hostDxOrg: space.hostDxOrg,
                hostLead: hostLead?.dxuser,
                guestDxtOrg: space.guestDxOrg,
                guestLead: guestLead?.dxuser,
                side: membership.side ? 'Guest' : 'Host',
                projectInfo,
                userMembershipOnPlatform,
                status: errors.join('\n')
              })
            }
          }
        }
      }
      output.spaces = spacesInfo
      output.spacesWithErrorsCount = spacesInfo.length

      // Update lastDataCheckup for user
      const updated = wrap(user).assign({ lastDataCheckup: new Date() }, { em })
      em.persist(updated)

      await this.sendReportEmail(output)

      log.info({
        id: userCtx.id,
        dxuser: userCtx.dxuser,
        output,
      }, 'UserDataConsistencyReportOperation: Completed')
    } catch (error) {
      log.error({ error, output }, 'UserDataConsistencyReportOperation: Error')
    }

    return output
  }

  private async sendReportEmail(output: UserDataConsistencyReportOutput): Promise<void> {
    const adminUser = await this.ctx.em.getRepository(User).findAdminUser()
    const body = userDataConsistencyReportTemplate({
      receiver: adminUser,
      content: output,
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.userDataConsistencyReport,
      to: adminUser.email,
      subject: `User Data Consistency Report for ${this.ctx.user.dxuser}`,
      body,
    }

    const jobId = EmailSendOperation.getBullJobId(EMAIL_TYPES.userDataConsistencyReport)
    this.ctx.log.info('UserDataConsistencyReportOperation: Sending report email to admin')
    const tempUserCtx: UserCtx = { id: adminUser.id, dxuser: adminUser.dxuser, accessToken: 'notUsed' }
    await createSendEmailTask(email, tempUserCtx, jobId)
  }
}
