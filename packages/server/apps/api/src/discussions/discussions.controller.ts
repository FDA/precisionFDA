import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommentableType } from '@shared/domain/comment/comment.entity'
import { CreateCommentInput, EditCommentInput } from '@shared/domain/discussion/discussion.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import type {
  AnswerPostReqBody,
  AnswerPutReqBody,
  CommentReqBody,
  DiscussionsPostReqBody,
  DiscussionsPublishReqBody,
  DiscussionsPutReqBody,
} from './discussions.schemas'
import {
  answerPostRequestSchema,
  answerPutRequestSchema,
  commentsPostRequestSchema,
  discussionsPostRequestSchema,
  discussionsPublishRequestSchema,
  discussionsPutRequestSchema,
} from './discussions.schemas'

@UseGuards(UserContextGuard)
@Controller('/discussions')
export class DiscussionsController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Get()
  async getDiscussions(@Query('scope') scope: string) {
    return await this.discussionService.getDiscussions(scope)
  }

  @Get('/:id')
  async getDiscussion(@Param('id', ParseIntPipe) id: number) {
    return await this.discussionService.getDiscussion(id)
  }

  // TODO Jiri: refactor - we are using noteId where API standard expects discussionId.
  //  This is because we use this for both discussions and answers attachments fetch via noteId.
  @Get('/:noteId/attachments')
  async getNoteAttachments(@Param('noteId', ParseIntPipe) noteId: number) {
    return await this.discussionService.getAttachments(noteId)
  }

  @Get('/:id/answers/:answerId')
  async getAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return await this.discussionService.getAnswer(answerId)
  }

  @HttpCode(201)
  @Post()
  async createDiscussion(
    @Body(new ZodPipe(discussionsPostRequestSchema)) body: DiscussionsPostReqBody,
  ) {
    const result = await this.discussionService.createDiscussion(body)

    return { id: result.id }
  }

  @HttpCode(201)
  @Post('/:discussionId/answers')
  async createAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body(new ZodPipe(answerPostRequestSchema)) body: AnswerPostReqBody,
  ) {
    const result = await this.discussionService.createAnswer({ discussionId, ...body })

    return { id: result.id }
  }

  @HttpCode(204)
  @Put('/:id')
  async updateDiscussion(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(discussionsPutRequestSchema)) body: DiscussionsPutReqBody,
  ) {
    await this.discussionService.updateDiscussion(body)
  }

  @HttpCode(204)
  @Put('/:discussionId/comments/:commentId')
  async editDiscussionComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body(new ZodPipe(commentsPostRequestSchema)) body: CommentReqBody,
  ) {
    const { id } = await this.handleCommentEdit(body, commentId, 'Discussion')

    return { id }
  }

  @HttpCode(204)
  @Put('/:discussionId/answers/:answerId')
  async updateAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body(new ZodPipe(answerPutRequestSchema)) body: AnswerPutReqBody,
  ) {
    await this.discussionService.updateAnswer({ discussionId, answerId, ...body })
  }

  @HttpCode(200)
  @Post('/:id/publish')
  async publishDiscussion(
    @Param('id', ParseIntPipe) discussionId: number,
    @Body(new ZodPipe(discussionsPublishRequestSchema)) body: DiscussionsPublishReqBody,
  ) {
    const result = await this.discussionService.publishDiscussion({
      id: discussionId,
      toPublish: body.toPublish,
      notifyAll: body.notifyAll,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })

    return { id: discussionId, count: result }
  }

  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteDiscussion(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteAnswer(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/comments/:id')
  async deleteDiscussionComment(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteComment(id, 'Discussion')
  }

  @HttpCode(200)
  @Post('/:discussionId/answers/:id/publish')
  async publishAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DiscussionsPublishReqBody,
  ) {
    const result = await this.discussionService.publishAnswer({
      discussionId,
      id,
      toPublish: body.toPublish,
      notifyAll: body.notifyAll,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })

    return { id, count: result }
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:answerId/comments/:id')
  async deleteAnswerComment(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteComment(id, 'Answer')
  }

  @Post('/:discussionId/comments')
  async createDiscussionComment(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body(new ZodPipe(commentsPostRequestSchema)) body: CommentReqBody,
  ) {
    const input: CreateCommentInput = {
      targetId: discussionId,
      targetType: 'Discussion',
      comment: body.content,
      notifyAll: body.notifyAll,
    }
    const result = await this.discussionService.createComment(input)

    return { id: result.id }
  }

  @Get('/:discussionId/comments/:commentId')
  async getDiscussionComment(@Param('commentId', ParseIntPipe) id: number) {
    return await this.discussionService.getComment(id, 'Discussion')
  }

  @Get('/:discussionId/answers/:answerId/comments/:commentId')
  async getAnswerComment(@Param('commentId', ParseIntPipe) id: number) {
    return await this.discussionService.getComment(id, 'Answer')
  }

  @HttpCode(200)
  @Post('/:discussionId/answers/:answerId/comments')
  async createAnswerComment(
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body(new ZodPipe(commentsPostRequestSchema)) body: CommentReqBody,
  ) {
    const input: CreateCommentInput = {
      targetId: answerId,
      targetType: 'Answer',
      comment: body.content,
      notifyAll: body.notifyAll,
    }
    const result = await this.discussionService.createComment(input)

    return { id: result.id }
  }

  @Put('/:discussionId/answers/:answerId/comments/:commentId')
  async editAnswerComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body(new ZodPipe(commentsPostRequestSchema)) body: CommentReqBody,
  ) {
    await this.handleCommentEdit(body, commentId, 'Answer')
  }

  private async handleCommentEdit(body: CommentReqBody, commentId: number, type: CommentableType) {
    const input: EditCommentInput = {
      id: commentId,
      comment: body.content,
      targetType: type,
    }

    return await this.discussionService.updateComment(input)
  }
}
