import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DxId } from '@shared/domain/entity/domain/dxid'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliController {
  constructor(private readonly cliService: CliService) {}

  @HttpCode(200)
  @Post('/nodes')
  async findNodes(@Body() body: CliNodeSearchDTO) {
    return this.cliService.findNodes(body)
  }

  @Get('/version/latest')
  getLatestVersion() {
    return { version: '2.7.1' }
  }

  @Get('/:uid/describe')
  async describeEntity(@Param('uid') uid: string) {
    return this.cliService.describeEntity(uid)
  }

  @Get('/job/:dxid/scope')
  async getJobScope(@Param('dxid') jobDxid: DxId<'job'>) {
    return this.cliService.getJobScope(jobDxid)
  }

  @Get('/spaces/:id/members')
  async listMembers(@Param('id') spaceId: number) {
    return this.cliService.listSpaceMembers(spaceId)
  }

  @Get('/spaces/:id/discussions')
  async listDiscussions(@Param('id') spaceId: number) {
    return this.cliService.listSpaceDiscussions(spaceId)
  }

  @Get('/discussions/:discussionId/describe')
  async describeDiscussion(@Param('discussionId') discussionId: number) {
    return this.cliService.describeDiscussion(discussionId)
  }
}
