import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError } from '@shared/errors'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import type { UserOpsCtx } from '@shared/types'
import { BaseOperation } from '@shared/utils/base-operation'
import type { Node } from '../node.entity'
import { filterNodesByUser, getSuccessMessage, loadNodes } from '../user-file.helper'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { FileLockOperation } from './file-lock'

class NodesLockOperation extends BaseOperation<UserOpsCtx, NodesInputDTO, void> {
  private readonly notificationService: NotificationService
  private readonly fileLockOp: FileLockOperation

  constructor(ctx: UserOpsCtx) {
    super(ctx)

    this.notificationService = new NotificationService(ctx.em)
    this.fileLockOp = new FileLockOperation(ctx)
  }

  async run(input: NodesInputDTO): Promise<void> {
    this.ctx.log.log(input.ids, 'NodesLockOperation: Locking ids')
    const em = this.ctx.em
    const nodes: Node[] = await loadNodes(em, input, { locked: false })
    const filteredNodes = await this.filterNodes(nodes)

    if (!filteredNodes?.length) {
      return
    }

    try {
      filteredNodes.forEach(n => this.assertExpectedType(n))
      await this.fileLockOp.execute(filteredNodes.map(n => ({ id: n.id })))

      if (input.async) {
        await this.notifyUserSuccess(filteredNodes.length)
      }

      this.ctx.log.log(
        { filesCount: filteredNodes.length },
        'Locked total objects',
      )
    } catch (err) {
      this.ctx.log.error(`Error while locking files: ${err}`)
      await Promise.all([this.rollbackLockingState(nodes), this.notifyUserError()])

      throw err
    }
  }

  private notifyUserError(): Promise<void> {
    return this.notificationService.createNotification({
      message: 'Error locking files.',
      severity: SEVERITY.ERROR,
      action: NOTIFICATION_ACTION.NODES_LOCKED,
      userId: this.ctx.user.id,
    })
  }

  private notifyUserSuccess(fileCount: number): Promise<void> {
    return this.notificationService.createNotification({
      message: getSuccessMessage(fileCount, 0, 'Successfully locked'),
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.NODES_LOCKED,
      userId: this.ctx.user.id,
    })
  }

  private assertExpectedType(node: Node): void {
    if (node.stiType === FILE_STI_TYPE.USERFILE) {
      return
    }

    const errorMsg = `Unsupported node type "${node.stiType}" of node id: ${node.uid}`

    this.ctx.log.error(`NodesLockOperation: ${errorMsg}`)
    throw new InvalidStateError(errorMsg)
  }

  private async filterNodes(nodes: Node[]): Promise<Node[]> {
    const unlockedNodes = nodes.filter(n => !n.locked)
    const user = await this.ctx.em.findOneOrFail(User, { id: this.ctx.user.id })
    const nodesByUser = await filterNodesByUser(this.ctx.em, unlockedNodes, user)

    return this.filterNodesByType(nodesByUser)
  }

  private filterNodesByType(nodes: Node[]) {
    return nodes.filter(n => n.stiType !== 'Folder')
  }

  private rollbackLockingState(nodes: Node[]): Promise<void> {
    nodes.forEach(node => {
      this.ctx.log.error(`Rolling back locking state for node id: ${node.id}`)

      node.locked = false
      node.state = FILE_STATE_DX.CLOSED
    })

    return this.ctx.em.flush()
  }
}

export { NodesLockOperation }
