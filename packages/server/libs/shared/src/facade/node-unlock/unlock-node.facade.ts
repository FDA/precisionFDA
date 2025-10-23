import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Injectable, Logger } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Node } from '@shared/domain/user-file/node.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodeService } from '@shared/domain/user-file/node.service'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { PermissionError } from '@shared/errors'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NodeHelper } from '@shared/domain/user-file/node.helper'

@Injectable()
export class UnlockNodeFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly nodeHelper: NodeHelper,
    private readonly nodeService: NodeService,
    private readonly notificationService: NotificationService,
  ) {}

  async unlockNodes(ids: number[], async?: boolean): Promise<void> {
    this.logger.log(ids, 'Unlocking ids')
    const nodes: Node[] = await this.nodeService.loadNodes(ids, { locked: true })
    const filteredNodes = await this.nodeHelper.filterNodesByUser(nodes)

    let unlockedFilesCount = 0
    if (filteredNodes?.length) {
      try {
        for (const node of filteredNodes) {
          if (node.stiType === FILE_STI_TYPE.ASSET) {
            // TODO What? unlocking asset is not allowed?
            this.logger.error(`Unlocking of asset  ${node.uid} is not allowed`)
            throw new PermissionError(`Unlocking of asset  ${node.uid} is not allowed`)
          }

          await this.nodeService.unlockFile(node.id)
          unlockedFilesCount++
        }
        if (async) {
          await this.notificationService.createNotification({
            message: getSuccessMessage(unlockedFilesCount, 0, 'Successfully unlocked'),
            severity: SEVERITY.INFO,
            action: NOTIFICATION_ACTION.NODES_LOCKED,
            userId: this.userCtx.id,
          })
        }
        this.logger.log({ filesCount: unlockedFilesCount }, 'Unlocked total objects')
      } catch (err) {
        this.logger.error(`Error while unlocking files and folders: ${err}`)
        await this.notificationService.createNotification({
          message: 'Error unlocking files and folders.',
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.NODES_UNLOCKED,
          userId: this.userCtx.id,
        })
        await this.rollbackUnlockingState(nodes)
        throw err
      }
    }
  }

  private async rollbackUnlockingState(nodes: Node[]): Promise<void> {
    this.logger.error(`Rolling back unlocking state for ${nodes.length} nodes`)
    nodes.forEach((node) => {
      node.locked = true
      node.state = FILE_STATE_DX.CLOSED
    })
    await this.em.flush()
  }
}
