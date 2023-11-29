import { Tagging } from '../tagging.entity'
import { UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'

/**
 * Operation removes tags corresponding to entity represented by id.
 * If the tag is used by some other entity as well (taggingCount > 1) it only
 * decreases the count and removes Tagging. If taggingCount is 1 it removes
 * Tag as well.
 */
class RemoveTaggingsOperation extends BaseOperation<UserOpsCtx, number, void> {
  async run(id: number): Promise<void> {
    const em = this.ctx.em
    const taggingRepo = em.getRepository(Tagging)

    const taggings = await taggingRepo.findForTaggableId(id)
    taggings.forEach(tagging => {
      if (tagging.tag.taggingCount > 1) {
        tagging.tag.taggingCount -= 1
      } else {
        em.remove(tagging.tag)
      }
      em.remove(tagging)
    })
    await em.flush()
  }
}

export { RemoveTaggingsOperation }
