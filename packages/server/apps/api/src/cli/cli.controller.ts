import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliController {
  constructor(private readonly cliService: CliService) {}

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Post('/nodes')
  async findNodes(@Body() body: CliNodeSearchDTO) {
    return this.cliService.findNodes(body)
  }

  @Get('/version/latest')
  getLatestVersion() {
    return { version: '2.7.3' }
  }

  @UseGuards(UserContextGuard)
  @Get('/:uid/describe')
  async describeEntity(@Param('uid') uid: string) {
    return this.cliService.describeEntity(uid)
  }

  @UseGuards(UserContextGuard)
  @Get('/job/:dxid/scope')
  async getJobScope(@Param('dxid') jobDxid: DxId<'job'>) {
    return this.cliService.getJobScope(jobDxid)
  }

  @UseGuards(UserContextGuard)
  @Get('/spaces/:id/members')
  async listMembers(@Param('id') spaceId: number) {
    return this.cliService.listSpaceMembers(spaceId)
  }

  @UseGuards(UserContextGuard)
  @Get('/spaces/:id/discussions')
  async listDiscussions(@Param('id') spaceId: number) {
    return this.cliService.listSpaceDiscussions(spaceId)
  }

  // TODO: REMOVE IN V3.0.0, migrated to /cli/{uid}/describe
  @UseGuards(UserContextGuard)
  @Get('/discussions/:discussionId/describe')
  async describeDiscussion(@Param('discussionId') discussionId: number) {
    return this.cliService.describeDiscussion(discussionId)
  }
}
