import { Injectable, Logger } from '@nestjs/common'
import { DownloadLinkOptionsDto } from '@shared/domain/entity/domain/download-link-options.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityService } from '@shared/domain/entity/entity.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'
import { NotFoundError, PermissionError, ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class UserFileDownloadFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly nodeService: NodeService,
    private readonly spaceService: SpaceService,
    private readonly entityService: EntityService,
  ) {}

  /**
   * Generates a download link for a user file with optional preauthentication.
   *
   * This method retrieves a user file by its UID and generates a secure download link.
   * The file must be in a 'closed' state to be downloadable. If the file is located
   * within a protected space and preauthentication is enabled, additional space-level
   * validation is performed to ensure the user has proper access permissions.
   *
   * @param uid - The unique identifier of the file to generate a download link for
   * @param options - Download link configuration options
   * @returns A promise that resolves to a download URL string
   *
   * @throws {NotFoundError} When the file with the specified UID does not exist
   * @throws {ValidationError} When the file is not in a 'closed' state and cannot be downloaded
   * @throws {ValidationError} When space-level validation fails for protected files
   *
   */
  async getDownloadLink(uid: Uid<'file'>, options: DownloadLinkOptionsDto): Promise<string> {
    this.logger.debug('Attempting to generate download link', { fileUid: uid, options })

    const file = await this.nodeService.getUserFileOrAsset(uid)

    if (!file) {
      throw new NotFoundError(`File with UID ${uid} not found`)
    }

    if (file.state !== FILE_STATE_DX.CLOSED) {
      throw new ValidationError("Files can only be downloaded if they are in the 'closed' state")
    }

    // only check if the file is in the protected space
    if (options.preauthenticated && file.isInSpace()) {
      this.logger.debug('Validating space access for preauthenticated download', {
        fileUid: uid,
        spaceId: file.getSpaceId(),
      })
      const downloadAllowed = await this.spaceService.canUserDownloadFrom(file.getSpaceId())
      if (!downloadAllowed) {
        throw new PermissionError('You have no permissions to download this file as it is part of a protected space.')
      }
    }

    const downloadLink = await this.entityService.getEntityDownloadLink(file, file.name, options)
    this.logger.log(`Download link for ${file.uid} generated successfully`)

    return downloadLink
  }
}
