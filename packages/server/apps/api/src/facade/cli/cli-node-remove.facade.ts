import { Injectable, Logger } from '@nestjs/common'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { CliNodeRemoveDTO } from '@shared/domain/cli/dto/cli-node-remove.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class CliNodeRemoveFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly removeNodeFacade: RemoveNodesFacade,
  ) {}

  /**
   * Removes nodes by their UIDs (files,assets) or IDs (folders).
   * @param body
   */
  async removeNodes(body: CliNodeRemoveDTO): Promise<number> {
    let ids: number[]
    if (body.uids) {
      this.logger.log(`Removing nodes with UIDs: ${body.uids.join(', ')}`)
      const nodes = await this.nodeRepository.find({ uid: body.uids })
      ids = nodes.map((node) => node.id)
    } else {
      this.logger.log(`Removing nodes with IDs: ${body.ids.join(', ')}`)
      ids = body.ids
    }

    const result = await this.removeNodeFacade.removeNodes(ids)
    return result.removedFilesCount + result.removedFoldersCount
  }
}
