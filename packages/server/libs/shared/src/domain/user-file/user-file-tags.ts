import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { getStiEnumTypeFromInstance } from '@shared/domain/user-file/user-file.helper'
import { isNil } from 'ramda'
import { UserOpsCtx } from '../../types'
import { Tag } from '../tag/tag.entity'
import { Tagging } from '../tagging/tagging.entity'

export const assignTags = async (
  ctx: UserOpsCtx,
  nodes: Array<UserFile | Folder>,
  tag: Tag,
): Promise<number> => {
  const em = ctx.em.fork()
  const taggingRepo = em.getRepository(Tagging)
  const existingRefs = await taggingRepo.findForFiles({
    fileIds: nodes.map((f) => f.id),
    tagId: tag.id,
    userId: ctx.user.id,
  })
  let createdTags = 0
  nodes.forEach((node) => {
    const existing = existingRefs.find((tagging) => tagging.taggableId === node.id)
    if (!isNil(existing)) {
      return
    }
    const tagging = taggingRepo.upsertForFile({
      tagId: tag.id,
      fileId: node.id,
      userId: ctx.user.id,
      nodeType: getStiEnumTypeFromInstance(node),
    })
    // tagging.tag.taggingCount++
    node.taggings.add(tagging)
    em.persist(tagging)
    createdTags++
  })
  await em.flush()
  return createdTags
}
