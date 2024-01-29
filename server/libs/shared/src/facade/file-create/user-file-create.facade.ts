import { Injectable } from '@nestjs/common'
import { PlatformFileService } from '@shared/domain/platform/service/platform-file.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { InternalError } from '@shared/errors'
import { FILE_STATE_DX, PARENT_TYPE } from '../../domain/user-file/user-file.types'
import { FileCreate } from './model/file-create'
import { FileCreateWithContent } from './model/file-create-with-content'

@Injectable()
export class UserFileCreateFacade {
  constructor(
    private readonly user: UserContext,
    private readonly platformFileService: PlatformFileService,
    private readonly userFileService: UserFileService,
  ) {}

  async createFileWithContent(props: FileCreateWithContent) {
    const file = await this.createFile(props)
    await this.platformFileService.uploadFileContent(file, props.content)

    return file
  }

  async createFile({ name, project, scope, description }: FileCreate) {
    const dxid = (await this.platformFileService.createFile({ name, project, description }))?.id

    if (dxid == null) {
      throw new InternalError('Failed to create the file on the platform')
    }

    return await this.userFileService.createFile({
      parentId: this.user.id,
      parentType: PARENT_TYPE.USER,
      userId: this.user.id,
      name,
      state: FILE_STATE_DX.OPEN,
      scope,
      project,
      dxid,
      description,
    })
  }
}
