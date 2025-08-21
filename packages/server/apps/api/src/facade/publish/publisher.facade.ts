import { Injectable } from '@nestjs/common'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { NotFoundError } from '@shared/errors'

@Injectable()
export class PublisherFacade {
  constructor(
    private readonly publisherService: PublisherService,
    private readonly folderService: FolderService,
  ) {}

  async publishFolder(identifier: string): Promise<number> {
    const [, id] = identifier.split('-')

    const folder = await this.folderService.getFolderEntity(Number(id))
    if (!folder) {
      throw new NotFoundError(`Folder with ID ${id} was not found or is not accessible.`)
    }

    return await this.publisherService.publishNodes([folder])
  }
}
