/* eslint-disable max-len */
// just a bunch of api calls that will be easy to mock
import axios, { AxiosRequestConfig } from 'axios'
import { isNil, omit } from 'ramda'
import type { Logger } from 'pino'
import { errors } from '..'
import { config } from '../config'
import { getLogger } from '../logger'
import type { AnyObject } from '../types'
import { maskAuthHeader } from '../utils/logging'
import { OrgMembershipError } from '../errors'
import { SPACE_MEMBERSHIP_SIDE } from '../domain/space-membership/space-membership.enum'
import {
  CreateFolderParams, DbClusterActionParams, DbClusterCreateParams, DbClusterDescribeParams, DescribeFoldersParams, DescribeDataObjectsParams,
  FileCloseParams, FileDescribeParams, FileDownloadLinkParams, FileStatesParams, FindSpaceMembersParams, ListFilesParams, MoveFilesParams,
  JobCreateParams, JobDescribeParams, JobTerminateParams, RemoveFolderParams, RenameFolderParams, UserInviteToOrgParams, UserRemoveFromOrgParams,
  UserResetMfaParams, UserUnlockParams, Starting, WorkflowDescribeParams, AppDescribeParams, FileRemoveParams
} from './platform-client.params'
import {
  JobCreateResponse, JobTerminateResponse, ClassIdResponse, JobDescribeResponse, DescribeFoldersResponse, DbClusterDescribeResponse,
  FileCloseResponse, IPaginatedResponse, FileDescribeResponse, FileStatesResponse, FileStateResult, ListFilesResult, ListFilesResponse,
  FindSpaceMembersReponse, UserInviteToOrgResponse, UserRemoveFromOrgResponse, DescribeDataObjectsResponse, FileDownloadLinkResponse,
  WorkflowDescribeResponse, AppDescribeResponse, FileRemoveResponse,
} from './platform-client.responses'
import { IPlatformAuthClient, PlatformAuthClient } from './platform-auth-client'

type DbClusterAction = 'start' | 'stop' | 'terminate'

export enum PlatformErrors {
  ResourceNotFound = 'ResourceNotFound',
  PermissionDenied = 'PermissionDenied',
  InvalidInput = 'InvalidInput',
}

const defaultLog = getLogger('platform-client-logger')

class PlatformClient {
  accessToken: string
  log: Logger

  constructor(accessToken: string, logger?: Logger) {
    this.accessToken = accessToken
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.log = logger ?? defaultLog
  }

  // ---------------
  //    J O B S
  // ---------------

  async jobCreate(params: JobCreateParams): Promise<JobCreateResponse> {
    const url = `${config.platform.apiUrl}/${params.appId}/run`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'appId'], params) },
      url,
    }
    return await this.sendRequest(options, url)
  }

  async jobTerminate(params: JobTerminateParams): Promise<JobTerminateResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/terminate`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
  }

  async jobDescribe(params: JobDescribeParams): Promise<JobDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.jobId}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options, url)
  }


  // ----------------------
  //    F I L E S
  // ----------------------

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
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
  }

  /**
   * Describe a single file's attributes
   * API: /file-xxxx/describe
   * @see https://documentation.dnanexus.com/developer/api/introduction-to-data-object-classes/files#api-method-file-xxxx-describe
   */
  async fileDescribe(params: FileDescribeParams): Promise<FileDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.fileDxid}/describe`
    const data: AnyObject = {
      project: params.projectDxid,
      defaultFields: true,
    }
    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
  }

  /**
   * Given a list of fileDxids, query platform the the current file states
   * This is designed to only query files within the same dx project, because without the project hint
   * the /system/findDataObjects call is very inefficient and can take a long time
   */
  async fileStates(params: FileStatesParams): Promise<FileStateResult[]> {
    return await this.sendAndAggregatePaginatedRequest<FileStateResult, FileStatesResponse>((nextMapping) => this.fileStatesPaginated(params, nextMapping))
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
    return await this.sendRequest(options, url)
  }

  async filesList(params: ListFilesParams): Promise<ListFilesResult[]> {
    return await this.sendAndAggregatePaginatedRequest<ListFilesResult, ListFilesResponse>((nextMapping) => this.filesListPaginated(params, nextMapping))
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
      preauthenticated: true,
    }

    const options: AxiosRequestConfig = {
      method: 'POST',
      data,
      url,
    }
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
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

    return await this.sendRequest(options, url)
  }

  async dbClusterCreate(params: DbClusterCreateParams): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/dbcluster/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken'], params) },
      url,
    }

    return await this.sendRequest(options, url)
  }

  async dbClusterDescribe(params: DbClusterDescribeParams): Promise<DbClusterDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: { ...omit(['accessToken', 'dxid'], params) },
      url,
    }

    return await this.sendRequest(options, url)
  }

  // ---------------
  //    U S E R S
  // ---------------

  async findSpaceMembers(params: FindSpaceMembersParams): Promise<FindSpaceMembersReponse> {
    const url = `${config.platform.apiUrl}/${params.spaceOrg}/findMembers`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options, url)
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
    return await this.sendRequest(options, url)
  }

  /**
   * Removes user from provided organization. Also revokes access to projects & apps associated with org.
   * @see https://documentation.dnanexus.com/developer/api/organizations#api-method-org-xxxx-invite
   */
  async removeUserFromOrganization(params: UserRemoveFromOrgParams): Promise<UserRemoveFromOrgResponse> {
    const url = `${config.platform.apiUrl}/${params.orgDxId}/removeMember`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.data,
      url,
    }
    return await this.sendRequest(options, url)
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
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err, (_, __, message) => {
        if (message.includes('MFA is already reset')) {
          throw new errors.MfaAlreadyResetError()
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
      this.logClientRequest(options, url)
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
 * Creates a new project
 * @see https://documentation.dnanexus.com/developer/api/data-containers/projects#api-method-project-new
 * @param {string} name - OPTIONAL - overrides new project name.
 * @param {Space} space - used for project name, can be overriden by name param.
 * @param {SpaceMembership} admin - used for project's billTo and project name (name can be overriden by name param)
 */
  async projectCreate(params: any): Promise<ClassIdResponse> {
    const url = `${config.platform.apiUrl}/project/new`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {
        name: params.name ?? `precisionfda-${params.space.uid}-${SPACE_MEMBERSHIP_SIDE[params.admin.side]}`,
        billTo: params.admin.user.getEntity().organization.getEntity().getDxOrg(),
      },
      url,
    }
    return await this.sendRequest(options, url)
  }

  /**
   * Invite org or user in project.
   *  @see https://documentation.dnanexus.com/developer/api/data-containers/project-permissions-and-sharing#api-method-project-xxxx-invite
   *  @param {string} invitee - OrgDxID, UserID or user's email.
   *  @param {string} level - Permission level.
   *  @return [don't know yet]
  */
  async projectInvite(params: any): Promise<{ id: string, state: string }> {
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
    return await this.sendRequest(options, url)
  }

  async projectDescribe(params: any): Promise<any> {
    const url = `${config.platform.apiUrl}/${params.projectDxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: params.body,
      url,
    }
    return await this.sendRequest(options, url)
  }

  // ---------------------
  //    ENTITY-DESCRIBE
  // ---------------------

  async appDescribe(params: AppDescribeParams): Promise<AppDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options, url)
  }

  async workflowDescribe(params: WorkflowDescribeParams): Promise<WorkflowDescribeResponse> {
    const url = `${config.platform.apiUrl}/${params.dxid}/describe`
    const options: AxiosRequestConfig = {
      method: 'POST',
      data: {},
      url,
    }
    return await this.sendRequest(options, url)
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
  async describeDataObjects(params: DescribeDataObjectsParams): Promise<DescribeDataObjectsResponse> {
    const url = `${config.platform.apiUrl}/system/describeDataObjects`
    const options: AxiosRequestConfig = {
      method: 'POST',
      url,
    }
    return await this.sendRequest(options, url)
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
  private async sendAndAggregatePaginatedRequest<T, TResponse extends IPaginatedResponse<T>>(requestFunc: (starting: Starting | undefined) => Promise<TResponse>): Promise<T[]> {
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

  private async sendRequest(options: AxiosRequestConfig, url: string) {
    try {
      options.headers = this.setupHeaders()
      this.logClientRequest(options, url)
      const res = await axios.request(options)
      return res.data
    } catch (err) {
      this.logClientFailed(options)
      return this.handleFailed(err)
    }
  }

  private logClientRequest(options: AxiosRequestConfig, url: string): void {
    const sanitized = maskAuthHeader(options.headers)
    this.log.info(
      { requestOptions: { ...options, headers: sanitized }, url },
      'PlatformClient: Running DNANexus API request',
    )
  }

  private logClientFailed(options: AxiosRequestConfig): void {
    const sanitized = {}
    this.log.warn(
      { requestOptions: { ...options, headers: sanitized } },
      'PlatformClient Error: Failed request options',
    )
  }

  private setupHeaders(): AnyObject {
    return { authorization: `Bearer ${this.accessToken}` }
  }

  private handleFailed(
    err: any,
    customErrorThrower?: (statusCode: number, errorType: string, errorMessage: string) => void,
  ): any {
    // response status code is NOT 2xx
    if (err.response) {
      this.log.error(
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
      throw new errors.ClientRequestError(
        `${errorType} (${statusCode}): ${errorMessage}`,
        {
          clientResponse: err.response.data,
          clientStatusCode: statusCode,
        },
      )
    } else if (err.request) {
      // the request was made but no response was received
      this.log.error({ err }, 'Error: Failed platform request - no response received')
    } else {
      this.log.error({ err }, 'Error: Failed platform request - different error')
    }
    // todo: handle this does not result in 500 API error
    // TODO(2): Need to consider other error types and handle them with a descriptive message
    // e.g. See ETIMEOUT error in platform-client.mock.ts
    const errorMessage = err.stack || err.message || 'Unknown error - no platform response received'
    throw new errors.ClientRequestError(
      errorMessage,
      {
        clientResponse: err.response?.data || 'No platform response',
        clientStatusCode: err.response?.status || 408,
      },
    )
  }
}

export {
  PlatformClient,
  IPlatformAuthClient,
  PlatformAuthClient,
  JobDescribeResponse,
  JobCreateResponse,
  ListFilesResponse,
  ClassIdResponse,
  JobCreateParams,
  DescribeFoldersResponse,
  DbClusterCreateParams,
  DbClusterDescribeResponse,
}
