import { Cascade, Collection, Entity, OneToMany } from '@mikro-orm/core'
import AnswerRepository from '@shared/domain/answer/answer.repository'
import { AnswerComment } from '../comment/answer-comment.entity'
import { DiscussionReply } from '../discussion-reply/discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from '../discussion-reply/discussion-reply.types'

@Entity({
  repository: () => AnswerRepository,
  discriminatorValue: DISCUSSION_REPLY_TYPE.ANSWER,
})
export class Answer extends DiscussionReply {
  // TODO PFDA-5997 - part 1: replace comments by newComments
  @OneToMany({
    entity: () => AnswerComment,
    mappedBy: (ac) => ac.commentable,
    cascade: [Cascade.REMOVE],
  })
  comments = new Collection<AnswerComment>(this)
}
