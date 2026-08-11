import { Body, Controller, Delete, HttpCode, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeCopyResultDTO } from '@shared/domain/user-file/dto/node-copy-result.dto'
import { NodesCopyDTO } from '@shared/domain/user-file/dto/nodes-copy.dto'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly lockNodeFacade: LockNodeFacade,
    private readonly unlockNodeFacade: UnlockNodeFacade,
    private readonly copyNodesFacade: CopyNodesFacade,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
  ) {}

  @Post('/copy')
  async copyNodes(@Body() input: NodesCopyDTO, @Res({ passthrough: true }) res: Response): Promise<NodeCopyResultDTO[]> {
    const runAsync = input.async !== false

    if (runAsync) {
      res.status(204)
      await this.fileSyncQueueJobProducer.createCopyNodesTask(input, this.user)
      return []
    }

    res.status(200)
    return await this.copyNodesFacade.copyNodes(input.ids, input.scope, input.folderId)
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
