import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { CliDiscussionDescribeDTO } from '@shared/domain/cli/dto/cli-describe.dto'
import { CliEditDiscussionDTO } from '@shared/domain/cli/dto/cli-edit-discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { CliCreateDiscussionReplyFacade } from '../facade/cli/cli-create-discussion-reply.facade'
import { CliDescribeEntityFacade } from '../facade/cli/cli-describe-entity.facade'
import { CliUpdateDiscussionFacade } from '../facade/cli/cli-update-discussion.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/discussions')
export class CliDiscussionsController {
  constructor(
    private readonly cliDescribeEntityFacade: CliDescribeEntityFacade,
    private readonly cliCreateDiscussionReplyFacade: CliCreateDiscussionReplyFacade,
    private readonly cliUpdateDiscussionFacade: CliUpdateDiscussionFacade,
    private readonly discussionService: DiscussionService,
  ) {}

  // TODO: REMOVE IN V3.0.0, migrated to /cli/{uid}/describe
  @UseGuards(UserContextGuard)
  @Get('/:discussionId/describe')
  async describeDiscussion(
    @Param('discussionId', ParseIntPipe) discussionId: number,
  ): Promise<CliDiscussionDescribeDTO> {
    return this.cliDescribeEntityFacade.describeDiscussion(discussionId)
  }

  // @deprecated Kept as alias for old CLI clients; new clients use POST /cli/replies.
  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/reply')
  async replyToDiscussion(@Body() body: CliCreateReplyDTO): Promise<{ url: string }> {
    const url = await this.cliCreateDiscussionReplyFacade.createReply(body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @Put('/:id')
  async editDiscussion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CliEditDiscussionDTO,
  ): Promise<{ url: string }> {
    const url = await this.cliUpdateDiscussionFacade.updateDiscussion(id, body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteDiscussion(id)
  }
}
