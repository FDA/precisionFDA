import { DiscussionReply } from '@shared/domain/discussion-reply/discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { EntityScope } from '@shared/types/common'
import { DiscussionReplyDTO } from './discussion-reply.dto'

export class DiscussionDTO {
  id: number
  title: string
  content: string
  scope: EntityScope
  noteId: number
  user: SimpleUserDTO
  answers: DiscussionReplyDTO[]
  answersCount: number
  comments: DiscussionReplyDTO[]
  commentsCount: number
  createdAt: Date
  updatedAt: Date
  following: boolean

  static fromEntity(discussion: Discussion, following: boolean = false): DiscussionDTO {
    if (!discussion.note.isInitialized()) {
      throw new Error('Note must be initialized')
    }
    if (!discussion.user.isInitialized()) {
      throw new Error('User must be initialized')
    }

    const dto = new DiscussionDTO()
    dto.id = discussion.id

    const note = discussion.note.getEntity()
    // take timestamps from note, because discussion can be updated only by updating note
    dto.createdAt = note.createdAt
    dto.updatedAt = note.updatedAt
    dto.noteId = note.id
    dto.title = note.title
    dto.content = note.content
    dto.scope = note.scope
    dto.following = following
    dto.user = SimpleUserDTO.fromEntity(discussion.user.getEntity())

    if (discussion.replies.isInitialized()) {
      const filteredResult = this.filterRepliesByType(discussion.replies.getItems())
      dto.answers = filteredResult.answers
      dto.comments = filteredResult.comments
      dto.answersCount = filteredResult.answersCount
      dto.commentsCount = filteredResult.commentsCount
    }

    return dto
  }

  private static filterRepliesByType(replies: DiscussionReply[]): {
    answers: DiscussionReplyDTO[]
    comments: DiscussionReplyDTO[]
    answersCount: number
    commentsCount: number
  } {
    let answersCount = 0,
      commentsCount = 0
    const repliesDict = {
      answers: {},
      comments: [],
    } as {
      answers: Record<number, DiscussionReplyDTO>
      comments: DiscussionReplyDTO[]
    }
    for (const reply of replies) {
      if (reply.replyType === DISCUSSION_REPLY_TYPE.ANSWER) {
        answersCount++
        repliesDict.answers[reply.id] = DiscussionReplyDTO.fromEntity(reply)
      } else {
        commentsCount++
        const comment = DiscussionReplyDTO.fromEntity(reply)
        if (reply.parent) {
          repliesDict.answers[reply.parent.id].comments.push(comment)
        } else {
          repliesDict.comments.push(comment)
        }
      }
    }
    return {
      answers: Object.values(repliesDict.answers),
      comments: repliesDict.comments,
      answersCount,
      commentsCount,
    }
  }
}
