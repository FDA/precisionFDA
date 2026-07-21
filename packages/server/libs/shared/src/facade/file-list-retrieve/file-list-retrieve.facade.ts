import { Injectable } from '@nestjs/common'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { LicenseService } from '@shared/domain/license/license.service'
import { LicenseMap } from '@shared/domain/license/license.types'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { FolderDTO } from '@shared/domain/user-file/dto/folder.dto'
import { UserFilePaginationDTO } from '@shared/domain/user-file/dto/user-file-pagination.dto'
import { FolderPathEntry, NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class FileListRetrieveFacade {
  constructor(
    private readonly userContext: UserContext,
    private readonly nodeService: NodeService,
    private readonly nodeHelper: NodeHelper,
    private readonly spaceService: SpaceService,
    private readonly licenseService: LicenseService,
  ) {}

  async retrieveAccessibleFiles(query: UserFilePaginationDTO): Promise<PaginatedResult<FileGetDTO | FolderDTO>> {
    const result = await this.nodeService.paginate(query)
    const spaceMap = new Map<string, Space>()
    if (EntityScopeUtils.isSpaceScope(query.scope)) {
      const space = await this.spaceService.getAccessibleById(getIdFromScopeName(query.scope))
      spaceMap.set(query.scope, space)
    } else if (query.scope === 'spaces') {
      const spaceIds = [...new Set(result.data.map(node => getIdFromScopeName(node.scope)))]
      const spaces = await this.spaceService.findByIds(spaceIds)
      spaces.forEach(s => spaceMap.set(`space-${s.id}`, s))
    }

    const nodeIds = result.data.map(node => node.id)
    const licenseMap = await this.loadLicensesForNodes(nodeIds)

    let folderPath: FolderPathEntry[] | null = null
    if (query?.fields?.path && query.folderId) {
      folderPath = await this.nodeHelper.getFolderPathEntries(query.folderId)
    }

    const mappedData = await Promise.all(
      result.data.map(node => {
        return node instanceof UserFile
          ? this.mapFileToFileDTO(node, spaceMap.get(node.scope), licenseMap, query, folderPath)
          : Promise.resolve(FolderDTO.fromEntity(node, spaceMap.get(node.scope)))
      }),
    )

    return {
      data: mappedData,
      meta: {
        path: folderPath,
        ...result.meta,
      },
    }
  }

  private async mapFileToFileDTO(
    file: UserFile,
    space: Space | null,
    licenseMap: LicenseMap,
    query: UserFilePaginationDTO,
    folderPath: FolderPathEntry[],
  ): Promise<FileGetDTO> {
    const licenseInfo = licenseMap.get(file.id)
    const license = licenseInfo ? licenseInfo.license : null
    const licenseAcceptanceStatus =
      license?.acceptedLicenses.getItems().find(al => al.user.getEntity().id === this.userContext.id)?.state ?? null

    let origin = null,
      parentType = null,
      parentUid = null
    if (query?.fields?.origin) {
      const originData = await this.nodeHelper.resolveOrigin(file)
      origin = originData.origin
      parentType = originData.parentType
      parentUid = originData.parentUid
    }

    if (query?.fields?.path && !folderPath) {
      folderPath = []
      const parentFolder = this.nodeHelper.getParentFolder(file)
      if (parentFolder) {
        folderPath = await this.nodeHelper.getFolderPathEntries(parentFolder.id)
      }
    }

    return FileGetDTO.mapToDTO({
      file,
      license,
      licenseAcceptanceStatus,
      folderPath,
      origin,
      originParentType: parentType,
      originParentUid: parentUid,
      space: space,
    })
  }

  private async loadLicensesForNodes(nodeIds: number[]): Promise<LicenseMap> {
    return await this.licenseService.findLicensesAndAcceptedLicensesByItemIds('Node', nodeIds)
  }
}
