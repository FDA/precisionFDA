import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NodesInputDTO } from '@shared/domain/user-file/dto/nodes-input.dto'
import { User } from '@shared/domain/user/user.entity'
import { InvalidStateError } from '@shared/errors'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import type { UserOpsCtx } from '@shared/types'
import { BaseOperation } from '@shared/utils/base-operation'
import { filterNodesByUser, getSuccessMessage } from '../user-file.helper'
import { FILE_STATE_DX, FILE_STI_TYPE } from '../user-file.types'
import { FileLockOperation } from './file-lock'
import { NodeService } from '@shared/domain/user-file/node.service'
import { Space } from '@shared/domain/space/space.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { FolderRepository } from '@shared/domain/user-file/folder.repository'
import { UserRepository } from '@shared/domain/user/user.repository'

class NodesLockOperation extends BaseOperation<UserOpsCtx, NodesInputDTO, void> {
  private readonly notificationService: NotificationService
  private readonly fileLockOp: FileLockOperation
  private readonly nodeService: NodeService

  constructor(ctx: UserOpsCtx) {
    super(ctx)

    this.notificationService = new NotificationService(ctx.em)
    this.fileLockOp = new FileLockOperation(ctx)
    const spaceRepository = ctx.em.getRepository(Space) as SpaceRepository
    const nodeRepository = ctx.em.getRepository(Node) as NodeRepository
    const userRepository = ctx.em.getRepository(User) as UserRepository
    const folderRepository = ctx.em.getRepository(Folder) as FolderRepository
    this.nodeService = new NodeService(
      ctx.em,
      new UserContext(
        this.ctx.user.id,
        this.ctx.user.accessToken,
        this.ctx.user.dxuser,
        this.ctx.user.sessionId,
      ),
      spaceRepository,
      nodeRepository,
      userRepository,
      folderRepository,
    )
  }

  async run(input: NodesInputDTO): Promise<void> {
    this.ctx.log.log(input.ids, 'NodesLockOperation: Locking ids')
    const nodes: Node[] = await this.nodeService.loadNodes(input.ids, { locked: false })
    const filteredNodes = await this.filterNodes(nodes)

    if (!filteredNodes?.length) {
      return
    }

    try {
      filteredNodes.forEach((n) => this.assertExpectedType(n))
      await this.fileLockOp.execute(filteredNodes.map((n) => ({ id: n.id })))

      if (input.async) {
        await this.notifyUserSuccess(filteredNodes.length)
      }

      this.ctx.log.log({ filesCount: filteredNodes.length }, 'Locked total objects')
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
    const unlockedNodes = nodes.filter((n) => !n.locked)
    const user = await this.ctx.em.findOneOrFail(User, { id: this.ctx.user.id })
    const nodesByUser = await filterNodesByUser(this.ctx.em, unlockedNodes, user)

    return this.filterNodesByType(nodesByUser)
  }

  private filterNodesByType(nodes: Node[]): Node[] {
    return nodes.filter((n) => n.stiType !== 'Folder')
  }

  private rollbackLockingState(nodes: Node[]): Promise<void> {
    nodes.forEach((node) => {
      this.ctx.log.error(`Rolling back locking state for node id: ${node.id}`)

      node.locked = false
      node.state = FILE_STATE_DX.CLOSED
    })

    return this.ctx.em.flush()
  }
}

export { NodesLockOperation }
