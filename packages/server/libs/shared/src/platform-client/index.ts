/* eslint-disable max-len */
import type { Logger } from '@nestjs/common'
// just a bunch of api calls that will be easy to mock
import { DxId } from '@shared/domain/entity/domain/dxid'
import axios, { AxiosRequestConfig } from 'axios'
import { isNil, omit } from 'ramda'
import { WebSocket } from 'ws'
import { config } from '../config'
import { SPACE_MEMBERSHIP_SIDE } from '../domain/space-membership/space-membership.enum'
import { ClientRequestError, MfaAlreadyResetError, OrgMembershipError } from '../errors'
import { getLogger } from '../logger'
import type { AnyObject } from '../types'
import { maskAuthHeader } from '../utils/logging'
import {
  AppAddAuthorizedUsersParams,
  AppCreateParams,
  AppDescribeParams,
  AppletCreateParams,
  AppPublishParams,
  CloneObjectsParams,
  CreateFolderParams,
  DbClusterActionParams,
  DbClusterCreateParams,
  DbClusterDescribeParams,
  DescribeDataObjectsParams,
  DescribeFoldersParams,
  FileCloseParams,
  FileCreateParams,
  FileDescribeParams,
  FileDownloadLinkParams,
  FileGetUploadUrlParams,
  FileRemoveParams,
  FileStatesParams,
  JobCreateParams,
  JobDescribeParams,
  JobFindParams,
  JobTerminateParams,
  ListFilesParams,
  MoveFilesParams,
  ObjectsParams,
  OrgDescribeParams,
  OrgFindMembersParams,
  ProjectLeaveParams,
  RemoveFolderParams,
  RenameFolderParams,
  Starting,
  UserDescribeParams,
  UserInviteToOrgParams,
  UserRemoveFromOrgParams,
  UserResetMfaParams,
  UserUnlockParams,
  WorkflowDescribeParams,
} from './platform-client.params'
import {
  AppDescribeResponse,
  ClassIdResponse,
  CloneObjectsResponse,
  DbClusterDescribeResponse,
  DescribeDataObjectsResponse,
  DescribeFoldersResponse,
  FileCloseResponse,
  FileDescribeResponse,
  FileDownloadLinkResponse,
  FileRemoveResponse,
  FileStateResult,
  FileStatesResponse,
  FindJobsResponse,
  GetUploadURLResponse,
  IPaginatedResponse,
  JobCreateResponse,
  JobDescribeResponse,
  JobTerminateResponse,
  ListFilesResponse,
  ListFilesResult,
  OrgDescribeResponse,
  OrgFindMembersReponse,
  UserDescribeResponse,
  UserInviteToOrgResponse,
  UserRemoveFromOrgResponse,
  WorkflowDescribeResponse,
} from './platform-client.responses'

type DbClusterAction = 'start' | 'stop' | 'terminate'

export enum PlatformErrors {
  ResourceNotFound = 'ResourceNotFound',
  PermissionDenied = 'PermissionDenied',
  InvalidInput = 'InvalidInput',
}

const defaultLog = getLogger('platform-client-logger')

export class PlatformClient {
  user: { accessToken: string }
  logger: Logger

  constructor(user: { accessToken: string }, logger?: Logger) {
    this.user = user
    this.logger = logger ?? defaultLog
  }

  // ---------------
  //    A P P S
  // ---------------

  /**
   * Creates a new applet object with the given applet specification.
   * API: /applet/new
   * @see https://documentation.dnanexus.com/developer/api/running-analyses/applets-and-entry-points#api-method-applet-new
   */
  async appletCreate(params: AppletCreateParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/applet/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Creates an app.
   * API: /app/new
   * @see https://documentation.dnanexus.com/developer/api/running-analyses/apps#api-method-app-new
   */
  async appCreate(params: AppCreateParams): Promise<ClassIdResponse<'app'>> {
    const url = `${config.platform.apiUrl}/app/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  async appAddAuthorizedUsers(params: AppAddAuthorizedUsersParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.appId}/addAuthorizedUsers`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        authorizedUsers: params.authorizedUsers,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  async appPublish(params: AppPublishParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.appId}/publish`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        makeDefault: params.makeDefault ?? false,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  // ---------------
  //    J O B S
  // ---------------

  /**
   * Searches for execution (job or analysis) objects.
   * API: /system/findJobs
   * @see https://documentation.dnanexus.com/developer/api/search#api-method-system-findjobs
   */
  async jobFind(params: JobFindParams) {
    const url = `${config.platform.apiUrl}/system/findJobs`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
    }
    return await this.sendRequest<FindJobsResponse>(options)
  }

  async jobCreate(params: JobCreateParams): Promise<JobCreateResponse> {
    const url = `${config.platform.apiUrl}/${params.appId}/run`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'appId'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  async jobTerminate(params: JobTerminateParams): Promise<JobTerminateResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/terminate`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  async renameFolder(params: RenameFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/renameFolder`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        folder: params.folderPath,
        name: params.newName,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  async folderRemove(params: RemoveFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/removeFolder`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        folder: params.folderPath,
        recurse: true,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  async jobDescribe(params: JobDescribeParams): Promise<JobDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  streamJobLogs(jobDxId: DxId<'job'>): WebSocket {
    const host = new URL(config.platform.apiUrl).host
    const ws = new WebSocket(`wss://${host}/${jobDxId}/getLog/websocket`)
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          access_token: this.user.accessToken,
          token_type: 'Bearer',
        }),
      )
    })
    ws.on('error', (error) => {
      ws.terminate()
      this.logger.error(`Error streaming job logs: ${error}`)
    })
    return ws
  }

  // ----------------------
  //    F I L E S
  // ----------------------

  /**
   * Creates a new file object.
   * API: /file/new
   * @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-new
   * @param params name and description of the file
   */
  async fileCreate(params: FileCreateParams): Promise<ClassIdResponse<'file'>> {
    const url = `${config.platform.apiUrl}/file/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params,
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Removes nodes specified by their ids. Works recursively and
   * therefore contents of folders is removed as well.
   *
   * @param params ids of nodes that should be removed
   * @returns
   */
  async fileRemove(params: FileRemoveParams): Promise<FileRemoveResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/removeObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { objects: params.ids },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Removes user from provided organization. Also revokes access to projects & apps associated with org.
   * API: /file-xxxx/close
   * @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-close
   */
  async fileClose(params: FileCloseParams): Promise<FileCloseResponse> {
    const url = `${config.platform.apiUrl}/${params.fileDxid}/close`
    const options: AxiosRequestConfig = {
      method: 'POST',
      // Need empty payload to pass platform validation
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Describe a single file's attributes
   * API: /file-xxxx/describe
   * @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-describe
   */
  async fileDescribe(params: FileDescribeParams, data?: AnyObject): Promise<FileDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.fileDxid}/describe`
    const defaultData: AnyObject = {
      project: params.projectDxid,
      fields: {
        id: true,
        state: true,
        size: true,
      },
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: data ?? defaultData,
      url,
    }
    return await this.sendRequest(options)
  }

  async fileStatesPaginated(
    params: FileStatesParams,
    starting: Starting | undefined,
  ): Promise<FileStatesResponse> {
    const data: AnyObject = {
      class: 'file',
      limit: config.platform.findDataObjectsQueryLimit,
      id: params.fileDxids,
      scope: {
        project: params.projectDxid,
        recurse: true,
      },
      describe: {
        fields: {
          name: true,
          size: true,
          state: true,
        },
      },
    }
    if (!isNil(starting)) {
      data.starting = starting
    }

    // Documentation for platform API /system/findDataObjects
    // https://documentation.dnanexus.com/developer/api/search#api-method-system-finddataobjects
    const url = `${config.platform.apiUrl}/system/findDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Given a list of fileDxids, query platform the current file states
   * This is designed to only query files within the same dx project, because without the project hint
   * the /system/findDataObjects call is very inefficient and can take a long time
   */
  async fileStates(params: FileStatesParams): Promise<FileStateResult[]> {
    return await this.sendAndAggregatePaginatedRequest<FileStateResult, FileStatesResponse>(
      (nextMapping) => this.fileStatesPaginated(params, nextMapping),
    )
  }

  private async filesListPaginated(
    params: ListFilesParams,
    starting: Starting | undefined,
  ): Promise<ListFilesResponse> {
    const data: AnyObject = {
      class: 'file',
      limit: config.platform.findDataObjectsQueryLimit,
    }
    if (!isNil(starting)) {
      data.starting = starting
    }

    const scope = {
      project: params.project,
      folder: params.folder ?? '/',
      recurse: false,
    }
    data.scope = scope
    if (!isNil(params.includeDescProps)) {
      data.describe = {
        fields: {
          name: true,
          created: true,
          modified: true,
          size: true,
          state: true,
        },
      }
    }
    // Documentation for platform API /system/findDataObjects
    // https://documentation.dnanexus.com/developer/api/search#api-method-system-finddataobjects
    const url = `${config.platform.apiUrl}/system/findDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options)
  }

  async filesList(params: ListFilesParams): Promise<ListFilesResult[]> {
    return await this.sendAndAggregatePaginatedRequest<ListFilesResult, ListFilesResponse>(
      (nextMapping) => this.filesListPaginated(params, nextMapping),
    )
  }

  /**
   * Creates a download link for the file
   * API: /file-xxxx/download
   * @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-download
   */
  async fileDownloadLink(params: FileDownloadLinkParams): Promise<FileDownloadLinkResponse> {
    const url = `${config.platform.apiUrl}/${params.fileDxid}/download`
    const data = {
      ...omit(['fileDxid'], params),
      preauthenticated: params.preauthenticated ?? true,
    }

    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options)
  }

  async getFileUploadUrl(params: FileGetUploadUrlParams) {
    const url = `${config.platform.apiUrl}/${params.dxid}/upload`
    const data = {
      size: params.size,
      md5: params.md5,
      index: params.index,
    }

    return await this.sendRequest<GetUploadURLResponse>({ method: 'POST', url, data })
  }

  // ----------------------
  //    F O L D E R S
  // ----------------------

  async foldersList(params: DescribeFoldersParams): Promise<DescribeFoldersResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { fields: { folders: true } },
      url,
    }
    return await this.sendRequest(options)
  }

  async folderCreate(params: CreateFolderParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/newFolder`
    const data: AnyObject = {
      folder: params.folderPath,
      parents: true,
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options)
  }

  async filesMoveToFolder(params: MoveFilesParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectId}/move`
    // todo: keep in mind max. amounts of files
    const data: AnyObject = {
      objects: params.fileIds,
      destination: params.destinationFolderPath,
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options)
  }

  // -----------------------
  //    D B C L U S T E R
  // -----------------------

  async dbClusterAction(
    params: DbClusterActionParams,
    action: DbClusterAction,
  ): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/${action}`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }

    return await this.sendRequest(options)
  }

  async dbClusterCreate(params: DbClusterCreateParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/dbcluster/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
    }

    return await this.sendRequest(options)
  }

  async dbClusterDescribe(params: DbClusterDescribeParams): Promise<DbClusterDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'dxid'], params) },
      url,
    }

    return await this.sendRequest(options)
  }

  // ---------------
  //    O R G S
  // ---------------

  /**
   * Describe the org
   * API: /org-xxxx/describe
   * See https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-describe
   */
  async orgDescribe(params: OrgDescribeParams): Promise<OrgDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['dxid'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Find members of the org
   * API: /org-xxxx/findMembers
   * See https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-findmembers
   *
   * Note that we're currently not handling the pagination aspect of this call, so >1000 members is an issue
   */
  async orgFindMembers(params: OrgFindMembersParams): Promise<OrgFindMembersReponse> {
    const url = `${config.platform.apiUrl}/${params.orgDxid}/findMembers`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['orgDxid'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Invites user to provided organization.
   * @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-invite
   */
  async inviteUserToOrganization(params: UserInviteToOrgParams): Promise<UserInviteToOrgResponse> {
    const url = `${config.platform.apiUrl}/${params.orgDxId}/invite`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Removes user from provided organization. Also revokes access to projects & apps associated with org.
   * @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-invite
   */
  async removeUserFromOrganization(
    params: UserRemoveFromOrgParams,
  ): Promise<UserRemoveFromOrgResponse> {
    const url = `${config.platform.apiUrl}/${params.orgDxId}/removeMember`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
    }
    return await this.sendRequest(options)
  }

  // ---------------
  //    U S E R S
  // ---------------

  /**
   * Describe the user
   * API: /user-xxxx/describe
   * See https://documentation.dnanexus.com/developer/api/users#api-method-user-xxxx-describe
   */

  async userDescribe(params: UserDescribeParams): Promise<UserDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['dxid'], params) },
      url,
    }
    return await this.sendRequest(options)
  }

  // TODO - Refactor auth API into a separate class
  async userResetMfa(params: UserResetMfaParams) {
    const url = `${config.platform.authApiUrl}/${params.dxid}/resetUserMFA`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
    }

    try {
      options.headers = this.setupHeaders()
      this.logClientRequest(options)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err, (_, __, message) => {
        if (message.includes('MFA is already reset')) {
          throw new MfaAlreadyResetError()
        }
      })
    }
  }

  async userUnlock(params: UserUnlockParams) {
    const url = `${config.platform.apiUrl}/${params.dxid}/unlockUserAccount`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
    }

    try {
      options.headers = this.setupHeaders()
      this.logClientRequest(options)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err, (_, __, message) => {
        if (message.includes('must be an admin')) {
          throw new OrgMembershipError()
        }
      })
    }
  }

  // ---------------------
  //    P R O J E C T S
  // ---------------------
  /**
   * Removes the specified objects from the data container.
   * @see https://documentation.dnanexus.com/developer/api/data-containers/folders-and-deletion#api-method-class-xxxx-removeobjects
   * @param {string} containerDxid - container dxid
   * @param {string[]} objects - IDs to be removed from the container
   * @return [id string ID of the manipulated data container]
   */
  async containerRemoveObjects(
    containerDxid: string,
    params: ObjectsParams,
  ): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${containerDxid}/removeObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        objects: params.objects,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Creates a new project
   * @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-new
   * @param {string} name - OPTIONAL - overrides new project name.
   * @param {string} billTo - OPTIONAL - overrides new project billTo.
   * @param {Space} space - used for project name, can be overriden by name param.
   * @param {SpaceMembership} admin - used for project's billTo and project name (name can be overriden by name param)
   */
  async projectCreate(params: any): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/project/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        name:
          params.name ??
          `precisionfda-${params.space.uid}-${SPACE_MEMBERSHIP_SIDE[params.admin.side]}`,
        billTo: params.billTo ?? params.admin.user.getEntity().organization.getEntity().getDxOrg(),
      },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Invite org or user in project.
   *  @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-invite
   *  @param {string} invitee - OrgDxID, UserID or user's email.
   *  @param {string} level - Permission level.
   *  @return [don't know yet]
   */
  async projectInvite(params: any): Promise<{ id: string; state: string }> {
    const url = `${config.platform.apiUrl}/${params.projectDxid}/invite`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        invitee: params.invitee,
        level: params.level,
        // might add to params later for optional configuration
        suppressEmailNotification: true,
        suppressAllNotifications: true,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Describes the specified project.
   * @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-xxxx-describe
   * @param {string} projectDxid - ProjectDxID.
   * @param {object} body - OPTIONAL - Inputs.
   * @return {any}
   */
  async projectDescribe(params: any): Promise<any> {
    const url = `${config.platform.apiUrl}/${params.projectDxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.body ?? {},
      url,
    }
    return await this.sendRequest(options)
  }

  /**
   * Accept billing responsibility for the project, possibly on behalf of an org.
   * @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-accepttransfer
   * @param {string} billTo - billing account (user or org ID).
   * @return {any}
   */
  async projectAcceptTransfer(params: any): Promise<any> {
    const url = `${config.platform.apiUrl}/${params.projectDxid}/acceptTransfer`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        billTo: params.billTo,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  async projectLeave(params: ProjectLeaveParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${params.projectDxid}/leave`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  // -------------
  //    O R G S
  // -------------

  /**
   * Creates a new non-billable organization.
   * @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-new
   * @param {string} handle - A case-insensitively unique handle for the org.
   * @param {string} name - A descriptive name for the organization.
   * @return ID of the newly created organization ("org-" + handle)
   */
  async createOrg(handle: string, name: string): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/org/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        handle,
        name,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  async updateBillingInformation(orgDxid: string, billingInfo: any): Promise<any> {
    const billingConfirmation = process.env['BILLING_CONFIRMATION']
    if (billingConfirmation) {
      billingInfo['autoConfirm'] = billingConfirmation
    }
    const url = `${config.platform.apiUrl}/${orgDxid}/updateBillingInformation`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: billingInfo,
      url,
    }
    return await this.sendRequest(options)
  }

  // ---------------------
  //    ENTITY-DESCRIBE
  // ---------------------

  async objectDescribe(dxid: string): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/${dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  async appDescribe(params: AppDescribeParams): Promise<AppDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  async workflowDescribe(params: WorkflowDescribeParams): Promise<WorkflowDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options)
  }

  // ---------------------
  //    O B J E C T S
  // ---------------------

  async cloneObjects(params: CloneObjectsParams): Promise<CloneObjectsResponse> {
    const url = `${config.platform.apiUrl}/${params.sourceProject}/clone`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        objects: params.objects,
        project: params.destinationProject,
      },
      url,
    }
    return await this.sendRequest(options)
  }

  // -----------------
  //    S Y S T E M
  // -----------------

  /**
   * Describe data objects
   * @see https://documentation.dnanexus.com/developer/api/system-methods#api-method-system-describedataobjects
   * @param {any[]} objects
   * @param {any} classDescribeOptions
   * For param details look at platform API page
   */
  async describeDataObjects(
    params: DescribeDataObjectsParams,
  ): Promise<DescribeDataObjectsResponse> {
    const url = `${config.platform.apiUrl}/system/describeDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      url,
    }
    return await this.sendRequest(options)
  }

  // ---------------
  //    U T I L S
  // ---------------

  /**
   * Utility method for iterating through paginated queries and aggregating all results
   * @param requestFunc Function that calls the platform request, remember to insert the new
   *                    starting params to the reqeust
   * @returns Results of the aggregated request
   */
  private async sendAndAggregatePaginatedRequest<T, TResponse extends IPaginatedResponse<T>>(
    requestFunc: (starting: Starting | undefined) => Promise<TResponse>,
  ): Promise<T[]> {
    let nextMapping: Starting | undefined
    const results: T[] = []
    const paginateSeq = async (): Promise<void> => {
      do {
        // eslint-disable-next-line no-await-in-loop
        const res = await requestFunc(nextMapping)
        if (!isNil(res.next)) {
          // eslint-disable-next-line require-atomic-updates
          nextMapping = { id: res.next.id, project: res.next.project }
        } else {
          // eslint-disable-next-line require-atomic-updates
          nextMapping = undefined
        }
        results.push(...res.results)
      } while (!isNil(nextMapping))
    }
    await paginateSeq()
    return results
  }

  private async sendRequest<T>(options: AxiosRequestConfig) {
    try {
      options.headers = this.setupHeaders()
      this.logClientRequest(options)
      const res = await axios.request<T>(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  private logClientRequest(options: AxiosRequestConfig): void {
    const sanitized = maskAuthHeader(options.headers)
    this.logger.log(
      { requestOptions: { ...options, headers: sanitized }, url: options.url },
      'Running DNANexus API request',
    )
  }

  private logClientFailed(options: AxiosRequestConfig): void {
    const sanitized = {}
    this.logger.warn(
      { requestOptions: { ...options, headers: sanitized } },
      'PlatformClient Error: Failed request options',
    )
  }

  private setupHeaders(): AnyObject {
    return { authorization: `Bearer ${this.user.accessToken}` }
  }

  private handleFailed(
    err: any,
    customErrorThrower?: (statusCode: number, errorType: string, errorMessage: string) => void,
  ): never {
    // response status code is NOT 2xx
    if (err.response) {
      this.logger.error(
        {
          response: err.response.data,
          statusCode: err.response.status,
          resHeaders: err.response.headers,
        },
        'Error: Failed platform response',
      )

      // Error response from the platform has the following response data:
      //   "error": {
      //     "type": "PermissionDenied",
      //     "message": "BillTo for this job's project must have the \"httpsApp\" feature enabled to run this executable"
      //   }
      //
      // Howvever, there's also a class of error response where the response payload is HTML
      // See platform-client.mock.ts for more examples
      //
      const statusCode = err.response.status
      const errorType = err.response.data?.error?.type || 'Server Error'
      const errorMessage = err.response.data?.error?.message || err.response.data
      if (customErrorThrower) {
        customErrorThrower(statusCode, errorType, errorMessage)
      }
      throw new ClientRequestError(`${errorType} (${statusCode}): ${errorMessage}`, {
        clientResponse: err.response.data,
        clientStatusCode: statusCode,
      })
    } else if (err.request) {
      // the request was made but no response was received
      this.logger.error({ err }, 'Failed platform request - no response received')
    } else {
      this.logger.error({ err }, 'Failed platform request - different error')
    }
    // todo: handle this does not result in 500 API error
    // TODO(2): Need to consider other error types and handle them with a descriptive message
    // e.g. See ETIMEOUT error in platform-client.mock.ts
    const errorMessage = err.stack || err.message || 'Unknown error - no platform response received'
    throw new ClientRequestError(errorMessage, {
      clientResponse: err.response?.data || 'No platform response',
      clientStatusCode: err.response?.status || 408,
    })
  }
}
