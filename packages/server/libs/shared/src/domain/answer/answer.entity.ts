import { Entity } from '@mikro-orm/core'
import { DiscussionReply } from '../discussion-reply/discussion-reply.entity'
import { DISCUSSION_REPLY_TYPE } from '../discussion-reply/discussion-reply.types'

@Entity({
  discriminatorValue: DISCUSSION_REPLY_TYPE.ANSWER,
})
export class Answer extends DiscussionReply {}
