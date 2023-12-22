import { EntityManager } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserFile } from '../user-file.entity'
import { User } from '../../user'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { ComparisonInput, spaceEvent, SpaceReport, tagging } from '../..'
import { errors } from '../../..'
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

const validateSpaceReports = async (em: EntityManager, fileToRemove: UserFile) => {
  const count = await em.count(SpaceReport, { resultFile: fileToRemove })

  if (count > 0) {
    throw new errors.DeleteRelationError('file', 'space report')
  }
}

class FileRemoveOperation extends BaseOperation<
UserOpsCtx,
IdInput,
number
> {
  protected client: PlatformClient

  async run(input: IdInput): Promise<number> {
    this.ctx.log.log(input, 'FileRemoveOperation: Removing file')

    const em = this.ctx.em
    const userFileRepo = em.getRepository(UserFile)
    const userRepo = em.getRepository(User)
    const user = await userRepo.findOneOrFail(this.ctx.user.id)
    this.client = new PlatformClient(this.ctx.user.accessToken, this.ctx.log)
    const fileToRemove = await userFileRepo.findOneOrFail(input.id)

    return await em.transactional(async tm => {
      await validateComparisons(tm, fileToRemove)
      await validateEditableBy(tm, fileToRemove, user)
      await validateVerificationSpace(tm, fileToRemove)
      await validateProtectedSpaces(tm, 'remove', this.ctx.user.id, fileToRemove)
      await validateSpaceReports(tm, fileToRemove)

      const lastNode = await isLastNode(tm, fileToRemove.dxid)
      const filePath = await getNodePath(tm, fileToRemove)

      const op = new tagging.RemoveTaggingsOperation({ em: tm, log: this.ctx.log, user: this.ctx.user })
      await op.execute(fileToRemove.id)

      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        fileToRemove,
        filePath,
        user,
      )
      tm.persist(fileEvent)

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
          entity: { type: 'userFile', value: fileToRemove },
          spaceId,
          userId: this.ctx.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.file_deleted,
        })
      }

      tm.remove(fileToRemove)
      this.ctx.log.log({ fileName: fileToRemove.name }, 'FileRemoveOperation: Removed file')
      return 1
    })
  }
}

export { FileRemoveOperation }
