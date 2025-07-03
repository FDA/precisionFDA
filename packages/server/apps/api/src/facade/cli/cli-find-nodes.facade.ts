import { CliNodeSearchDTO } from '@shared/domain/cli/dto/cli-node-search.dto'
import { CliNodeDTO } from '@shared/domain/cli/dto/cli-node.dto'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { STATIC_SCOPE } from '@shared/enums'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { SCOPE } from '@shared/types/common'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CliFindNodesFacade {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly userFileRepository: UserFileRepository,
  ) {}

  async findNodes(input: CliNodeSearchDTO): Promise<CliNodeDTO[]> {
    const { folderId = null, spaceId, arg, type } = input

    const scope = spaceId ? EntityScopeUtils.getScopeFromSpaceId(spaceId) : STATIC_SCOPE.PRIVATE

    if (type === 'Folder') {
      const result = await this.findFolders(arg)
      return result.map(CliNodeDTO.fromEntity)
    } else {
      const result = await this.findFiles(folderId, scope, arg)
      return result.map(CliNodeDTO.fromEntity)
    }
  }

  async findFiles(folderId: number, scope: SCOPE, arg: string): Promise<UserFile[]> {
    if (EntityScopeUtils.isSpaceScope(scope)) {
      return await this.userFileRepository.findEditable({
        name: { $like: arg },
        scopedParentFolderId: folderId,
        scope: scope,
      })
    } else {
      return await this.userFileRepository.findEditable({
        name: { $like: arg },
        parentFolderId: folderId,
        scope: scope,
      })
    }
  }

  async findFolders(arg: string): Promise<Folder[]> {
    const result = await this.folderRepository.findEditable({ id: arg as unknown as number })
    for (const folder of result) {
      await folder.children.init()
    }
    return result
  }
}
