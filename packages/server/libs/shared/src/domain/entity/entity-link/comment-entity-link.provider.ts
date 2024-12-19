import { Injectable } from '@nestjs/common'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { Comment } from '@shared/domain/comment/comment.entity'

@Injectable()
export class CommentEntityLinkProvider extends EntityLinkProvider<'comment'> {
  protected async getRelativeLink(comment: Comment) {
    if (comment instanceof AnswerComment) {
      return this.getAnswerCommentLink(comment)
    } else if (comment instanceof DiscussionComment) {
      return this.getDiscussionCommentLink(comment)
    }
  }

  private async getAnswerCommentLink(comment: AnswerComment) {
    const answer = await comment.commentableId.load()
    const note = await answer.note.load()
    const scope = note.scope

    const answerID = comment.commentableId.id
    const discussionID = answer.discussion.id
    const commentSegment = this.getUrlSegment(comment)

    if (this.MY_HOME_SCOPES.includes(scope)) {
      const url = this.getUrl(discussionID, undefined, answerID)
      // currently not used and not working properly (page still in ruby)
      return `/${url}/${commentSegment}` as const
    } else {
      const spaceID = note.getSpaceId()
      const url = this.getUrl(discussionID, spaceID, answerID)
      return `/${url}/${commentSegment}` as const
    }
  }

  private async getDiscussionCommentLink(comment: DiscussionComment) {
    const discussion = await comment.commentableId.load()
    const note = await discussion.note.load()
    const scope = note.scope
    const discussionID = discussion.id
    const commentSegment = this.getUrlSegment(comment)

    if (this.MY_HOME_SCOPES.includes(scope)) {
      // currently not used and not working properly (page still in ruby)
      const url = this.getUrl(discussionID, undefined, undefined)
      return `/${url}/${commentSegment}` as const
    } else {
      const note = comment.commentableId.getProperty('note').getEntity()
      const spaceID = note.getSpaceId()
      const url = this.getUrl(discussionID, spaceID, undefined)
      return `/${url}/${commentSegment}` as const
    }
  }

  private getUrl(discussionID: number, spaceID?: number, answerID?: number): string {
    const spaceSegment = spaceID ? `spaces/${spaceID}` : ''
    const answerSegment = answerID ? `/answers/${answerID}` : ''
    return `${spaceSegment}/discussions/${discussionID}${answerSegment}`
  }

  private getUrlSegment(comment: Comment): string {
    return 'comments/' + comment.id
  }
}
