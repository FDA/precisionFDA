import { BaseOperation } from '@shared/utils/base-operation'
import { UserOpsCtx } from '@shared/types'
import { Tagging } from '../tagging.entity'

/**
 * Operation removes tags corresponding to entity represented by id.
 * If the tag is used by some other entity as well (taggingCount > 1) it only
 * decreases the count and removes Tagging. If taggingCount is 1 it removes
 * Tag as well.
 */
class RemoveTaggingsOperation extends BaseOperation<UserOpsCtx, number, void> {
  async run(id: number): Promise<void> {
    return this.ctx.em.transactional(async (tem) => {
      const taggingRepo = tem.getRepository(Tagging)

      const taggings = await taggingRepo.findForTaggableId(id)
      taggings.forEach((tagging) => {
        if (tagging.tag.taggingCount > 1) {
          tagging.tag.taggingCount -= 1
        } else {
          tem.remove(tagging.tag)
        }
        tem.remove(tagging)
      })
    })
  }
}

export { RemoveTaggingsOperation }
