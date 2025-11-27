import { Entity } from '@mikro-orm/core'
import { DISCUSSION_REPLY_TYPE } from '../discussion-reply/discussion-reply.types'
import { DiscussionReply } from './discussion-reply.entity'

/**
 * Represents a comment in a discussion thread, which includes replies to answers or other comments.
 */
@Entity({
  discriminatorValue: DISCUSSION_REPLY_TYPE.COMMENT,
})
export class DiscussionReplyComment extends DiscussionReply {}
