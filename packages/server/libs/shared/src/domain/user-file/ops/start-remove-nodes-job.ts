import { createRemoveNodesJobTask } from '@shared/queue'
import { FILE_STATE_PFDA } from '../user-file.types'
import { Node } from '../node.entity'
import { IdsInput, UserOpsCtx } from '@shared/types'
import { BaseOperation } from '@shared/utils/base-operation'

class StartRemoveNodesJob extends BaseOperation<UserOpsCtx, IdsInput, void> {
  async run(input: IdsInput): Promise<void> {
    const em = this.ctx.em
    const qb = em.createQueryBuilder(Node)
    qb.where({ id: { $in: input.ids } })
    const nodes = await qb.getResultList()
    nodes.forEach(node => {
      node.state = FILE_STATE_PFDA.REMOVING
    })

    await em.flush()

    await createRemoveNodesJobTask(input.ids, this.ctx.user)
  }
}

export { StartRemoveNodesJob }
