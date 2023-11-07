import { PlatformFileService } from '../../domain/platform'
import { UserFileService } from '../../domain/user-file'
import { FILE_STATE_DX, PARENT_TYPE } from '../../domain/user-file/user-file.types'
import { UserCtx } from '../../types'
import { FileCreate } from './model/file-create'
import { FileCreateWithContent } from './model/file-create-with-content'

export class UserFileCreateFacade {
  private readonly userCtx
  private readonly platformFileService
  private readonly userFileService

  constructor(
    userCtx: UserCtx,
    platformFileService: PlatformFileService,
    userFileService: UserFileService,
  ) {
    this.userCtx = userCtx
    this.platformFileService = platformFileService
    this.userFileService = userFileService
  }

  async createFileWithContent(props: FileCreateWithContent) {
    const file = await this.createFile(props)
    await this.platformFileService.uploadFileContent(file, props.content)

    return file
  }

  async createFile({ name, project, scope, description }: FileCreate) {
    const dxid = (await this.platformFileService.createFile({ name, project, description })).id

    return await this.userFileService.createFile({
      parentId: this.userCtx.id,
      parentType: PARENT_TYPE.USER,
      userId: this.userCtx.id,
      name,
      state: FILE_STATE_DX.OPEN,
      scope,
      project,
      dxid,
      description,
    })
  }
}
