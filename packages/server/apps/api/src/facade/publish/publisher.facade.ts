import { Injectable } from '@nestjs/common'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { NotFoundError } from '@shared/errors'
import { NodeService } from '@shared/domain/user-file/node.service'

@Injectable()
export class PublisherFacade {
  constructor(
    private readonly publisherService: PublisherService,
    private readonly nodeService: NodeService,
  ) {}

  async publishFolder(identifier: string): Promise<number> {
    const [, id] = identifier.split('-')

    const folder = await this.nodeService.getFolderEntity(Number(id))
    if (!folder) {
      throw new NotFoundError(`Folder with ID ${id} was not found or is not accessible.`)
    }

    return await this.publisherService.publishNodes([folder])
  }
}
