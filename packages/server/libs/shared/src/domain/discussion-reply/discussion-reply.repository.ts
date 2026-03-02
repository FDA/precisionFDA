import { FilterQuery, sql } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { DiscussionReply } from './discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from './discussion-reply.types'

export class DiscussionReplyRepository extends AccessControlRepository<DiscussionReply> {
  protected async getAccessibleWhere(): Promise<FilterQuery<DiscussionReply>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map(space => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<DiscussionReply>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    // fetch editable first to prevent only leadable memberships caching
    const editableSpaces = await user.editableSpaces()
    const leadableSpaces = await user.leadableSpaces()
    const leadSpaceScopes = leadableSpaces.map(space => space.scope)
    const editSpaceScopes = editableSpaces.map(space => space.scope)

    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    return {
      note: {
        $or: [
          { user: user.id, scope: STATIC_SCOPE.PRIVATE },
          { user: user.id, scope: STATIC_SCOPE.PUBLIC },
          { user: user.id, scope: { $in: editSpaceScopes } },
          { scope: { $in: leadSpaceScopes } },
        ],
      },
    }
  }

  async getCountByDiscussionIds(
    discussionIds: number[],
    replyType: DISCUSSION_REPLY_TYPE,
  ): Promise<Record<number, number>> {
    const qb = this.createQueryBuilder('dr')
      .select(['dr.discussion_id as discussionId', sql`count(id)`.as('count')])
      .where({ discussion: { id: { $in: discussionIds } }, replyType })
      .groupBy('dr.discussion_id')

    const result = await qb.execute()
    const countMap: Record<number, number> = {}
    result.forEach((row: DiscussionReply & { discussionId: number; count: string }) => {
      countMap[row.discussionId] = parseInt(row.count, 10)
    })
    return countMap
  }
}
