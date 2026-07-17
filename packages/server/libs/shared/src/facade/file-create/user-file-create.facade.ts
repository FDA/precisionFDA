import { Injectable } from '@nestjs/common'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { EntityUidResponseDTO } from '@shared/domain/entity/dto/entity-uid-response.dto'
import { JobService } from '@shared/domain/job/job.service'
import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AssetCreateDTO } from '@shared/domain/user-file/dto/asset-create.dto'
import { UserFileCreateDTO } from '@shared/domain/user-file/dto/user-file-create.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { InternalError, InvalidStateError, PermissionError } from '@shared/errors'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { FILE_STATE_DX, FILE_STATE_PFDA, PARENT_TYPE } from '../../domain/user-file/user-file.types'
import { FileCreate } from './model/file-create'
import { FileCreateWithContent } from './model/file-create-with-content'

@Injectable()
export class UserFileCreateFacade {
  constructor(
    private readonly user: UserContext,
    private readonly platformFileService: PlatformFileService,
    private readonly nodeService: NodeService,
    private readonly jobService: JobService,
    private readonly userService: UserService,
  ) {}

  async createFileWithContent(props: FileCreateWithContent, initCloseFile = true): Promise<UserFile> {
    const file = await this.saveFileToDB(props)
    await this.platformFileService.uploadFileContent(file, props.content)

    if (initCloseFile) {
      await this.nodeService.closeFile(file.uid)
    }

    return file
  }

  async createFile(input: UserFileCreateDTO): Promise<EntityUidResponseDTO> {
    const user = await this.user.loadEntity()

    if (input.scope === 'public' && !(await user?.isSiteAdmin())) {
      throw new PermissionError('Only site admin can create public files')
    }

    let folder: Folder = null
    if (input.folderId) {
      folder = await this.nodeService.getEditableFolder(input.folderId)
      if (!folder) {
        throw new InvalidStateError('Parent folder not found')
      }
      if (folder && folder.state === FILE_STATE_PFDA.REMOVING) {
        throw new InvalidStateError('Cannot add file to a folder that is being removed')
      }

      // Inherit the scope of the folder if the file is being created inside a folder
      input.scope = folder.scope
    }

    await this.userService.checkTotalChargesLimit()

    let parentType = PARENT_TYPE.USER
    let parentId = user.id
    if (input.parentType === PARENT_TYPE.JOB) {
      const job = await this.jobService.getEditableOne({ dxid: input.parentId })
      // file could be uploaded by CLI inside job; fall back to current_user if job is not found
      if (job) {
        parentType = PARENT_TYPE.JOB
        parentId = job.id
      }
    }

    const project = await user.getDestinationProjectId(input.scope, 'editable')
    if (!project) {
      throw new InvalidStateError('Scope does not exist or user does not have write access to the scope')
    }

    const isSpaceScope = EntityScopeUtils.isSpaceScope(input.scope)

    const file = await this.saveFileToDB({
      name: input.name,
      project,
      scope: input.scope,
      description: input.description ?? '',
      parentType,
      parentId,
      parentFolderId: !isSpaceScope ? folder?.id : null,
      scopedParentFolderId: isSpaceScope ? folder?.id : null,
    })
    return { uid: file.uid, id: file.uid }
  }

  async createAsset(input: AssetCreateDTO): Promise<EntityUidResponseDTO> {
    const user = await this.user.loadEntity()

    await this.userService.checkTotalChargesLimit()

    // Assets are always created in the user's private files project.
    const project = await user.getDestinationProjectId(STATIC_SCOPE.PRIVATE, 'editable')
    if (!project) {
      throw new InvalidStateError('User does not have access to a private files project')
    }

    const dxid = (
      await this.platformFileService.createFile({
        name: input.name,
        project,
        description: input.description ?? '',
      })
    )?.id as DxId<'file'>

    if (dxid == null) {
      throw new InternalError('Failed to create the asset on the platform')
    }

    const asset = await this.nodeService.createAsset(
      {
        dxid,
        project,
        name: input.name,
        description: input.description ?? '',
        userId: user.id,
        scope: STATIC_SCOPE.PRIVATE,
        state: FILE_STATE_DX.OPEN,
      },
      input.paths,
    )

    return { uid: asset.uid, id: asset.uid }
  }

  async saveFileToDB(input: FileCreate): Promise<UserFile> {
    const { name, project, description, scope, parentType, parentId } = input
    const dxid = (await this.platformFileService.createFile({ name, project, description }))?.id as DxId<'file'>

    if (dxid == null) {
      throw new InternalError('Failed to create the file on the platform')
    }

    return await this.nodeService.createFile({
      parentId: parentId ?? this.user.id,
      parentType: parentType ?? PARENT_TYPE.USER,
      userId: this.user.id,
      name,
      state: FILE_STATE_DX.OPEN,
      scope,
      project,
      dxid,
      description,
      parentFolderId: input.parentFolderId,
      scopedParentFolderId: input.scopedParentFolderId,
    })
  }
}
