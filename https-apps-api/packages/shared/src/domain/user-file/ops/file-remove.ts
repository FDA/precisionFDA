import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserFile } from '../user-file.entity'
import { User } from '../../user/user.entity'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { ComparisonInput, spaceEvent, tagging } from '../..'
import { getIdFromScopeName } from '../../space/space.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../../space-event/space-event.enum'
import {
  getNodePath,
  validateEditableBy,
  validateProtectedSpaces,
  validateVerificationSpace
} from '../user-file.helper'
import { IdInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { PlatformClient } from '../../../platform-client'

const isLastNode = async (em: SqlEntityManager, fileDxid: string): Promise<Boolean> => {
  const qb = em.createQueryBuilder(UserFile)
  qb.where({ dxid: fileDxid })
  const result = await qb.count().execute()
  const count: number = result[0].count
  return count === 1
}

const validateComparisons = async (em: SqlEntityManager, fileToRemove: UserFile): Promise<void> => {
  const result = await em.find(ComparisonInput, { userFile: fileToRemove })
  if (result && result.length > 0) {
    throw new Error(`File ${fileToRemove.name} cannot be deleted because it participates`
    + ' in one or more comparisons. Please delete all the comparisons first.')
  }
}

class FileRemoveOperation extends BaseOperation<
UserOpsCtx,
IdInput,
number
> {
  protected client: PlatformClient

  async run(input: IdInput): Promise<number> {
    this.ctx.log.info(input, 'FileRemoveOperation: Removing file')

    const em = this.ctx.em.fork()
    const userFileRepo = em.getRepository(UserFile)
    const userRepo = em.getRepository(User)
    const user = await userRepo.findOneOrFail(this.ctx.user.id)
    this.client = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    const fileToRemove = await userFileRepo.findOneOrFail(input.id)

    await em.begin()
    try {
      await validateComparisons(em, fileToRemove)
      await validateEditableBy(em, fileToRemove, user)
      await validateVerificationSpace(em, fileToRemove)
      await validateProtectedSpaces(em, 'remove', this.ctx.user.id, fileToRemove)

      const lastNode = await isLastNode(em, fileToRemove.dxid)
      const filePath = await getNodePath(em, fileToRemove)

      const op = new tagging.RemoveTaggingsOperation({ em, log: this.ctx.log, user: this.ctx.user })
      await op.execute(fileToRemove.id)

      em.remove(fileToRemove)

      const currentUser: User = await em.findOneOrFail(User, { id: this.ctx.user.id })
      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        fileToRemove,
        filePath,
        currentUser,
      )
      em.persist(fileEvent)

      if (lastNode) {
        // we're deleting from platform only if it's the last with given dxid
        await this.client.fileRemove({
          projectId: fileToRemove.project,
          ids: [fileToRemove.dxid],
        })
      }

      if (fileToRemove.scope && fileToRemove.scope.startsWith('space')) {
        const spaceId = getIdFromScopeName(fileToRemove.scope)
        const eventOp = new spaceEvent.CreateSpaceEventOperation(this.ctx)
        await eventOp.execute({
          entity: fileToRemove,
          spaceId,
          userId: this.ctx.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        })
      }

      em.remove(fileToRemove)
      await em.commit()
      this.ctx.log.info({ fileName: fileToRemove.name }, 'FileRemoveOperation: Removed file')
      return 1
    } catch (err) {
      await em.rollback()
      throw err
    }
  }
}

export { FileRemoveOperation }
