import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NotFoundError } from '@shared/errors'
import { LicenseService } from '@shared/domain/license/license.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

type FileGetPopulateHint = 'user' | 'taggings.tag' | 'properties' | 'parentFolder' | 'scopedParentFolder' | 'resource'

@Injectable()
export class UserFileGetFacade {
  constructor(
    private readonly userFileService: UserFileService,
    private readonly licenseService: LicenseService,
    private readonly acceptedLicenseService: AcceptedLicenseService,
    private readonly spaceService: SpaceService,
    private readonly nodeHelper: NodeHelper,
  ) {}

  async getFile(uid: Uid<'file'>): Promise<FileGetDTO> {
    const file = await this.userFileService.getAccessibleFileByUid<FileGetPopulateHint>(uid, {
      populate: ['user', 'taggings.tag', 'properties', 'parentFolder', 'scopedParentFolder', 'resource'],
    })

    if (!file) {
      throw new NotFoundError(`File ${uid} not found or not accessible`)
    }

    const licenses = await this.licenseService.findLicensesForNodeIds([file.id])
    const license = licenses[0] ?? null
    const licenseAcceptanceStatus = license
      ? await this.acceptedLicenseService.getLicenseAcceptanceStatusForUser(license.id)
      : null

    const folderPath = await this.buildFolderPath(file)

    const { origin, parentType, parentUid } = await this.nodeHelper.resolveOrigin(file)

    let space = null
    if (file.isInSpace()) {
      space = await this.spaceService.getAccessibleById(file.getSpaceId())
    }

    return FileGetDTO.mapToDTO({
      file,
      license,
      licenseAcceptanceStatus,
      folderPath,
      origin,
      originParentType: parentType,
      originParentUid: parentUid,
      space,
    })
  }

  private async buildFolderPath(file: UserFile): Promise<{ id: number; name: string }[]> {
    const parentFolder = this.nodeHelper.getParentFolder(file)
    if (!parentFolder) {
      return []
    }

    return this.nodeHelper.getFolderPathEntries(parentFolder.id)
  }
}
