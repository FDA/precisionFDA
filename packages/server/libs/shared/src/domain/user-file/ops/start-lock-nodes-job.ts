import { createLockNodesJobTask } from '@shared/queue'
import { IdsInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '@shared/utils/base-operation'

// TODO migrate this function into a service. Basically, we don't need Operations for business logic that runs synchronously with a request and just use Operations for code that will be run in our queue.
class RequestNodesLockOperation extends BaseOperation<UserOpsCtx, IdsInput, void> {
  async run(input: IdsInput): Promise<void> {
    await createLockNodesJobTask(input.ids, this.ctx.user)
  }
}

export { RequestNodesLockOperation }
