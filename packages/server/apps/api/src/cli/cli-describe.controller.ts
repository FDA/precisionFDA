import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CliDescribeEntityResponse } from '@shared/domain/cli/dto/cli-describe.dto'
import { CliDescribeEntityFacade } from '../facade/cli/cli-describe-entity.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliDescribeController {
  constructor(private readonly cliDescribeEntityFacade: CliDescribeEntityFacade) {}

  @UseGuards(UserContextGuard)
  @Get('/:uid/describe')
  async describeEntity(@Param('uid') uid: string): Promise<CliDescribeEntityResponse> {
    return this.cliDescribeEntityFacade.describeEntity(uid)
  }
}
