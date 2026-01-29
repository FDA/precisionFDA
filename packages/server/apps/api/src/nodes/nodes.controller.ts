import { Body, Controller, Delete, HttpCode, Post, UseGuards } from '@nestjs/common'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { NodesCopyDTO } from '@shared/domain/user-file/dto/nodes-copy.dto'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly lockNodeFacade: LockNodeFacade,
    private readonly unlockNodeFacade: UnlockNodeFacade,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
  ) {}

  @HttpCode(204)
  @Post('/copy')
  async copyNodes(@Body() input: NodesCopyDTO): Promise<void> {
    await this.fileSyncQueueJobProducer.createCopyNodesTask(input, this.user)
  }

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body() input: NodesInputDTO): Promise<void> {
    const { ids, async } = input

    if (async) {
      await this.lockNodeFacade.lockNodesAsync(ids)
    } else {
      await this.lockNodeFacade.lockNodes(ids, async)
    }
  }

  @HttpCode(204)
  @Post('/unlock')
  async unlockNodes(@Body() input: NodesInputDTO): Promise<void> {
    const { ids, async } = input

    if (async) {
      await this.unlockNodeFacade.unlockNodesAsync(ids)
    } else {
      await this.unlockNodeFacade.unlockNodes(ids, async)
    }
  }

  @Delete('/remove')
  async removeNodes(@Body() input: NodesInputDTO): Promise<number> {
    const { ids, async } = input

    if (async) {
      await this.removeNodesFacade.removeNodesAsync(ids)
    } else {
      const res = await this.removeNodesFacade.removeNodes(ids)
      return res.removedFoldersCount + res.removedFilesCount
    }
  }
}
