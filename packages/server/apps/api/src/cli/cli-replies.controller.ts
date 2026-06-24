import { Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { CliReplyCreateDTO } from '@shared/domain/cli/dto/cli-reply-create.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { CliCreateDiscussionReplyFacade } from '../facade/cli/cli-create-discussion-reply.facade'
import { CliUpdateDiscussionReplyFacade } from '../facade/cli/cli-update-discussion-reply.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/replies')
export class CliRepliesController {
  constructor(
    private readonly cliCreateDiscussionReplyFacade: CliCreateDiscussionReplyFacade,
    private readonly cliUpdateDiscussionReplyFacade: CliUpdateDiscussionReplyFacade,
    private readonly discussionService: DiscussionService,
  ) {}

  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/')
  async createReply(@Body() body: CliReplyCreateDTO): Promise<{ url: string }> {
    const url = await this.cliCreateDiscussionReplyFacade.createReplyV2(body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @Put('/:id')
  async editReply(@Param('id', ParseIntPipe) id: number, @Body() body: CliEditReplyDTO): Promise<{ url: string }> {
    const url = await this.cliUpdateDiscussionReplyFacade.updateReply(id, body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteReply(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteReply(id)
  }
}
