import { Injectable } from '@nestjs/common'
import { DiscussionReplyComment } from '@shared/domain/discussion-reply/discussion-reply-comment.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class CommentEntityLinkProvider extends EntityLinkProvider<'comment'> {
  protected async getRelativeLink(comment: DiscussionReplyComment): Promise<`/${string}`> {
    if (comment.parent) {
      return this.getAnswerCommentLink(comment)
    } else {
      return this.getDiscussionCommentLink(comment)
    }
  }

  private async getAnswerCommentLink(comment: DiscussionReplyComment): Promise<`/${string}`> {
    const note = await comment.note.load()
    const scope = note.scope

    const answerID = comment.parent.id
    const discussionID = comment.discussion.id
    const commentSegment = this.getCommentUrlSegment(comment)

    if (this.MY_HOME_SCOPES.includes(scope)) {
      const url = this.getDiscussionUrlSegment(discussionID, undefined, answerID)
      // currently not used and not working properly (page still in ruby)
      return `/${url}/${commentSegment}` as const
    } else {
      const spaceID = note.getSpaceId()
      const url = this.getDiscussionUrlSegment(discussionID, spaceID, answerID)
      return `/${url}/${commentSegment}` as const
    }
  }

  private async getDiscussionCommentLink(comment: DiscussionReplyComment): Promise<`/${string}`> {
    const note = await comment.note.load()
    const scope = note.scope
    const discussionID = comment.discussion.id
    const commentSegment = this.getCommentUrlSegment(comment)

    if (this.MY_HOME_SCOPES.includes(scope)) {
      // currently not used and not working properly (page still in ruby)
      const url = this.getDiscussionUrlSegment(discussionID, undefined, undefined)
      return `/${url}/${commentSegment}` as const
    } else {
      const note = comment.note.getEntity()
      const spaceID = note.getSpaceId()
      const url = this.getDiscussionUrlSegment(discussionID, spaceID, undefined)
      return `/${url}/${commentSegment}` as const
    }
  }

  private getDiscussionUrlSegment(
    discussionID: number,
    spaceID?: number,
    answerID?: number,
  ): string {
    const spaceSegment = spaceID ? `spaces/${spaceID}/` : 'home/'
    const answerSegment = answerID ? `/answers/${answerID}` : ''
    return `${spaceSegment}discussions/${discussionID}${answerSegment}`
  }

  private getCommentUrlSegment(comment: DiscussionReplyComment): string {
    return 'comments/' + comment.id
  }
}
