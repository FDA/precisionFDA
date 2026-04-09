import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class LockNodeFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly nodeHelper: NodeHelper,
    private readonly nodeService: NodeService,
    private readonly notificationService: NotificationService,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
  ) {}

  async lockNodes(ids: number[], async?: boolean): Promise<void> {
    this.logger.log(`Locking ids: ${ids}, async?: ${async}`)
    const nodes: Node[] = await this.nodeService.loadNodes(ids, { locked: false })
    const filteredNodes = await this.filterNodes(nodes)

    if (!filteredNodes?.length) {
      return
    }

    try {
      filteredNodes.forEach(n => this.assertExpectedType(n))

      await Promise.all(filteredNodes.map(node => this.nodeService.lockFile(node.id)))

      if (async) {
        await this.notifyUserSuccess(filteredNodes.length)
      }

      this.logger.log({ filesCount: filteredNodes.length }, 'Locked total objects')
    } catch (err) {
      this.logger.error(`Error while locking files: ${err}`)
      await Promise.all([this.rollbackLockingState(nodes), this.notifyUserError()])

      throw err
    }
  }

  async lockNodesAsync(ids: number[]): Promise<void> {
    this.logger.log(`Asynchronously locking nodes ${ids}`)
    await this.fileSyncQueueJobProducer.createLockNodesJobTask(ids, this.userCtx)
  }

  private notifyUserError(): Promise<void> {
    return this.notificationService.createNotification({
      message: 'Error locking files.',
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.NODES_LOCKED,
      userId: this.userCtx.id,
    })
  }

  private notifyUserSuccess(fileCount: number): Promise<void> {
    return this.notificationService.createNotification({
      message: getSuccessMessage(fileCount, 0, 'Successfully locked'),
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.NODES_LOCKED,
      userId: this.userCtx.id,
    })
  }

  private assertExpectedType(node: Node): void {
    if (node.stiType === FILE_STI_TYPE.USERFILE) {
      return
    }

    const errorMsg = `Unsupported node type "${node.stiType}" of node uid: ${node.uid}`

    this.logger.error(`NodesLockOperation: ${errorMsg}`)
    throw new InvalidStateError(errorMsg)
  }

  private async filterNodes(nodes: Node[]): Promise<Node[]> {
    const unlockedNodes = nodes.filter(n => !n.locked)
    const nodesByUser = await this.nodeHelper.filterNodesByUser(unlockedNodes)

    return this.filterNodesByType(nodesByUser)
  }

  private filterNodesByType(nodes: Node[]): Node[] {
    return nodes.filter(n => n.stiType !== 'Folder')
  }

  private rollbackLockingState(nodes: Node[]): Promise<void> {
    nodes.forEach(node => {
      this.logger.error(`Rolling back locking state for node id: ${node.id}`)

      node.locked = false
      node.state = FILE_STATE_DX.CLOSED
    })

    return this.em.flush()
  }
}
