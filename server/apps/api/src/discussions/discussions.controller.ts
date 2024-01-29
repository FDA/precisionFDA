import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { CommentableType } from '@shared/domain/comment/comment.entity'
import { CreateCommentInput, EditCommentInput } from '@shared/domain/discussion/discussion.types'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { EntityFetcherService } from '@shared/services/entity-fetcher.service'
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
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
  ) {}

  @Get()
  async getDiscussions(@Query('scope') scope: string) {
    return await this.getDiscussionService().getDiscussions(scope)
  }

  @Get('/:id')
  async getDiscussion(@Param('id', ParseIntPipe) id: number) {
    return await this.getDiscussionService().getDiscussion(id)
  }

  // TODO Jiri: refactor - we are using noteId where API standard expects discussionId.
  //  This is because we use this for both discussions and answers attachments fetch via noteId.
  @Get('/:noteId/attachments')
  async getNoteAttachments(@Param('noteId', ParseIntPipe) noteId: number) {
    return await this.getDiscussionService().getAttachments(noteId)
  }

  @Get('/:id/answers/:answerId')
  async getAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return await this.getDiscussionService().getAnswer(answerId)
  }

  @HttpCode(201)
  @Post()
  async createDiscussion(
    @Body(new ZodPipe(discussionsPostRequestSchema)) body: DiscussionsPostReqBody,
  ) {
    const result = await this.getDiscussionService().createDiscussion(body)

    return { id: result.id }
  }

  @HttpCode(201)
  @Post('/:discussionId/answers')
  async createAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body(new ZodPipe(answerPostRequestSchema)) body: AnswerPostReqBody,
  ) {
    const result = await this.getDiscussionService().createAnswer({ discussionId, ...body })

    return { id: result.id }
  }

  @HttpCode(204)
  @Put('/:id')
  async updateDiscussion(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(discussionsPutRequestSchema)) body: DiscussionsPutReqBody,
  ) {
    await this.getDiscussionService().updateDiscussion(body)
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
    await this.getDiscussionService().updateAnswer({ discussionId, answerId, ...body })
  }

  @HttpCode(200)
  @Post('/:id/publish')
  async publishDiscussion(
    @Param('id', ParseIntPipe) discussionId: number,
    @Body(new ZodPipe(discussionsPublishRequestSchema)) body: DiscussionsPublishReqBody,
  ) {
    const result = await this.getDiscussionService().publishDiscussion({
      id: discussionId,
      toPublish: body.toPublish,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })

    return { id: discussionId, count: result }
  }

  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number) {
    await this.getDiscussionService().deleteDiscussion(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number) {
    await this.getDiscussionService().deleteAnswer(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/comments/:id')
  async deleteDiscussionComment(@Param('id', ParseIntPipe) id: number) {
    await this.getDiscussionService().deleteComment(id, 'Discussion')
  }

  @HttpCode(200)
  @Post('/:discussionId/answers/:id/publish')
  async publishAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DiscussionsPublishReqBody,
  ) {
    const result = await this.getDiscussionService().publishAnswer({
      discussionId,
      id,
      toPublish: body.toPublish,
      // TODO fix
      // @ts-ignore
      scope: body.scope,
    })

    return { id, count: result }
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:answerId/comments/:id')
  async deleteAnswerComment(@Param('id', ParseIntPipe) id: number) {
    await this.getDiscussionService().deleteComment(id, 'Answer')
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
    }
    const result = await this.getDiscussionService().createComment(input)

    return { id: result.id }
  }

  @Get('/:discussionId/comments/:commentId')
  async getDiscussionComment(@Param('commentId', ParseIntPipe) id: number) {
    return await this.getDiscussionService().getComment(id, 'Discussion')
  }

  @Get('/:discussionId/answers/:answerId/comments/:commentId')
  async getAnswerComment(@Param('commentId', ParseIntPipe) id: number) {
    return await this.getDiscussionService().getComment(id, 'Answer')
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
    }
    const result = await this.getDiscussionService().createComment(input)

    return { id: result.id }
  }

  @Put('/:discussionId/answers/:answerId/comments/:commentId')
  async editAnswerComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body(new ZodPipe(commentsPostRequestSchema)) body: CommentReqBody,
  ) {
    await this.handleCommentEdit(body, commentId, 'Answer')
  }

  private getDiscussionService() {
    // TODO completely replace with IoC
    const publisherService = new PublisherService(
      this.em,
      this.user,
      new PlatformClient(this.user.accessToken),
    )
    const fetcherService = new EntityFetcherService(this.em, this.user)

    return new DiscussionService(
      this.em,
      this.user,
      publisherService,
      fetcherService,
    )
  }

  private async handleCommentEdit(body: CommentReqBody, commentId: number, type: CommentableType) {
    const input: EditCommentInput = {
      id: commentId,
      comment: body.content,
      targetType: type,
    }

    return await this.getDiscussionService().updateComment(input)
  }
}
