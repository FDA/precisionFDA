import { Node } from '../node.entity'
import { queue } from '../../..'
import { IdsInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { FILE_STATE_PFDA } from '../user-file.types'

// TODO migrate this function into a service. Basically, we don't need Operations for business logic that runs synchronously with a request and just use Operations for code that will be run in our queue.
class RequestNodesLockOperation extends BaseOperation<UserOpsCtx, IdsInput, void> {
  async run(input: IdsInput): Promise<void> {
    const { em } = this.ctx
    const qb = em.createQueryBuilder(Node)
    qb.where({ id: { $in: input.ids } })
    const nodes = await qb.getResultList()
    for (const node of nodes) {
      node.state = FILE_STATE_PFDA.LOCKING
    }

    await em.flush()

    await queue.createLockNodesJobTask(input.ids, this.ctx.user)
  }
}

export { RequestNodesLockOperation }
